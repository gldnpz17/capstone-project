import { gql } from "@apollo/client";

const AUTHENTICATE_PASSWORD = gql`
  mutation AuthenticatePassword($username: String, $password: String) {
    authenticatePassword(username: $username, password: $password) {
      secondFactorToken
    }
  }
`

const AUTHENTICATE_SECOND_FACTOR = gql`
  mutation AuthenticateSecondFactor($token: String, $totp: String) {
    authenticateSecondFactor(secondFactorToken: $token, totp: $totp) {
      refreshToken
    }
  }
`

const READ_ALL_ACCOUNTS = gql`
  query ReadAllAccounts {
    accounts {
      id
      username
      privilegePreset {
        id
        name
      }
      claims {
        id
        type {
          id
          name
        }
        value
      }
    }
  }
`

const READ_ALL_CLAIM_TYPES = gql`
  query ReadAllClaimTypes {
    claimTypes {
      id
      name
    }
  }
`

export { 
  AUTHENTICATE_PASSWORD, 
  AUTHENTICATE_SECOND_FACTOR,
  READ_ALL_ACCOUNTS,
  READ_ALL_CLAIM_TYPES
}