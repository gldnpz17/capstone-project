import { Account } from "./Account";

class ClaimInstance {
  constructor(
    public account: Account
  ) { }
}

class StringClaim extends ClaimInstance {
  constructor(
    account: Account,
    value: string
  ) { super(account) }
}

class NumberClaim extends ClaimInstance {
  
}

class BooleanClaim extends ClaimInstance {
  constructor(
    account: Account,
    value: boolean
  ) { super(account) }
}

class EnumClaim extends ClaimInstance {
  
}

export { ClaimInstance }