import uasyncio
#from libs.microdot import Microdot, send_file
from libs.tinyweb import webserver
from libs.async_urequests import urequests as aurequests
from machine import Pin

async def propose_device(serverDomainName):
    response = await aurequests.post(
        f'http://{serverDomainName}/devices/propose',
        headers={ 'Content-Type': 'application/json' },
        data=f'{{ "macAddress": "0C:B8:15:F3:F7:B4" }}'
    )

    result = response.json
    id = result["id"]
    verificationToken = result["verificationToken"]
    print(f'Device proposed. ID: {result["id"]}')

    return id, verificationToken

async def get_proposal_status(serverDomainName, deviceId):
    response = None
    while not response:
        try:
            response = await aurequests.get(f'http://{serverDomainName}/devices/{deviceId}/proposal-status')
        except aurequests.TimeoutError: # type: ignore
            print("get_proposal_status timed out. retrying...")
        
    return response.text

async def get_device_token(serverDomainName, verificationToken):
    response = await aurequests.post(
        f'http://{serverDomainName}/auth/get-device-token',
        headers={ 'Content-Type': 'application/json' },
        data=f'{{ "verificationToken": "{verificationToken}" }}'
    )

    return response.text

async def get_message(serverDomainName, deviceId, deviceToken):
    response = None
    while not response:
        try:
            response = await aurequests.get('http://' + serverDomainName + '/devices/' + deviceId + '/messages/subscribe', headers={ 'authorization': 'Bearer ' + deviceToken })
        except aurequests.TimeoutError: # type: ignore
            print("get_message timed out. retrying...")

    if response.status_code == 502:
        raise Exception()  # type: ignore
    elif response.status_code == 200:
        return response.text
    else:
        print('(Subscribe) An error has occured.')  # type: ignore
        print(response)  # type: ignore

async def send_ping(serverDomainName, deviceId, deviceToken):
    response = None
    while not response:
        try:
            response = await aurequests.post(
                f'http://{serverDomainName}/devices/{deviceId}/ping',
                headers={ 'authorization': f'Bearer {deviceToken}'}
            )
        except aurequests.TimeoutError: # type: ignore
            print("send_ping timed out. retrying...")

    if response.status_code == 200:
        print('Ping successful.')  # type: ignore
    else:
        print('(Ping) An error has occured.')  # type: ignore
        print(response)  # type: ignore

async def sync_command(serverDomainName, deviceId, deviceToken, messageHandler):
    response = await aurequests.get(
        f'http://{serverDomainName}/devices/{deviceId}/sync-command',
        headers={ 'authorization': f'Bearer {deviceToken}'}
    )

    print(f"Synced command : {response.text}")
    messageHandler(response.text)

async def subscribe_to_data(serverDomainName, deviceId, deviceToken, messageHandler):
    while True:
        try:
            data = await get_message(serverDomainName, deviceId, deviceToken)  # type: ignore
            print(f"Data received : {data}") # type: ignore
            messageHandler(data)
        except Exception: # type: ignore
            print('Unhandled error subscribing to server data. Retrying...')

async def periodically_send_ping(serverDomainName, deviceId, deviceToken):
    while True:
        try:
            await send_ping(serverDomainName, deviceId, deviceToken)
            await uasyncio.sleep(5)  # type: ignore
        except Exception: # type: ignore
            print('Unhandled error sending ping to the server. Retrying...')

async def connect_device(serverDomainName, deviceId, verificationToken, messageHandler, connectHandler, event_loop):
    print('Waiting proposal verification...')
    proposalStatus = await get_proposal_status(serverDomainName, deviceId)
    print(f'Proposal status : {proposalStatus}')
    connectHandler(proposalStatus)
    if proposalStatus == 'true':
        deviceToken = await get_device_token(serverDomainName, verificationToken)
        print(f'Device token : {deviceToken}')
        await sync_command(serverDomainName, deviceId, deviceToken, messageHandler)
        event_loop.create_task(periodically_send_ping(serverDomainName, deviceId, deviceToken))
        event_loop.create_task(subscribe_to_data(serverDomainName, deviceId, deviceToken, messageHandler))


class ServerConnection:
    def __init__(self, serverDomainName, messageHandler, event_loop):
        print('[ServerConnection] Creating server connection...')
        self.serverDomainName = serverDomainName
        self.messageHandler = messageHandler
        self.event_loop = event_loop
        self.connection_status = None

    def setStatus(self, status):
        self.connection_status = status

    async def propose(self):
        print('[ServerConnection] Proposing device connection...')
        id, verificationToken = await propose_device(self.serverDomainName)
        self.verificationToken = verificationToken
        self.connectionTask = self.event_loop.create_task(connect_device(
            self.serverDomainName,
            id,
            verificationToken,
            self.messageHandler,
            self.setStatus,
            self.event_loop
        ))
        return id

    # TODO: Fix this shit polling technique. Fucking unelegant.
    async def get_connection_status(self):
        print('[ServerConnection] Listening for connection status.')
        while not self.connection_status:
            await uasyncio.sleep(0.5)
            print('[ServerConnection] Repolling connection status.')
        return self.connection_status

    async def destroy(self):
        print('[ServerConnection] Destroying server connection...')
        self.connectionTask.cancel()

async def start_server(event_loop):
    print('Starting web server...')

    serverConnection = None

    app = webserver(loop=event_loop)
    
    @app.route('/health')
    async def healthCheck(request, response):
        print('Health check requested')
        await response.start_html()
        await response.send('Everything is fine.')

    @app.route('/public/qrcode.js')
    async def getQrCodeLibrary(request, response):
        print('QR Code library requested.')
        await response.send_file('./public/qrcode.js')

    @app.route('/setup')
    async def setupPage(request, response):
        await response.start_html()
        await response.send(
            """
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>[Setup] Smart Lock</title>
                </head>
                <body>
                    <div><b>Status:</b> <span id="connection-status">N/A</span></div>
                    <form id="connect-form">
                        <label>Server Domain Name/IP Address
                            <input name="serverDomain" />
                        </label>
                        <button type="submit">Connect</button>
                    </form>
                    <div><b>Device ID:</b> <span id="device-id"></span></div>
                    <script src="/public/qrcode.js"></script>
                    <script>
                        const formEl = document.getElementById("connect-form")
                        const deviceIdEl = document.getElementById("device-id")
                        const connectionStatusEl = document.getElementById("connection-status")

                        const updateConnectionStatus = async () => {
                            const response = await fetch("/api/connection-status", { method: "GET" })
                            const status = await response.text()
                            if (status === "true") {
                                connectionStatusEl.innerText = "Connected"
                            } else {
                                connectionStatusEl.innerText = "Unconnected"
                            }
                        }

                        formEl.addEventListener("submit", async (e) => {
                            try {
                                e.preventDefault()
                                const { serverDomain } = e.target
                                const response = await fetch("/api/connect", {
                                    method: "POST",
                                    body: serverDomain.value
                                })
                                const deviceId = await response.text()
                                deviceIdEl.innerText = deviceId
                                await updateConnectionStatus()
                            } catch(e) {
                                console.error(e)
                                device.IdEl.innerText = "Error!"
                            }
                        })

                        updateConnectionStatus()
                    </script>
                </body>
            </html>
            """
        )

    @app.route('/api/connection-status', methods=['GET'])
    async def getConnectionStatus(request, response):
        print('Connection status requested.')
        await response.start_html()
        if not serverConnection:
            await response.send('false')
            return

        status = await serverConnection.get_connection_status()

        await response.send(status)

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
        serverDomainName = await request.read_data()
        print(f'Attempting to connect to {serverDomainName}.')
        nonlocal serverConnection
        nonlocal handleMessage
        if serverConnection:
            serverConnection.destroy()
        serverConnection = ServerConnection(
            serverDomainName,
            handleMessage, 
            event_loop
        )
        id = await serverConnection.propose()
        print(f'Sending back device id : {id}')
        await response.start_html()
        await response.send(id)

    app.run(host='0.0.0.0', port=8081)
    print("Web server started.")

def main():
    event_loop = uasyncio.get_event_loop()
    # event_loop.create_task(connect(event_loop)) # type: ignore
    event_loop.create_task(start_server(event_loop))
    print("Starting event loop.")
    event_loop.run_forever()

print('main.py loaded.')
main()