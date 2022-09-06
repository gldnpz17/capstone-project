class PasswordCredential {
  constructor(
    public hash: string,
    public salt: string
  ) { }
}

export { PasswordCredential }