import { genSaltSync, hashSync } from 'bcryptjs'

interface PasswordService {
  hash(password: string): { salt: string, hash: string }
  match(credential: { password: string, salt: string, hash: string }): boolean
}

class BcryptJsPasswordService implements PasswordService {
  hash(password: string): { salt: string; hash: string } {
    const salt = genSaltSync()
    const hash = hashSync(password, salt)

    return { salt, hash }
  }

  match(credential: { password: string; salt: string; hash: string }): boolean {
    return hashSync(credential.password, credential.salt) == credential.hash
  }
}

export { PasswordService, BcryptJsPasswordService }