import { gql } from '@apollo/client'

const READ_ALL_LOCKS = gql`
  query ReadAllLocks {
    smartLocks {
      id
      name
    }
  }
`

export {
  READ_ALL_LOCKS
}