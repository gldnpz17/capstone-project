import { ClaimInstance } from "./ClaimInstance"
import { PasswordCredential } from "./PasswordCredential"
import { TotpCredential } from "./TotpCredential"

class Account {
  constructor(
    public id: string,
    public username: string,
    public password?: PasswordCredential | undefined,
    public totp?: TotpCredential | undefined,
    public claims?: ClaimInstance[]
  ) { }

}

export { Account }