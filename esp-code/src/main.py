import uasyncio
from async_urequests import urequests as aurequests
#import sys

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

async def sync_command(serverDomainName, deviceId, deviceToken):
    response = await aurequests.get(
        f'http://{serverDomainName}/devices/{deviceId}/sync-command',
        headers={ 'authorization': f'Bearer {deviceToken}'}
    )

    print(f"Synced command : {response.text}")

async def subscribe_to_data(serverDomainName, deviceId, deviceToken):
    while True:
        data = await get_message(serverDomainName, deviceId, deviceToken)  # type: ignore
        print(f"Data received : {data}") # type: ignore

async def periodically_send_ping(serverDomainName, deviceId,  deviceToken):
    while True:
        await send_ping(serverDomainName, deviceId, deviceToken)
        await uasyncio.sleep(5)  # type: ignore

async def connect(setupMessage, event_loop):
    print("Connecting to server...")
    # [deviceId, serverDomainName, confirmationToken] = setupMessage.split('|')
    # deviceToken = confirm_device(deviceId, serverDomainName, confirmationToken)
    serverDomainName = "192.168.164.3:4000"
    id, verificationToken = await propose_device(serverDomainName)
    print('Waiting proposal verification...')
    proposalStatus = await get_proposal_status(serverDomainName, id)
    print(f'Proposal status : {proposalStatus}')
    if proposalStatus == 'true':
        deviceToken = await get_device_token(serverDomainName, verificationToken)
        print(f'Device token : {deviceToken}')
        await sync_command(serverDomainName, id, deviceToken)
        event_loop.create_task(periodically_send_ping(serverDomainName, id, deviceToken))
        event_loop.create_task(subscribe_to_data(serverDomainName, id, deviceToken))

    # event_loop.create_task(subscribe_to_data(deviceId, serverDomainName, deviceToken))  # type: ignore
    # event_loop.create_task(periodically_send_ping(deviceId, serverDomainName, deviceToken)) # type: ignore
    
    print("Server setup complete.")

def main():
    event_loop = uasyncio.get_event_loop()
    event_loop.create_task(connect("", event_loop)) # type: ignore
    event_loop.run_forever()
