import { gql } from "@apollo/client";

const READ_ALL_LOCKS = gql`
  query ReadAllLocks {
    smartLocks {
      id
      name
      lockStatus
      device {
        connectionStatus
        macAddress
      }
      authorizationRule {
        id
      }      
      authorizationRuleArgs
    }
  }
`

const CREATE_LOCK = gql`
  mutation CreateSmartLock($name: String!) {
    createSmartLock(name: $name, wifiSsid: null, wifiPassword: null) {
      id
    }
  }
`

const DELETE_LOCK = gql`
  mutation DeleteSmartLock($id: ID!) {
    deleteSmartLock(id: $id) {
      id
    }
  }
`

const UPDATE_SMART_LOCK_RULE = gql`
  mutation UpdateSmartLockRule($id: String, $ruleId: Int, $ruleArgs: String) {
    updateSmartLockRule(id: $id, ruleId: $ruleId, ruleArgs: $ruleArgs)
  }
`

const VERIFY_DEVICE = gql`
  mutation VerifyDevice($smartLockId: ID!, $deviceId: ID!) {
    verifyDevice(smartLockId: $smartLockId, deviceId: $deviceId) {
      success
    }
  }
`

const SEND_COMMAND = gql`
  mutation SendCommand($smartLockId: ID!, $command: String) {
    sendCommand(smartLockId: $smartLockId, command: $command) {
      authorized
      denyMessage
    }
  }
`

const READ_SMART_LOCK_STATUS = gql`
  query ReadSmartLockStatus($id: String) {
    smartLocks(id: $id) {
      lockStatus
    }
  }
`

export {
  READ_ALL_LOCKS,
  CREATE_LOCK,
  DELETE_LOCK,
  UPDATE_SMART_LOCK_RULE,
  VERIFY_DEVICE,
  SEND_COMMAND,
  READ_SMART_LOCK_STATUS
}