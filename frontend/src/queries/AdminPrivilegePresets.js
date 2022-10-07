import { gql } from "@apollo/client";

const READ_ALL_ADMIN_PRIVILEGE_PRESETS = gql`
  query ReadAllAdminPrivilegePresets {
    adminPrivilegePresets {
      id
      name
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

export { 
  READ_ALL_ADMIN_PRIVILEGE_PRESETS,
  GENERATE_TOTP_SECRET
}