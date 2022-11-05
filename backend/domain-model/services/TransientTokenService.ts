import { sign, verify, JwtPayload } from 'jsonwebtoken'
import { Type } from 'typescript'
import { NotImplementedError } from '../../common/Errors'
import { ApplicationConfiguration } from '../common/ApplicationConfiguration'

type TokenServiceOptions = {
  singleUse?: boolean,
  lifetime?: number | undefined
}

const defaultTokenServiceOptions: TokenServiceOptions = {
  singleUse: false,
  lifetime: undefined
}

abstract class TransientTokenService<TType> {
  constructor(
    protected typeName: string,
    protected options: TokenServiceOptions
  ) { }

  abstract generateToken(obj: TType, extractKey: (obj: TType) => string): Promise<string>
  abstract decodeToken(token: string): Promise<TType>
}

class JwtTransientTokenService<TType> extends TransientTokenService<TType> {
  private validTokenIds: Record<any, true> = {}

  constructor(
    private config: ApplicationConfiguration, 
    typeName: string,
    options: TokenServiceOptions = {}
  ) { super(typeName, { ...defaultTokenServiceOptions, ...options }) }

  decodeToken(token: string): Promise<TType> {
    return new Promise((resolve, reject) => {
      verify(token, this.config.jwtSigningSecret, (err, decoded) => {
        if (err || decoded == undefined || typeof(decoded) == 'string' || !decoded['id']) {
          reject(err ?? new NotImplementedError())
        } else {
          if (decoded['typ'] != this.typeName) throw new NotImplementedError()

          if (this.options.singleUse) {
            const id = decoded['id']
            if (this.validTokenIds[id]) {
              delete this.validTokenIds[id]
            } else {
              reject(new NotImplementedError())
            }
          }

          resolve(decoded['content'])
        }
      })
    })
  }

  generateToken<TType>(obj: TType, extractKey: (obj: TType) => string): Promise<string> {
    return new Promise((resolve, reject) => {
      const id = extractKey(obj)

      const payload = { id, typ: this.typeName, content: obj }
      const secret = this.config.jwtSigningSecret
      const options = { 
        expiresIn: this.options.lifetime?.toString() 
      }
      for (const key in options) {
        if (options[key] == undefined) delete options[key]
      }

      sign(payload, secret, options, (err: any, token: any) => {
        if (err) reject(err)
        resolve(token)
      })

      if (this.options.singleUse) this.validTokenIds[id] = true
    })
  }
}

export { TransientTokenService, JwtTransientTokenService }