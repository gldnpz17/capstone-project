import requests

def subscribe(serverDomainName, deviceId, deviceToken):
  response = requests.get(
    'http://' + serverDomainName + '/devices/' + deviceId + '/messages/subscribe', 
    headers={ 'authorization': 'Bearer ' + deviceToken }
  )
  if (response.status_code == 502):
    raise TimeoutError()
  elif (response.status_code == 200):
    print('Message received : ' + response.text)
  else:
    print('(Subscribe) An error has occured.')
    print(response)

def sendPing(serverDomainName, deviceId, deviceToken):
  response = requests.post(
    'http://' + serverDomainName + '/devices/' + deviceId + '/ping',
    headers={ 'authorization': 'Bearer ' + deviceToken }
  )
  if (response.status_code == 200):
    print('Ping successful.')
  else:
    print('(Ping) An error has occured.')
    print(response)

def confirmDevice(deviceId, serverDomainName, confirmationToken):
  response = requests.post(
    'http://' + serverDomainName + '/devices/' + deviceId + '/confirm', 
    headers={ 'content-type': 'application/json' },
    json={ 'confirmationToken': confirmationToken, 'macAddress': '00:B0:D0:63:C2:26' },
  )

  if (response.status_code == 200):
    deviceToken = response.json()['deviceToken']
    return deviceToken
  else:
    print('(Confirm) An error has occured.')
    print(response)

deviceId = input('Device ID : ')
serverDomainName = input('Server Domain Name : ')
confirmationToken = input('Confirmation Token : ')

deviceToken = confirmDevice(deviceId, serverDomainName, confirmationToken)

if (deviceToken):
  print('Device confirmed!')

while (True):
  try:
    subscribe(serverDomainName, deviceId, deviceToken)
    sendPing(serverDomainName, deviceId, deviceToken)
  except TimeoutError as err:
    print('Timeout occured. Retrying...')