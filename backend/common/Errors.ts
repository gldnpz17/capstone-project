class NotImplementedError extends Error {
  constructor() {
    super('Feature not yet implemented.')
  }
}

class FormSchemaError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class AuthorizationError extends Error {
  constructor(message: string = "An authorization error occured.") {
    super(message)
  }
}

export { NotImplementedError, FormSchemaError, AuthorizationError }