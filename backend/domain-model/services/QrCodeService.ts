import File from "../entities/File"
import SmartLock from "../entities/SmartLock"

interface QrCodeService {
  generateSmartLockQrCode(lock: SmartLock): Promise<File>
}

export default QrCodeService