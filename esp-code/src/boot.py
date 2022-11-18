import gc
import network

gc.collect()

print('Program started.')  # type: ignore

ssid = 'gldnpz'
password = 'sapigemuk55555'

station = network.WLAN(network.STA_IF)  # type: ignore
station.active(True)
station.connect(ssid, password)
while not station.isconnected():
    pass

print('Connection successful')  # type: ignore
print(station.ifconfig())  # type: ignore
