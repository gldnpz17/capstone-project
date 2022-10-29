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

export { NotImplementedError, FormSchemaError }