import React, { useEffect, useMemo, useState } from "react";
import "../styles/AddUser.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Select, MenuItem, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useMutation, useQuery } from "@apollo/client";
import { GENERATE_TOTP_SECRET, READ_ALL_ADMIN_PRIVILEGE_PRESETS } from "../queries/AdminPrivilegePresets";
import QRCode from 'qrcode'
import { Stack } from "@mui/system";
import { READ_ALL_ACCOUNTS, REGISTER_ACCOUNT } from "../queries/Accounts";
import { handleForm } from "../common/handleForm";
import theme from '../components/UItheme';

function AddUser() {
    const { 
        data: { adminPrivilegePresets } = {}, 
        loading: privilegePresetsLoading 
    } = useQuery(READ_ALL_ADMIN_PRIVILEGE_PRESETS)

    const [registerAccount] = useMutation(REGISTER_ACCOUNT, {
        refetchQueries: [ { query: READ_ALL_ACCOUNTS } ]
    })

    const handleSubmit = handleForm(async ({ username, password, privilegeId }) => {
        registerAccount({ 
            variables: { 
                username,
                password,
                privilegeId: Number.parseInt(privilegeId)
            } 
        })
    }, ["username", "password", "privilegeId"])

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
                    
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <TextField id="" name="username" placeholder="Enter Username" label="Username" variant="outlined" fullWidth required />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField id="" name="password" label="Password" type="password" variant="outlined" fullWidth required />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField name="privilegeId" select placeholder="Choose Authority" label="Privilege" variant="outlined" fullWidth required>
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
                                </Grid>
                            
                                <div className="btn-submit">
                                    <Grid className="btn">
                                        <Grid item xs={12}>
                                            <Button className="btn-save" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                                <Typography style={{ fontWeight: 500 }}>Save</Typography>
                                            </Button>
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
            
export default AddUser;