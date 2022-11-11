type ParseResult = { 
  rawRefreshToken: string, 
  rawAccessToken: string | null 
}

class AuthenticationTokenUtils {
  parse(authenticationToken: string): ParseResult {
    const [_, refreshToken, accessToken] = authenticationToken.split(' ')

    return { 
      rawRefreshToken: refreshToken, 
      rawAccessToken: Boolean(accessToken) ? accessToken : null
    }
  }

  create(refreshToken: string, accessToken: string) {
    return `Bearer ${refreshToken} ${accessToken ?? ""}`
  }
}

export { AuthenticationTokenUtils }