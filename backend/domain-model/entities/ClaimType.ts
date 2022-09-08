import { EnumClaimTypeOption } from "./EnumClaimTypeOption"

type ClaimTypeOptions = 'string' | 'number' | 'boolean' | 'enum'
type ClaimTypesUnion = StringClaimType | NumberClaimType | BooleanClaimType | EnumClaimType

class ClaimType {
  constructor(
    public id: number,
    public name: string,
    public dataType: ClaimTypeOptions
  ) { }
}

class StringClaimType extends ClaimType {
  constructor(
    id: number,
    name: string
  ) { super(id, name, 'string') }
}

class NumberClaimType extends ClaimType {
  constructor(
    id: number,
    name: string
  ) { super(id, name, 'number') }
}

class BooleanClaimType extends ClaimType {
  constructor(
    id: number,
    name: string
  ) { super(id, name, 'boolean') }
}

class EnumClaimType extends ClaimType {
  constructor(
    id: number,
    name: string,
    public options?: EnumClaimTypeOption[] | undefined
  ) { super(id, name, 'enum') }
}

export { ClaimType, StringClaimType, NumberClaimType, BooleanClaimType, EnumClaimType, ClaimTypeOptions, ClaimTypesUnion }