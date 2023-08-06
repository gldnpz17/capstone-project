import QrScanner from "qr-scanner"
import { useEffect, useRef, useState } from "react"

const useQrScanner = () => {
  const [qr, setQr] = useState(null)
  const [stream, setStream] = useState(null)
  const [previewImgSrc, setPreviewImgSrc] = useState("")
  const videoRef = useRef()
  
  const [qrCode, setQrCode] = useState(null)

  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment'
        }
      })

      setStream(stream)
    })()
  }, [])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current.play()
      })
      const qr = new QrScanner(videoRef.current, result => setQrCode(result.data), {})
      setQr(qr)
    }
  }, [stream, videoRef.current])

  useEffect(() => {
    if (!qr) return

    if (!qrCode) {
      qr.start()
    } else {
      qr.stop()
    }
  }, [qrCode, qr])

  useEffect(() => {
    if (!videoRef.current && !qrCode) return

    if (videoRef.current && !qrCode) {
      setPreviewImgSrc("")
      return
    }

    const canvas = document.createElement('canvas')

    const { videoWidth, videoHeight } = videoRef.current
    canvas.width = videoWidth
    canvas.height = videoHeight

    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, videoWidth, videoHeight)

    const dataUrl = canvas.toDataURL()
    setPreviewImgSrc(dataUrl)
  }, [qrCode])

  const reset = () => setQrCode(null)

  return ({
    previewImgSrc,
    videoRef,
    qrCode,
    reset
  })
}

export { useQrScanner }