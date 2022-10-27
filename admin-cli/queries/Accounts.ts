import { gql } from "@apollo/client"

const AUTHENTICATE_PASSWORD = gql`
  mutation AuthenticatePassword($username: String, $password: String) {
    authenticatePassword(username: $username, password: $password) {
      secondFactorToken
      secondFactorSetupToken
    }
  }
`

const GENERATE_TOTP_SECRET = gql`
  query GenerateTotpSecret {
    totp {
      generateSecret
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

export {
  AUTHENTICATE_PASSWORD,
  GENERATE_TOTP_SECRET,
  SETUP_TOTP
}