import NodeRSA from 'node-rsa'

class KeyPair {
  constructor(
    public privateKey: string,
    public publicKey: string
  ) { }
}

interface DigitalSignatureService {
  generateKeyPair(): KeyPair
  sign(content: string, privateKey: string): string
  verify(signedContent: string, publicKey: string): boolean
}

class NodeRsaDigitalSignatureService implements DigitalSignatureService {
  generateKeyPair(): KeyPair {
    const key = new NodeRSA({ b: 512 })
    return new KeyPair(
      key.exportKey('pkcs8-private-pem'),
      key.exportKey('pkcs8-public-pem')
    )
  }
  
  sign(content: string, privateKey: string): string {
    const key = new NodeRSA(privateKey);

    const signature = key.sign(Buffer.from(content, "utf-8")).toString('base64')

    return `${content}:${signature}`
  }

  verify(signedContent: string, publicKey: string): boolean {
    const [content, signature] = signedContent.split(":")

    const key = new NodeRSA(publicKey)

    return key.verify(
      Buffer.from(content, "utf-8"), 
      Buffer.from(signature, "base64")
    )
  }

}

export {
  DigitalSignatureService,
  NodeRsaDigitalSignatureService,
  KeyPair
}