import { sign, verify, JwtPayload } from 'jsonwebtoken'
import { Type } from 'typescript'
import { NotImplementedError } from '../../common/Errors'
import { ApplicationConfiguration } from '../common/ApplicationConfiguration'

abstract class TransientTokenService<TType> {
  constructor(protected typeName: string) { }

  abstract generateToken(obj: TType, extractKey: (obj: TType) => string): Promise<string>
  abstract decodeToken(token: string): Promise<TType>
}

class JwtTransientTokenService<TType> extends TransientTokenService<TType> {
  constructor(private config: ApplicationConfiguration, typeName: string) { super(typeName) }

  decodeToken(token: string): Promise<TType> {
    return new Promise((resolve, reject) => {
      verify(token, this.config.jwtSigningSecret, (err, decoded) => {
        if (err || decoded == undefined || typeof(decoded) == 'string' || !decoded['id']) {
          reject(err ?? new NotImplementedError())
        } else {
          if (decoded['typ'] != this.typeName) throw new NotImplementedError()
          resolve(decoded['content'])
        }
      })
    })
  }

  generateToken<TType>(obj: TType, extractKey: (obj: TType) => string): Promise<string> {
    return new Promise(resolve => {
      sign({ id: extractKey(obj), typ: this.typeName, content: obj }, this.config.jwtSigningSecret, (_: any, token: any) => {
        resolve(token)
      })
    })
  }
}

export { TransientTokenService, JwtTransientTokenService }