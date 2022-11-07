import { useMutation, useQuery } from "@apollo/client"
import { Check, Login } from "@mui/icons-material"
import { Box, Button, Card, Stack, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { getFormValues } from "../common/getFormValues"
import { AUTHENTICATE_PASSWORD, AUTHENTICATE_SECOND_FACTOR, SETUP_TOTP } from "../queries/Accounts"
import { GENERATE_TOTP_SECRET } from "../queries/AdminPrivilegePresets"
import QRCode from 'qrcode'

const FirstFactorForm = ({ setupSecondFactor, authenticateSecondFactor, setUsername }) => {
    const [authenticatePassword] = useMutation(AUTHENTICATE_PASSWORD)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { username, password } = getFormValues(e.target)

        const { data } = await authenticatePassword({ variables: { username, password }, errorPolicy: "ignore" })
        const secondFactorToken = data.authenticatePassword?.secondFactorToken
        const secondFactorSetupToken = data.authenticatePassword?.secondFactorSetupToken

        if (secondFactorToken) {
            authenticateSecondFactor(secondFactorToken)
        } else if (secondFactorSetupToken) {
            setupSecondFactor(secondFactorSetupToken)
            setUsername(() => username)
        } else {
            alert("Invalid username or password!")
        }

        e.target.reset()
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={1}>
                <TextField label="Username" name="username" />
                <TextField label="Password" type="password" name="password" />
                <Button type="submit" variant="contained" color="secondary" startIcon={<Login />}>Continue</Button>
            </Stack>
        </form>
    )
}

const SecondFactorForm = ({ token }) => {
    const [authenticateSecondFactor] = useMutation(AUTHENTICATE_SECOND_FACTOR)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { totp } = getFormValues(e.target)

        const { data: { authenticateSecondFactor: { refreshToken } } } = await authenticateSecondFactor({
            variables: { token, totp }
        })

        console.log(refreshToken)
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap={1}>
                <Typography color="GrayText">Enter your 6-digit code</Typography>
                <TextField name="totp" label="TOTP" />
                <Button type="submit" variant="contained" color="secondary" startIcon={<Login />}>Login</Button>
            </Stack>
        </form>
    )
}

const SetupSecondFactorForm = ({ token: secondFactorSetupToken, username }) => {
    const {
        data: { totp: { generateSecret: sharedSecret } } = { totp: {} },
        loading
    } = useQuery(GENERATE_TOTP_SECRET)

    const [qrCodeUrl, setQrCodeUrl] = useState(null)

    useEffect(() => {
        (async () => {
            setQrCodeUrl(
                await QRCode.toDataURL(`otpauth://totp/SmartLock:${username}?secret=${sharedSecret}&issuer=SmartLock`)
            )
        })()
    }, [sharedSecret, username])

    const [setupTotp] = useMutation(SETUP_TOTP)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { totp } = getFormValues(e.target)

        const { data: { setupSecondFactor: { refreshToken } } } = await setupTotp({
            variables: { secondFactorSetupToken, sharedSecret, totp }
        })

        console.log(refreshToken)
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack textAlign="center" gap={1}>
                {!loading && (
                    <>
                        <Typography color="GrayText">Scan this QR code using your preferred authenticator app</Typography>
                        {qrCodeUrl && (
                            <img src={qrCodeUrl} />
                        )}
                        <Typography color="GrayText">Or enter this secret directly</Typography>
                        {/* Splits the secret into groups of 4 characters */}
                        <Typography fontWeight="bold" sx={{ mb: 2 }}>{sharedSecret.match(/.{1,4}/g).join(' ')}</Typography>
                        <TextField name="totp" label="Confirm TOTP" />
                        <Button type="submit" startIcon={<Check />} color="secondary" variant="contained">Confirm</Button>
                    </>
                )}
            </Stack>
        </form>
    )
}

const EndUserLoginPage = () => {
    const [mode, setMode] = useState("firstFactor")
    const [secondStageToken, setSecondStageToken] = useState(null)
    const [username, setUsername] = useState(null)

    const authenticateSecondFactor = (token) => {
        setSecondStageToken(() => token)
        setMode(() => "secondFactor")
    }

    const setupSecondFactor = (token) => {
        setSecondStageToken(() => token)
        setMode(() => "setupSecondFactor")
    }

    const theme = useTheme()

    return (
        <Stack
            sx={{ 
                height: "100%", 
                width: "100%", 
                backgroundColor: theme.palette.primary.main,
            }}
            alignItems="center"
            justifyContent="center"
        >
            <Card sx={{ px: 4, py: 6 }}>
                <Stack gap={4} sx={{ width: "16rem" }}>
                    <Typography textAlign="center"><b>Smart Lock -</b> {mode === "setupSecondFactor" ? "Setup 2FA" : "Login"}</Typography>
                    {mode === "firstFactor" && (
                        <FirstFactorForm {...{ setupSecondFactor, authenticateSecondFactor, setUsername }} />
                    )}
                    {mode === "secondFactor" && (
                        <SecondFactorForm token={secondStageToken} />
                    )}
                    {mode === "setupSecondFactor" && (
                        <SetupSecondFactorForm token={secondStageToken} {...{ username }} />
                    )}
                </Stack>
            </Card>
        </Stack>
    )
}

export { EndUserLoginPage }