import uasyncio
import urequests
from async_urequests import urequests as aurequests
#import sys

def confirm_device(deviceId, serverDomainName, confirmationToken):
    response = urequests.post(
        'http://' + serverDomainName + '/devices/' + deviceId + '/confirm',
        headers={ 'content-type': 'application/json' },
        json={ 'confirmationToken': confirmationToken, 'macAddress': '00:B0:D0:63:C2:26' },
    )

    if response.status_code != 200:
        print('(Confirm) An error has occured.')  # type: ignore
        print(response)  # type: ignore

    deviceToken = response.json()['deviceToken']
    return deviceToken

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
    response = await aurequests.post(
        'http://' + serverDomainName + '/devices/' + deviceId + '/ping',
        headers={ 'authorization': 'Bearer ' + deviceToken }
    )
    if response.status_code == 200:
        print('Ping successful.')  # type: ignore
    else:
        print('(Ping) An error has occured.')  # type: ignore
        print(response)  # type: ignore

async def subscribe_to_data(deviceId, serverDomainName, deviceToken):
    while True:
        data = await get_message(serverDomainName, deviceId, deviceToken)  # type: ignore
        print(f"Data received : {data}") # type: ignore

async def periodically_send_ping(deviceId, serverDomainName, deviceToken):
    while True:
        await send_ping(serverDomainName, deviceId, deviceToken)
        await uasyncio.sleep(5)  # type: ignore

def connect(setupMessage):
    event_loop = uasyncio.get_event_loop()
    print("Connecting to server...")
    # [deviceId, serverDomainName, confirmationToken] = setupMessage.split('|')
    # deviceToken = confirm_device(deviceId, serverDomainName, confirmationToken)
    deviceId = "1"
    serverDomainName = "192.168.138.3:4000"
    deviceToken = "loremipsum"
    event_loop.create_task(subscribe_to_data(deviceId, serverDomainName, deviceToken))  # type: ignore
    event_loop.create_task(periodically_send_ping(deviceId, serverDomainName, deviceToken)) # type: ignore
    event_loop.run_forever()
    print("Server setup complete.")

async def loop(label, interval):
    count = 0
    while True:
        print(f"count[{label}]: {count}")
        count = count + 1
        await uasyncio.sleep(interval)

def main():
    print("Starting loop")
    event_loop = uasyncio.get_event_loop()
    event_loop.create_task(loop("A", 1))
    event_loop.create_task(loop("B", 2))
    event_loop.run_forever()
    print("Loop started!")

#message = sys.stdin.readline()  # type: ignore

# [receivedDeviceId, receivedServerDomainName, receivedConfirmationToken] = message.split('|')  # type: ignore

# receivedDeviceToken = confirmDevice(receivedDeviceId, receivedServerDomainName, receivedConfirmationToken)

# while True:
#     try:
#         subscribe(receivedServerDomainName, receivedDeviceId, receivedDeviceToken)
#         sendPing(receivedServerDomainName, receivedDeviceId, receivedDeviceToken)
#     except Exception as err: # type: ignore
#         print('Timeout occured. Retrying...') # type: ignore
