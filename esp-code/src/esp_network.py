import network
import utime
import uasyncio

class EspStation:
    def __init__(self):
        self.CONNECT_TIMEOUT = 10

        self.station = network.WLAN(network.STA_IF)  # type: ignore
        self.station.active(True)
        self.onReconnect = lambda *args: None
        self.onDisconnect = lambda *args: None

    def is_connected(self):
        return self.station.isconnected()

    async def check_connection(self):
        wasConnected = False
        while True:
            isConnected = self.is_connected()
            if isConnected and not wasConnected and self.onReconnect:
                print('Station reconnected.')
                self.onReconnect()
            if wasConnected and not isConnected and self.onDisconnect:
                print('Station disconnected.')
                self.onDisconnect()

    async def connect(self, ssid, password):
        print(f'Connecting to wifi network. ssid: {ssid}, password: {password}.')
        try:
            if self.is_connected():
                print('Disconnecting from wifi network.')
                self.station.disconnect()
                start = utime.time()
                while self.is_connected():
                    now = utime.time()
                    if now > start + self.CONNECT_TIMEOUT:
                        print('Station disconnect timeout.')
                        return False
                    await uasyncio.sleep(0.5)

            print('Connecting to wifi network.')
            self.station.connect(ssid, password)
            start = utime.time()
            while not self.is_connected():
                now = utime.time()
                if now > start + self.CONNECT_TIMEOUT:
                    print('Station connect timeout. Disconnecting...')

                    # TODO: Could be refactored.
                    self.station.disconnect()
                    start = utime.time()
                    while self.is_connected():
                        now = utime.time()
                        if now > start + self.CONNECT_TIMEOUT:
                            print('Station disconnect timeout.')
                            return False
                        await uasyncio.sleep(0.5)
                    
                    return False
                await uasyncio.sleep(0.5)

            print('Connected to wifi network.')
            print(f'Station ifconfig : {self.station.ifconfig()}')  # type: ignore
            return True
        except Exception: # type: ignore
            return False

class EspAccessPoint:
    def __init__(self):
        self.accessPoint = network.WLAN(network.AP_IF)
        self.accessPoint.active(True)

        self.DEFAULT_SSID = "SmartLockAP"
        self.DEFAULT_PASSWORD = "SmartLock"
        self.START_TIMEOUT = 10

    async def start(self, ssid=None, password=None):
        print('Starting access point....')
        try:
            self.accessPoint.config(
                essid=ssid if ssid else self.DEFAULT_SSID,
                authmode=network.AUTH_WPA2_PSK,
                password=password if password else self.DEFAULT_PASSWORD
            )

            await uasyncio.sleep(1) # For some reason if we don't wait it won't start. Needs further investigation.

            start = utime.time()
            while not self.accessPoint.active():
                now = utime.time()
                if now > start + self.START_TIMEOUT:
                    print('Access point start timeout.')
                    raise Exception('Access point timeout')
                await uasyncio.sleep(0.5)

            print(f'Access point ifconfig : {self.accessPoint.ifconfig()}')
            return True

        except Exception: # type: ignore
            print('Something went wrong when configuring the AP. Resetting...')
            await self.start(self.DEFAULT_SSID, self.DEFAULT_PASSWORD)
            return False

print('esp_network.py loaded.')
