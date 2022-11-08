import { History, QrCodeScanner, Settings } from "@mui/icons-material"
import { Box, Button, CircularProgress, Fab, IconButton, Stack } from "@mui/material"
import { useEffect } from "react"

const LockScannerPage = () => {
  useEffect(() => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment'
        }
      })

      let videoElement = null
      while (!videoElement) {
        videoElement = document.getElementById("camera-preview")
      }
      videoElement.srcObject = stream
      videoElement.addEventListener("loadedmetadata", () => {
        videoElement.play()
      })
    })()
  }, [])

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
      <video style={{ height: "calc(100vh + 10px)", width: "calc(100vw + 10px)", objectFit: "cover" }} id="camera-preview" />
      <Stack 
        sx={{ 
          position: "absolute", 
          left: 0, 
          right: 0, 
          bottom: 0, 
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
            <Fab color="primary" sx={{ filter: "grayscale(90%)", opacity: "50%" }}>
              <QrCodeScanner fontSize="large" />
            </Fab>
            <CircularProgress color="secondary" size="4rem" sx={{ position: "absolute", inset: 0, zIndex: 1500 }} />
          </Stack>
          <IconButton>
            <Settings fontSize="large" htmlColor="white" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  )
}

export { LockScannerPage }