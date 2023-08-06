import gc
import uasyncio
import webrepl # type: ignore
from machine import Pin
#from libs.microdot import Microdot, send_file
from libs.tinyweb import webserver
from server_connection import ServerConnection, Proposal
from esp_network import EspStation, EspAccessPoint

style = """
<style>
    @font-face {font-family: "Inter";src: url("/public/Inter-Regular.ttf");}body {--color-main: #4f6aba;--color-main-dark: #1f3e9a;font-family: 'Inter';display: flex;flex-direction: column;margin: 0;position: relative;}#navbar {display: flex;gap: 1rem;background-color: white;height: 3rem;align-items: center;padding-left: 4rem;padding-right: 4rem;z-index: 100;filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));}#navbar img {aspect-ratio: 1;height: 2rem;}#navbar .product-name {font-weight: bolder;margin-right: 1rem;font-size: 1.1rem;color: var(--color-main);}#navbar a {color: black !important;cursor: pointer;text-decoration: none;}#navbar a.selected {box-sizing: border-box;margin-top: 2px;border-bottom: 2px solid var(--color-main);}#content {padding: 2rem 4rem;}.flex-space {flex-grow: 1;}label {display: flex;flex-direction: column;}label input {margin-top: 0.375rem;}input {padding: 0.5rem 0.75rem;font-size: 1rem;border-radius: 0.375rem;border: 2px solid gray;}form {max-width: 24rem;display: flex;flex-direction: column;gap: 1rem;}button {border-radius: 0.375rem;transition: all 0.2s;font-size: 1rem;padding: 0.75rem;border: 0;color: white;background-color: var(--color-main);cursor: pointer;}button:hover {background-color: var(--color-main-dark);}.hidden {display: none !important;}#verification-section {display: flex;flex-direction: column;gap: 1rem;}#verify-qr {width: 14rem;}#verification-section p {width: 24rem;color: gray;}#disconnect-section {display: flex;flex-direction: column;width: 24rem;gap: 1rem;}#disconnect-section p {width: 24rem;color: gray;}#disconnect-section button {align-self: flex-start;}p {margin: 0;}#network-forms-container {display: flex;flex-direction: column;gap: 2rem;}#network-forms-container form {margin-bottom: 1rem;} textarea {margin-top: 0.375rem;} textarea {padding: 0.5rem 0.75rem;font-size: 1rem;border-radius: 0.375rem;border: 2px solid gray;}
</style>
"""

def get_navbar(activePage):
    return  f"""
<div id="navbar">
  <img src="/public/capstonelogo.png" />
  <span class="product-name">Smart Lock</span>
  <a href="/network" class="{"selected" if activePage == "network" else ""}">Network</a>
  <a href="/connect" class="{"selected" if activePage == "connection" else ""}">Connection</a>
  <span class="flex-space"></span>
  <span><b>Status : </b><span id="connection-status">N/A</span></span>
</div>
"""

connection_status_script =  """
<script>
  const connectionStatusEl = document.getElementById("connection-status")
  var updateConnectionStatus = async (force=false) => {
    let output = null
    while (!output) {
      const response = await fetch("/api/connection-status", { method: "GET" })
      const status = await response.text()
      if (status) {
        output = status
        connectionStatusEl.innerText = status
      }
      if (force) output = status
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    return output
  }
  updateConnectionStatus()
</script>
"""

async def start_server(event_loop, espAccessPoint: EspAccessPoint, espStation: EspStation, stationServerMode):
    print('Starting web server...')
    serverIpAddr = espStation.station.ifconfig()[0] if stationServerMode else espAccessPoint.accessPoint.ifconfig()[0]
    print(f'Web server IP address : {serverIpAddr}')

    app = webserver(loop=event_loop, debug=True, max_concurrency=6)

    @app.route('/health')
    async def healthCheck(_, response):
        print('Health check requested')
        await response.start_html()
        await response.send('Everything is fine.')

    publicAssets = ["qrcode.js", "Inter-Regular.ttf", "capstonelogo.png"]
    index = 0
    for index, asset in enumerate(publicAssets):
        print(f"Registering route for public asset {asset}.")
        exec(f"""
@app.route(f'/public/{asset}')
async def get_asset_{index}(request, response):
    print(f'Public asset requested ({asset}).')
    await response.send_file(f'./public/{asset}')
""",
        { "app": app }
        )

    @app.route('/')
    async def redirectToNetwork(_, response):
        await response.redirect('/network')

    @app.route('/network')
    async def networkPage(_, response):
        print('Network page requested.')
        global style
        global connection_status_script
        await response.start_html()
        html =  """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>[Network] Smart Lock</title>
    %(style)s
  </head>
  <body>
    %(navbar)s
    <div id="content">
      <div id="network-forms-container">
        <div><b>Station Settings</b></div>
        <form id="station-form">
          <label>SSID
            <input name="ssid" required />
          </label>
          <label>Password
            <input name="pass" type="password" required />
          </label>
          <button type="submit">Connect</button>
        </form>

        <div><b>Access Point Settings</b></div>
        <form id="ap-form">
          <label>SSID
            <input name="ssid" required />
          </label>
          <label>Password
            <input name="pass" type="password" required />
          </label>
          <button type="submit">Set Credentials</button>
        </form>
      </div>
    </div>
    <script src="/public/qrcode.js"></script>
    %(statusScript)s
    <script>
      const stationFormEl = document.getElementById("station-form")
      const apFormEl = document.getElementById("ap-form")

      stationFormEl.addEventListener("submit", async (e) => {
        try {
          e.preventDefault()
          const { ssid, pass } = e.target
          const response = await fetch("/api/configure-station", {
            method: "POST",
            body: `${ssid.value},${pass.value}`
          })
          if (response.status === 200) {
            alert(await response.text())
            e.target.reset()
          } else {
            console.error(response)
          }
        } catch(err) {
          console.error(err)
          alert('An error has occured.')
        }
      })

      apFormEl.addEventListener("submit", async (e) => {
        e.preventDefault()
        const { ssid, pass } = e.target
        fetch("/api/configure-access-point", {
          method: "POST",
          body: `${ssid.value},${pass.value}`
        })
        alert("Access point credentials changed. Please reconnect.")
        location.reload()
      })
    </script>
  </body>
</html>
""" % { "style": style, "navbar": get_navbar("network"), "statusScript": connection_status_script }
        await response.send(html)

    @app.route('/connect')
    async def connectPage(_, response):
        gc.collect()
        print("Connect page requested.")
        nonlocal serverConnection
        global style
        global connection_status_script
        await response.start_html()
        html =  """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>[Connection] Smart Lock</title>
    %(style)s
  </head>
  <body>
      %(navbar)s
      <div id="content">
        <form id="connect-form" class="hidden">
          <label>Server Domain Name/IP Address
            <input name="serverDomain" required />
          </label>
          <label>Server Public Key Certificate
            <textarea name="cert" rows="10"></textarea>
          </label>
          <button type="submit">Connect</button>
        </form>
        <div id="verification-section" class="hidden">
          <span><b>Device ID :</b> <span id="device-id">N/A</span></span>
          <img id="verify-qr" />
          <p>
            Scan the QR code from the smart lock settings modal 
            in the admin web page or enter the device ID directly.
          </p>
        </div>
        <div id="disconnect-section" class="hidden">
          <p>
            This device is already connected to a server.
          </p>
          <div><b>Server Address :</b> <span id="server-address">N/A</span></div>
          <button id="disconnect-button">
            Disconnect
          </button>
        </div>
      </div>
      <script src="/public/qrcode.js"></script>
      %(statusScript)s
      <script>
        const formEl = document.getElementById("connect-form")
        const deviceIdEl = document.getElementById("device-id")
        const qrImgEl = document.getElementById("verify-qr")
        const disconnectButtonEl = document.getElementById("disconnect-button")

        const showSection = (elementId) => {
          const elementIds = ["connect-form", "verification-section", "disconnect-section"]
          elementIds
            .filter(id => id !== elementId)
            .map(id => document.getElementById(id))
            .forEach(element => element.classList.add("hidden"))
          document.getElementById(elementId).classList.remove("hidden")
        }

        const openDisconnectSection = async () => {
          showSection("disconnect-section")
          const response = await fetch("/api/server-address", { method: "GET" })
          const serverAddress = await response.text()
          document.getElementById("server-address").innerText = serverAddress
        }

        const openConnectSection = () => {
          showSection("connect-form")
          formEl.reset()
          deviceIdEl.innerText = "N/A"
          qrImgEl.src = ""
        }

        const showQrCode = async (content) => {
          if (!content) return
          const qrDataUrl = await QRCode.toDataURL(content, { width: 1024, margin: 0 })
          qrImgEl.src = qrDataUrl
        }

        disconnectButtonEl.addEventListener("click", async (e) => {
          await fetch("/api/disconnect", { method: "POST" })
          updateConnectionStatus()
          openConnectSection()
        })

        formEl.addEventListener("submit", async (e) => {
          try {
            e.preventDefault()
            const { serverDomain, cert } = e.target
            const response = await fetch("/api/connect", {
                method: "POST",
                body: `${serverDomain.value}_${cert.value}`
            })
            const deviceId = await response.text()

            if (deviceId === "nodevice") {
              alert("Error sending device proposal to the server.")
              return
            }

            showSection("verification-section")
            deviceIdEl.innerText = deviceId
            showQrCode(deviceId)

            let status = "Configuring"
            let tries = 0
            const MAX_STATUS_RETRIES = 600
            while (status === "Configuring") {
              if (tries > MAX_STATUS_RETRIES) break
              tries++
              status = await updateConnectionStatus()
              await new Promise(resolve => setTimeout(resolve, 500))
            }
            if (status === "Connected") {
              openDisconnectSection()
            } else {
              openConnectSection()
            }
          } catch(e) {
            console.error(e)
            device.IdEl.innerText = "Error!"
          }
        })

        const main = async () => {
          const status = await updateConnectionStatus(true)
          if (status === "Connected" || status === "Disconnected") {
            openDisconnectSection()
          } else {
            openConnectSection()
            if (status === "Connecting") {
              await fetch("/api/disconnect", { method: "POST" })
              await updateConnectionStatus()
            }
          }
        }

        main()
      </script>
  </body>
</html>
""" % { "style": style, "navbar": get_navbar("connection"), "statusScript": connection_status_script }
        await response.send(html)

    proposal: Proposal = None
    serverConnection: ServerConnection = None

    @app.route('/api/connection-status', methods=['GET'])
    async def getConnectionStatus(_, response):
        print('Connection status requested.')
        nonlocal proposal

        await response.start_html()
        if proposal:
            await response.send('Configuring')
            return

        if not serverConnection:
            await response.send('Unconnected')
            return

        await response.send(serverConnection.connectionStatus)

    @app.route('/api/server-address', methods=['GET'])
    async def getServerAddress(_, response):
        print('Server address requested.')
        nonlocal serverConnection
        await response.start_html()
        if not serverConnection:
            await response.send('N/A')
            return

        await response.send(serverConnection.proposal.serverDomainName)

    @app.route('/api/disconnect', methods=['POST'])
    async def disconnectDevice(_, response):
        print('Disconnect request received.')
        nonlocal serverConnection
        nonlocal espStation

        if not espStation.check_connection():
            raise Exception('Station not connected.')
        
        if serverConnection:
            serverConnection.destroy()
            serverConnection = None

        await response.start_html()
        await response.send('Success')

    relay = Pin(14, Pin.OUT)
    led_green = Pin(27, Pin.OUT)
    def handleMessage(message):
        print(f"Received message from the server : {message}")
        nonlocal relay
        nonlocal led_green
        if message == "lock":
            print('Relay turned on.')
            relay.value(1)
            led_green.value(0)
        if message == "unlock":
            print('Relay turned off.')
            relay.value(0)
            led_green.value(1)

    @app.route('/api/connect', methods=['POST'], save_headers=['Content-Length'])
    async def setupConnection(request, response):
        print('Received connect request.')
        rawData = await request.read_data()
        [serverDomainName, cert] = rawData.split('_')
        print(f'Attempting to connect to {serverDomainName} with public key cert {cert}.')

        nonlocal proposal
        nonlocal serverConnection
        nonlocal handleMessage
        nonlocal espStation

        if not espStation.check_connection():
            raise Exception('Station not connected.')

        if proposal:
            proposal.cancel()
            proposal = None

        if serverConnection:
            serverConnection.destroy()
            serverConnection = None

        def handleAccepted(acceptedProposal: Proposal):
            print('Proposal acceptance callback fired.')
            nonlocal serverConnection
            nonlocal handleMessage
            nonlocal proposal
            nonlocal espStation

            proposal = None
            serverConnection = ServerConnection(acceptedProposal, handleMessage)
            serverConnection.start()
            espStation.onReconnect = lambda _ : serverConnection.start()
            espStation.onDisconnect = lambda _ : serverConnection.stop()

        def handleRejected():
            print('Proposal rejection callback fired.')
            nonlocal proposal
            proposal = None

        proposal = Proposal(serverDomainName, cert, event_loop, espStation, handleAccepted, handleRejected)

        deviceID = await proposal.propose()
        print(f'Sending back device id : {deviceID}')

        if deviceID is None:
            deviceID = 'nodevice'

        await response.start_html()
        await response.send(deviceID)

    @app.route('/api/configure-station', methods=['POST'], save_headers=['Content-Length'])
    async def configureStation(request, response):
        print('Received station configuration request.')
        content = await request.read_data()
        [ssid, password] = content.split(',')
        print(f'Attempting to connect the station to {ssid}:{password}.')

        nonlocal serverConnection
        nonlocal espStation

        success = await espStation.connect(ssid, password)

        await response.start_html()
        await response.send('Success' if success else 'Failed')

    @app.route('/api/configure-access-point', methods=['POST'], save_headers=['Content-Length'])
    async def configureAccessPoint(request, response):
        print('Received access point configuration request.')
        nonlocal event_loop
        
        content = await request.read_data()
        [ssid, password] = content.split(',')
        print(f'Attempting to change the access point configuration to {ssid}:{password}.')

        nonlocal espAccessPoint

        event_loop.create_task(espAccessPoint.start(ssid, password))

    app.run(host=serverIpAddr, port=8081)
    print("Web server started.")

async def start_webrepl():
    print('Starting webrepl...')
    webrepl.start()

async def main(event_loop):
    DEVELOPMENT_MODE = False
    STATION_SERVER_MODE = True

    station = EspStation()
    if STATION_SERVER_MODE:
        await station.connect('gldnpz', 'sapigemuk55555')

    accessPoint = EspAccessPoint()
    await accessPoint.start()

    event_loop.create_task(start_server(event_loop, accessPoint, station, STATION_SERVER_MODE))

    if DEVELOPMENT_MODE:
        event_loop.create_task(start_webrepl())

def async_root():
    print("Starting program.")
    event_loop = uasyncio.get_event_loop()
    event_loop.create_task(main(event_loop))
    print("Starting event loop.")
    event_loop.run_forever()

print('main.py loaded.')
async_root()
