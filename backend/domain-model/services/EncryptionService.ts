interface EncryptionService {
  encrypt(data: string): Promise<{ encrypted: string, initializationVector: string }>
  decrypt(encrypted: string, initializationVector: string): Promise<string>
}

export default EncryptionService