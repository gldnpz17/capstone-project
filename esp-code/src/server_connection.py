import gc
import ubinascii
import uasyncio
from libs.async_urequests import urequests as aurequests
from common import CancellationToken
from esp_network import EspStation
import utime
import ntptime
import machine

class Proposal:
    def __init__(self, serverDomainName, cert, event_loop, espStation: EspStation, handleAccepted, handleRejected):
        self.serverDomainName = serverDomainName
        self.cert = cert
        self.espStation = espStation
        self.event_loop = event_loop
        self.handleAccepted = handleAccepted
        self.handleRejected = handleRejected

        self.deviceId = None
        self.verificationToken = None
        self.deviceToken = None
        self.isAccepted = False
        self.cancellationToken: CancellationToken = None

        self.PROPOSAL_MAX_RETRIES = 30

    def format_mac_address(self, macAddress):
        return ":".join([macAddress[i:i + 2] for i in range(0, len(macAddress), 2)])

    async def get_device_token(self):
        response = await aurequests.post(
            f'https://{self.serverDomainName}/auth/get-device-token',
            headers={ 'Content-Type': 'application/json' },
            data=f'{{ "verificationToken": "{self.verificationToken}" }}',
            cert=self.cert
        )

        return response.text

    async def get_proposal_status(self):
        retries = 0
        response = None
        while not response:
            try:
                if retries > self.PROPOSAL_MAX_RETRIES:
                    print("get_proposal_status max retries reached.")
                    return None
                retries = retries + 1
                response = await aurequests.get(
                    f'https://{self.serverDomainName}/devices/{self.deviceId}/proposal-status',
                    cert=self.cert
                )
            except aurequests.TimeoutError: # type: ignore
                print(f"Free memory: {gc.mem_free()}")
                print("get_proposal_status timed out. retrying...")

        return response.text

    async def handle_proposition(self):
        try:
            status = await self.get_proposal_status()
            print(f"Proposal status received. status: {status}.")
            if status == "true":
                deviceToken = await self.get_device_token()
                self.deviceToken = deviceToken
                if not self.cancellationToken.cancelled:
                    self.cancellationToken = None
                    self.handleAccepted(self)
            else:
                if not self.cancellationToken.cancelled:
                    self.cancellationToken = None
                    self.handleRejected()
        except Exception as err: # type: ignore
            print(err)
            if not self.cancellationToken:
                return
            if not self.cancellationToken.cancelled:
                self.cancellationToken = None
                self.handleRejected()

    async def propose_device(self):
        macAddress = self.espStation.station.config('mac')
        formattedMacAddress = self.format_mac_address(ubinascii.hexlify(macAddress).decode().upper())

        response = await aurequests.post(
            f'https://{self.serverDomainName}/devices/propose',
            headers={ 'Content-Type': 'application/json' },
            data=f'{{ "macAddress": "{formattedMacAddress}" }}',
            cert=self.cert
        )

        result = response.json
        deviceId = result["id"]
        verificationToken = result["verificationToken"]
        print(f'Device proposed. ID: {result["id"]}')

        return deviceId, verificationToken

    def cancel(self):
        if self.cancellationToken:
            self.cancellationToken.cancel()

    async def propose(self):
        print('[ServerConnection] Proposing device connection...')
        try:
            self.cancellationToken = CancellationToken()
            deviceId, verificationToken = await self.propose_device()
            self.deviceId = deviceId
            self.verificationToken = verificationToken

            self.event_loop.create_task(self.handle_proposition())

            return deviceId
        except Exception as err: # type: ignore
            print(err)
            print('Error proposing device.')
            return None

class ServerConnection:
    def __init__(self, proposal: Proposal, messageHandler):
        print('[ServerConnection] Creating server connection...')
        self.proposal = proposal
        self.messageHandler = messageHandler

        self.connectionStatus = "Connected"
        self.cancellationToken: CancellationToken = None

        self.TIMESTAMP_ENABLED = True
        self.message_count = 0
        # self.report_times = []

        if self.TIMESTAMP_ENABLED:
            ntptime.host = 'time.nist.gov'
            ntptime.settime()
            print('NTP time synchronized.')

    async def send_ping(self):
        response = None
        while not response:
            try:
                response = await aurequests.post(
                    f'https://{self.proposal.serverDomainName}/devices/{self.proposal.deviceId}/ping',
                    headers={ 'authorization': f'Bearer {self.proposal.deviceToken}'},
                    cert=self.proposal.cert
                )
            except aurequests.TimeoutError: # type: ignore
                print("send_ping timed out. retrying...")

        if response.status_code == 200:
            self.connectionStatus = "Connected"
            print('Ping successful.')  # type: ignore
        else:
            self.connectionStatus = "Disconnected"
            print('(Ping) An error has occured.')  # type: ignore
            print(response)  # type: ignore

    async def sync_command(self):
        response = await aurequests.get(
            f'https://{self.proposal.serverDomainName}/devices/{self.proposal.deviceId}/sync-command',
            headers={ 'authorization': f'Bearer {self.proposal.deviceToken}'},
            cert=self.proposal.cert
        )

        print(f"Synced command : {response.text}")
        self.messageHandler(response.text)

    async def get_message(self):
        response = None
        while not response:
            try:
                response = await aurequests.get(
                    f'https://{self.proposal.serverDomainName}/devices/{self.proposal.deviceId}/messages/subscribe', 
                    headers={ 'authorization': f'Bearer {self.proposal.deviceToken}' },
                    cert=self.proposal.cert
                )
            except aurequests.TimeoutError: # type: ignore
                print("get_message timed out. retrying...")

        if response.status_code == 502:
            raise Exception("Timeout code received.")  # type: ignore
        elif response.status_code == 200:
            epoch_offset = 946684800000 # Offset between 1 Jan 2000 and 1 Jan 1970.
            # Timestamp in milliseconds since unix epoch.
            print(utime.time_ns())
            print(utime.time())
            timestamp = round(epoch_offset + (utime.time_ns() / 10**6))
            print(f'Message received. Message: {response.text}. Timestamp: {timestamp}.')

            if self.TIMESTAMP_ENABLED:
                self.message_count = self.message_count + 1
                print(f'Message(s) received: {self.message_count}')
                # start = utime.time_ns()
                # await aurequests.post(
                #     f'https://{self.proposal.serverDomainName}/devices/logtime/{self.timestamp_count}'
                # )
                # end = utime.time_ns()
                # report_time = round((end - start) / 10**6) # Report time in ms.
                # self.report_times.append(report_time)
                # self.timestamp_count = self.timestamp_count + 1
                # print(f'Timestamp logged. Report time: {report_time} ms.')

            return response.text
        else:
            print('(Subscribe) An error has occured.')  # type: ignore
            print(response)  # type: ignore

    async def subscribe_to_data(self, cancellationToken: CancellationToken):
        while True:
            try:
                gc.collect()
                if cancellationToken.cancelled:
                    return
                data = await self.get_message()
                print(f"Data received : {data}") # type: ignore
                self.messageHandler(data)
            except Exception as err: # type: ignore
                print(err)
                print(f"Free memory: {gc.mem_free()}")
                await uasyncio.sleep(0.5)
                print('Unhandled error subscribing to server data. Retrying...')

    async def periodically_send_ping(self, cancellationToken: CancellationToken):
        while True:
            try:
                gc.collect()
                if cancellationToken.cancelled:
                    return
                await self.send_ping()
                await uasyncio.sleep(5)  # type: ignore
            except Exception as err: # type: ignore
                print(err)
                print(f"Free memory: {gc.mem_free()}")
                await uasyncio.sleep(0.5)
                print('Unhandled error sending ping to the server. Retrying...')

    def stop(self):
        if self.cancellationToken:
            self.cancellationToken.cancel()
            self.cancellationToken = None
            self.connectionStatus = "Disconnected"

    def start(self):
        self.stop()

        self.cancellationToken = CancellationToken()
        self.proposal.event_loop.create_task(self.periodically_send_ping(self.cancellationToken))
        self.proposal.event_loop.create_task(self.subscribe_to_data(self.cancellationToken))
        gc.collect()

    def destroy(self):
        print('[ServerConnection] Destroying server connection...')
        self.connectionStatus = "Unconnected"
        self.stop()

print('server_connection.py loaded.')
