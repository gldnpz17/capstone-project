import { gql } from "@apollo/client";

const READ_ALL_LOCKS = gql`
  query ReadAllLocks {
    smartLocks {
      id
      name
      lockStatus
      device {
        connectionStatus
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

export {
  READ_ALL_LOCKS,
  CREATE_LOCK,
  DELETE_LOCK,
  UPDATE_SMART_LOCK_RULE
}