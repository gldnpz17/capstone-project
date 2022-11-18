import gc
import network
import ubinascii

gc.collect()

print('Program started.')  # type: ignore

ssid = 'gldnpz'
password = 'sapigemuk55555'

station = network.WLAN(network.STA_IF)  # type: ignore
station.active(True)
station.connect(ssid, password)
while not station.isconnected():
    pass

print(f'Station : {station.ifconfig()}')  # type: ignore

mac_addr = station.config('mac')
print(f'Mac address : {ubinascii.hexlify(mac_addr).decode()}')

accessPoint = network.WLAN(network.AP_IF)
accessPoint.active(True)
accessPoint.config(essid='ESP32 AP', authmode=network.AUTH_WPA2_PSK, password='loremipsum123')

while not accessPoint.active():
    pass

print(f'AP : {accessPoint.ifconfig()}')
