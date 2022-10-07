import React, { useEffect, useMemo, useState } from "react";
import "../styles/AddUser.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Select, MenuItem, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useQuery } from "@apollo/client";
import { GENERATE_TOTP_SECRET, READ_ALL_ADMIN_PRIVILEGE_PRESETS } from "../queries/AdminPrivilegePresets";
import QRCode from 'qrcode'
import { Stack } from "@mui/system";

const TotpSetup = ({ totpQrCodeUrl, secret }) => {

    // Adds a space every 4 characters.
    const formattedSecret = useMemo(
        () =>  secret.split("").flatMap((char, index) => [char, ++index % 4 == 0 ? " " : ""]).join(""), 
        [secret]
    )

    return (
        <>
            <Grid container item xs={12}>
                <Grid item xs={6}>
                    <img src={totpQrCodeUrl} alt="qr" style={{ width: "100%", aspectRatio: 1 }}></img>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                        <Typography>
                            Setup Two-Factor Authentication by opening your authenticator app (e.g. Google Authenticator or Authy) 
                            and scanning the QR Code on the left
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Stack sx={{ alignItems: "center" }}>
                        <Typography>Or by entering the shared secret manually</Typography>
                        <Typography fontWeight="bold">{formattedSecret}</Typography>
                    </Stack>
                </Grid>
            </Grid>
            
            <Grid item xs={8}>
                <TextField id="" name="confirmTotp" placeholder="Enter Code" label="Confirm TOTP" type="password" variant="outlined" fullWidth required />
            </Grid>

            <Grid item xs={4}>
                <Button className="btn-confirm" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                <Typography style={{ fontWeight: 500 }}>Confirm</Typography></Button>
            </Grid>
        </>
    )
}

function LoginForm() {
    const { 
        data: { adminPrivilegePresets } = {}, 
        loading: privilegePresetsLoading 
    } = useQuery(READ_ALL_ADMIN_PRIVILEGE_PRESETS)

    const {
        data: { 
            totp: { generateSecret: secret } = {}
        } = {},
        loading: totpSecretLoading
    } = useQuery(GENERATE_TOTP_SECRET)

    const [totpQrCodeUrl, setTotpQrCodeUrl] = useState(null)

    const generateQrCodeUrl = async (secret) => setTotpQrCodeUrl(
        await QRCode.toDataURL(`otpauth://totp/SmartLock:username?secret=${secret}&issuer=SmartLock`)
    )

    useEffect(() => {
        if (secret) generateQrCodeUrl(secret)
    }, [totpSecretLoading])
    
    const theme = createTheme({
        palette: {
            primary: {
             main: "#5572c7"}
          },
        typography: {
          fontFamily: [
            'Poppins',
            'sans-serif',
          ].join(','),
        },
    });

    return(
        <div className="cover-add">
            <ThemeProvider theme={theme} >
                <Grid>
                    <Card style={{ maxWidth: 450, padding: "2px 5px", margin: "0 auto" }}>
                        <CardContent>
                            <Grid container spacing={1}>
                                <div class="header2">
                                    <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                                        User Setting
                                    </Typography> 
                                </div>
                            </Grid>
                    
                            <form /*onSubmit={}*/>
                                <Grid container spacing={1}>

                                    <Grid item xs={6}>
                                        <TextField id="" name="username" placeholder="Enter Username" label="Username" variant="outlined" fullWidth required />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField name="privilege" select placeholder="Choose Authority" label="Privilege" variant="outlined" fullWidth required>
                                            {privilegePresetsLoading
                                                ? (
                                                    <MenuItem disabled>Loading Privileges...</MenuItem>
                                                )
                                                : adminPrivilegePresets.map(preset => (
                                                    <MenuItem key={preset.id} value={preset.id}>{preset.name}</MenuItem>
                                                ))
                                            }
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField id="" name="password" label="Password" type="password" variant="outlined" fullWidth required />
                                    </Grid>

                                    {totpQrCodeUrl
                                        ? (
                                            <TotpSetup totpQrCodeUrl={totpQrCodeUrl} secret={secret} />
                                        )
                                        : (
                                            <Grid xs={12}>
                                                <Typography>Loading TOTP configuration...</Typography>
                                            </Grid>
                                        )
                                    }

                                </Grid>
                            
                                <div className="btn-submit">
                                    <Grid className="btn">
                                        <Grid item xs={12}>
                                            <Button className="btn-save" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                                <Typography style={{ fontWeight: 500 }}>Save</Typography></Button>
                                        </Grid>
                                    </Grid>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </ThemeProvider>
        </div>
    );
}
            
export default LoginForm;