import { gql } from "@apollo/client";

const REGISTER_ACCOUNT = gql`
  mutation RegisterAccount($username: String, $password: String, $privilegeId: Int) {
    registerAccount(username: $username, password: $password, privilegeId: $privilegeId) {
      id
    }
  }
`

const AUTHENTICATE_PASSWORD = gql`
  mutation AuthenticatePassword($username: String, $password: String) {
    authenticatePassword(username: $username, password: $password) {
      secondFactorToken
      secondFactorSetupToken
    }
  }
`

const AUTHENTICATE_SECOND_FACTOR = gql`
  mutation AuthenticateSecondFactor($secondFactorToken: String, $totp: String) {
    authenticateSecondFactor(secondFactorToken: $secondFactorToken, totp: $totp) {
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
          dataType
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
      camelCaseName
      dataType
      options {
        id
        value
      }
    }
  }
`

const READ_ACCOUNT_BY_ID = gql`
  query ReadAccountByID($id: String) {
    accounts(id: $id) {
      id
      username
      claims {
        id
        type {
          id
          name
          dataType
          options {
            id
            value
          }
        }
        value
      }
    }
  }
`

const ADD_CLAIM_TO_ACCOUNT = gql`
  mutation AddClaimToAccount($accountId: String, $typeId: Int) {
    addClaimToAccount(accountId: $accountId, typeId: $typeId, value: null) {
      id
      value
    }
  }
`

const UPDATE_CLAIM = gql`
  mutation UpdateClaim($id: Int, $value: String) {
    updateClaim(id: $id, value: $value) {
      id
      value
    }
  }
`

const DELETE_CLAIM = gql`
  mutation DeleteClaim($id: Int) {
    deleteClaim(id: $id) {
      id
      value
    }
  }
`

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: ID) {
    deleteAccount(id: $id) {
      id
    }
  }
`

const SETUP_TOTP = gql`
  mutation SetupTotp($secondFactorSetupToken: String, $sharedSecret: String, $totp: String) {
    setupSecondFactor(secondFactorSetupToken: $secondFactorSetupToken, sharedSecret: $sharedSecret, totp: $totp) {
      refreshToken
    }
  }
`

const INSPECT_SELF = gql`
  query InspectSelf {
    inspectSelf {
      id
      privilegePreset {
        isSuperAdmin
      }
      username
    }
  }
`

const LOGOUT = gql`
  mutation Mutation {
    logout
  }
`

export { 
  REGISTER_ACCOUNT,
  DELETE_ACCOUNT,
  AUTHENTICATE_PASSWORD, 
  AUTHENTICATE_SECOND_FACTOR,
  READ_ALL_ACCOUNTS,
  READ_ALL_CLAIM_TYPES,
  READ_ACCOUNT_BY_ID,
  ADD_CLAIM_TO_ACCOUNT,
  UPDATE_CLAIM,
  DELETE_CLAIM,
  SETUP_TOTP,
  INSPECT_SELF,
  LOGOUT
}