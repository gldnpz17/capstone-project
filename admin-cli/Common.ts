import { SerialPort } from "serialport";
import { PortInfo } from "serialport/index"

type Nullable<T> = T | null | undefined

const getSerialPortInfo = async (): Promise<PortInfo> => {
  let portInfo: Nullable<PortInfo>
  while (!portInfo) {
    const ports = await SerialPort.list()

    portInfo = ports[0]
  }

  return portInfo
}

export {
  getSerialPortInfo
}