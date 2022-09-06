import { PasswordCredential } from "./PasswordCredential"

class Account {
  id: String
  username: String
  password: PasswordCredential | undefined
}

export { Account }