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

export { 
  AUTHENTICATE_PASSWORD, 
  AUTHENTICATE_SECOND_FACTOR 
}