import { gql } from "@apollo/client";

const CREATE_CLAIM_TYPE = gql`
  mutation CreateClaimType($name: String, $dataType: CLAIM_TYPE_DATA_TYPE, $options: [String]) {
    createClaimType(name: $name, dataType: $dataType, options: $options) {
      id
    }
  }
`

const READ_CLAIM_TYPE_BY_ID = gql`
  query Query($id: Int) {
    claimTypes(id: $id) {
      id
      name
      dataType
      options {
        id
        value
      }
    }
  }
`

const DELETE_CLAIM_TYPE = gql`
  mutation DeleteClaimType($id: Int) {
    deleteClaimType(id: $id) {
      id
      name
      dataType
    }
  }
`

const ADD_ENUM_OPTION = gql`
  mutation AddEnumClaimTypeOption($claimTypeId: Int, $value: String) {
    addEnumClaimTypeOption(claimTypeId: $claimTypeId, value: $value) {
      id
    }
  }
`

const REMOVE_ENUM_OPTION = gql`
  mutation DeleteEnumClaimTypeOption($id: Int) {
    deleteEnumClaimTypeOption(id: $id) {
      id
    }
  }
`

export { 
  CREATE_CLAIM_TYPE, 
  READ_CLAIM_TYPE_BY_ID, 
  DELETE_CLAIM_TYPE,
  ADD_ENUM_OPTION,
  REMOVE_ENUM_OPTION
}