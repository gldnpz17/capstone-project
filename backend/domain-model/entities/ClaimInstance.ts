import { Account } from "./Account";
import { ClaimType } from "./ClaimType";

type ClaimInstanceUnion = StringClaim | NumberClaim | BooleanClaim | EnumClaim

class ClaimInstance {
  constructor(
    public id: number,
    public type: ClaimType,
    public account?: Account
  ) { }
}

class StringClaim extends ClaimInstance {
  constructor(
    id: number,
    type: ClaimType,
    public value: string,
    account?: Account
  ) { super(id, type, account) }
}

class NumberClaim extends ClaimInstance {
  constructor(
    id: number,
    type: ClaimType,
    public value: number,
    account?: Account
  ) { super(id, type, account) }
}

class BooleanClaim extends ClaimInstance {
  constructor(
    id: number,
    type: ClaimType,
    public value: boolean,
    account?: Account
  ) { super(id, type, account) }
}

class EnumClaim extends ClaimInstance {
  constructor(
    id: number,
    type: ClaimType,
    public value: string,
    account?: Account
  ) { super(id, type, account) }
}

export { 
  ClaimInstance,
  StringClaim,
  NumberClaim,
  BooleanClaim,
  EnumClaim,
  ClaimInstanceUnion
}