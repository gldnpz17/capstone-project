import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { History, LockOpen, QrCodeScanner, Settings, Lock } from "@mui/icons-material"
import { Box, Button, CircularProgress, Fab, IconButton, Stack } from "@mui/material"
import QrScanner from "qr-scanner"
import { useCallback, useEffect, useRef, useState } from "react"
import { authorizeAuthenticatedPage } from "../higher-order-components/authorizePage"
import { READ_SMART_LOCK_STATUS, SEND_COMMAND } from "../queries/SmartLocks"

const LockScannerPage = () => {
  const [qr, setQr] = useState(null)
  const [smartLockId, setSmartLockId] = useState(null)
  const [sendCommand] = useMutation(SEND_COMMAND)
  const [getSmartLockStatus, { 
    data: { smartLocks: [{ lockStatus }] } = { smartLocks: [{}] }, 
    loading 
  }] = useLazyQuery(READ_SMART_LOCK_STATUS)
  const [stream, setStream] = useState(null)

  const videoRef = useRef()

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
      const qr = new QrScanner(videoRef.current, result => setSmartLockId(result.data), {})
      setQr(qr)
    }
  }, [stream, videoRef.current])

  useEffect(() => {
    if (!qr) return

    if (!smartLockId) {
      qr.start()
    } else {
      qr.stop()
    }
  }, [smartLockId, qr])

  useEffect(() => {
    if (smartLockId) {
      getSmartLockStatus({
        variables: { id: smartLockId }
      })
    }
  }, [smartLockId])

  const handleActionButton = useCallback(async () => {
    let command = null
    switch (lockStatus) {
      case "locked":
        command = "unlock"
        break
      case "unlocked":
        command = "lock"
        break
      default:
        throw new Error("Invalid lock status.")
    }
    try {
      const {
        data: { sendCommand: { authorized, denyMessage } },
        errors
      } = await sendCommand({
        variables: { smartLockId, command }
      })
  
      if (errors) {
        alert("An error has occured")      
      }

      if (authorized) {
        alert("Success!")
      } else {
        alert(`Access denied. Reason : ${denyMessage}`)
      }
  
      setSmartLockId(null)
    } catch (err) {
      alert("An error has occured")
      setSmartLockId(null)
      return
    }
  }, [lockStatus, smartLockId])

  return (
    <Stack 
      sx={{ 
        position: "absolute", 
        top: 0, 
        bottom: 0, 
        left: 0, 
        right: 0, 
        overflow: "hidden" 
      }} 
      alignItems="center" 
      justifyContent="center"
    >
      <video ref={videoRef} style={{ height: "calc(100vh + 10px)", width: "calc(100vw + 10px)", objectFit: "cover" }} id="camera-preview" />
      <Stack 
        sx={{ 
          position: "absolute", 
          left: -5, 
          right: -5, 
          bottom: -5, 
          px: 6, 
          py: 4,
          backdropFilter: "blur(2px)"
        }} 
        direction="row" 
        justifyContent="center"
      >
        <Box sx={{ position: "absolute", inset: "0", backgroundColor: "black", opacity: "60%" }} />
        <Stack gap={6} direction="row" alignItems="center">
          <IconButton>
            <History fontSize="large" htmlColor="white" />
          </IconButton>
          <Stack sx={{ zIndex: 10, width: "4rem", aspectRatio: "1", position: "relative" }} alignItems="center" justifyContent="center">
            {!smartLockId || loading
              ? (
                <>
                  <Fab color="primary" sx={{ filter: "grayscale(90%)", opacity: "50%" }}>
                    <QrCodeScanner fontSize="large" />
                  </Fab>
                  <CircularProgress color="secondary" size="4rem" sx={{ position: "absolute", inset: 0, zIndex: 1500 }} />
                </>
              )
              : (
                <Fab color="primary" onClick={handleActionButton}>
                  {lockStatus === "locked" && (
                    <LockOpen />
                  )}
                  {lockStatus === "unlocked" && (
                    <Lock />
                  )}
                </Fab>
              )}
          </Stack>
          <IconButton>
            <Settings fontSize="large" htmlColor="white" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  )
}

const SecuredLockScannerPage = authorizeAuthenticatedPage(LockScannerPage)

export { 
  SecuredLockScannerPage as LockScannerPage
}