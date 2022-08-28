class File {
  constructor(private filename: string, private data: ArrayBuffer) { }

  identifier: number

  async getData(): Promise<ArrayBuffer> { return this.data }
}

export default File