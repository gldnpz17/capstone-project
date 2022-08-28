import EncryptionService from "../services/EncryptionService"

class EncryptedData {
  private data: string
  private initializationVector: string

  async setData(data: string, service: EncryptionService): Promise<void> {
    const { encrypted, initializationVector } = await service.encrypt(data)
    this.data = encrypted
    this.initializationVector = initializationVector
  }

  async reEncrypt(oldService: EncryptionService, newService: EncryptionService): Promise<void> {
    const data = await this.decrypt(oldService)
    await this.setData(data, newService)
  }

  async decrypt(service: EncryptionService): Promise<string> {
    return await service.decrypt(this.data, this.initializationVector)
  }
}

export default EncryptedData