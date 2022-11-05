import { gql } from '@apollo/client'

const READ_ALL_LOCKS = gql`
  query ReadAllLocks {
    smartLocks {
      id
      name
    }
  }
`

const CONNECT_SMART_LOCK = gql`
  mutation ConnectSmartLock($id: ID!) {
    connectSmartLock(id: $id) {
      deviceId
      serverDomain
      devicePublicKey
      confirmationToken
    }
  }
`

export {
  READ_ALL_LOCKS,
  CONNECT_SMART_LOCK
}