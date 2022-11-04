const { gql } = require("@apollo/client");

const CREATE_AUTHORIZATION_RULE = gql`
  mutation CreateAuthorizationRule {
    createAuthorizationRule {
      id
    }
  }
`

const READ_ALL_AUTHORIZATION_RULES = gql`
  query ReadAllAuthorizationRules {
    authorizationRules {
      id
      name
      hasPendingChanges
    }
  }
`

const READ_AUTHORIZATION_RULE_BY_ID = gql`
  query ReadAuthorizationRuleById($id: Int) {
    authorizationRules(id: $id) {
      id
      name
      savedRule
      deployedRule
      savedFormSchema
      deployedFormSchema
      hasPendingChanges
    }
  }
`

const SAVE_AUTHORIZATION_RULE = gql`
  mutation SaveAuthorizationRule($id: ID!, $authorizationRule: String) {
    saveAuthorizationRuleChanges(id: $id, authorizationRule: $authorizationRule)
  }
`

const DEPLOY_AUTHORIZATION_RULE = gql`
  mutation DeployAuthorizationRule($id: ID!) {
    deployAuthorizationRule(id: $id)
  }
`

const TEST_AUTHORIZATION_RULE = gql`
  mutation TestAuthorizationRule($id: ID!, $args: String, $claims: [ClaimInput]) {
    testAuthorizationRule(id: $id, args: $args, claims: $claims) {
      authorized
      logMessages
      denyMessage
      errorMessage
    }
  }
`

const APPLY_SCHEMA = gql`
  mutation ApplySchema($schema: String, $values: String) {
    applySchema(schema: $schema, values: $values)
  }
`

export {
  CREATE_AUTHORIZATION_RULE,
  READ_ALL_AUTHORIZATION_RULES,
  READ_AUTHORIZATION_RULE_BY_ID,
  SAVE_AUTHORIZATION_RULE,
  DEPLOY_AUTHORIZATION_RULE,
  APPLY_SCHEMA,
  TEST_AUTHORIZATION_RULE
}