import { EnumClaimTypeOption } from "./EnumClaimTypeOption"

type ClaimTypeOptions = 'string' | 'number' | 'boolean' | 'enum'
type ClaimTypesUnion = StringClaimType | NumberClaimType | BooleanClaimType | EnumClaimType

class ClaimType {
  constructor(
    public id: number,
    public name: string,
    public camelCaseName: string,
    public dataType: ClaimTypeOptions
  ) { }
}

class StringClaimType extends ClaimType {
  constructor(
    id: number,
    name: string,
    camelCaseName: string,
  ) { super(id, name, camelCaseName, 'string') }
}

class NumberClaimType extends ClaimType {
  constructor(
    id: number,
    name: string,
    camelCaseName: string,
  ) { super(id, name, camelCaseName, 'number') }
}

class BooleanClaimType extends ClaimType {
  constructor(
    id: number,
    name: string,
    camelCaseName: string,
  ) { super(id, name, camelCaseName, 'boolean') }
}

class EnumClaimType extends ClaimType {
  constructor(
    id: number,
    name: string,
    camelCaseName: string,
    public options?: EnumClaimTypeOption[] | undefined
  ) { super(id, name, camelCaseName, 'enum') }
}

export { ClaimType, StringClaimType, NumberClaimType, BooleanClaimType, EnumClaimType, ClaimTypeOptions, ClaimTypesUnion }