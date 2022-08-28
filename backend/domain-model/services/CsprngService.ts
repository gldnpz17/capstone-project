interface CsprngService {
  generateRandomString(length: number): Promise<string>
}

export default CsprngService