import { useMutation } from "@apollo/client"
import { SEND_COMMAND } from "../queries/SmartLocks"

const TestingPage = () => {
  const [sendCommand] = useMutation(SEND_COMMAND)

  const sendCommandAsync = async (smartLockId, command) => {
    const { data } = await sendCommand({
      variables: { smartLockId, command }
    })
    return data
  }

  const sendMessage = async () => {
    const amount = Number.parseInt(window.prompt('Mesage amount'))
    const message = window.prompt('Message (default: "unlock")') || 'unlock'
    const frequency = Number.parseInt(window.prompt('Frequency (default: 10)') || 10)
    const interval = (60 * 1000) / frequency
    const smartLockId = window.prompt('Smart Lock ID') || '6da700dd-bc09-4404-a60f-027075a6798a'
    const timestamps = []

    console.log(`Sending message. Message: ${message}. Interval: ${interval}. Lock ID: ${smartLockId}`)
    for (let i = 1; i <= amount; i++) {
      const timestamp = Date.now()
      console.log(`Sending message ${i}/${amount}. Timestamp: ${timestamp}.`)
      timestamps.push(timestamp)
      const data = await sendCommandAsync(smartLockId, message)
      console.log(data)
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    console.log('Message sending complete.')
    console.log(timestamps)
  }

  return (
    <div>
      <button onClick={sendMessage}>Send message</button>
    </div>
  )
}

export { TestingPage }