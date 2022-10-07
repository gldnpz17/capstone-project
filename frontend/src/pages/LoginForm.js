import React, { useEffect, useState } from "react";
import "../styles/LoginForm.css";
import { Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_PASSWORD, AUTHENTICATE_SECOND_FACTOR } from "../queries/Accounts";

const handleForm = (handle, fieldNames) => (e) => {
    e.preventDefault()

    const handlerArgs = fieldNames.reduce(
        (obj, name) => {
            return { ...obj, [name]: e.target[name].value }
        }, {}
    )

    handle(handlerArgs)
}

const FirstFactorForm = ({ setSecondFactorToken }) => {
    const [authenticatePassword, { data }] = useMutation(AUTHENTICATE_PASSWORD)

    useEffect(() => {
        if (data?.authenticatePassword) {
            setSecondFactorToken(data.authenticatePassword.secondFactorToken)
        }
    }, [data])

    const handleSubmit = handleForm(({ username, password }) => {
        authenticatePassword({ 
            variables: { username, password } 
        })
    }, ['username', 'password'])

    return (
        <CardContent>
            <div class="header">
                <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                    Login
                </Typography> 
            </div>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <TextField id="" name="username" placeholder="Enter Username" label="Username" variant="outlined" 
                        /*onChange= {}*/ fullWidth required />
                    </Grid>
                    <Grid item xs={12}>
                    <TextField id="" name="password" placeholder="Enter Password" label="Password" type="password" variant="outlined"  
                    /*onChange= {}*/ fullWidth required />
                    </Grid>
                </Grid>
                <div class="login-btn">
                    <Grid>
                        <Grid item xs={12}>
                            <Button type="submit" /*onClick={}*/ variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}} fullWidth>
                                <Typography style={{ fontWeight: 500 }}>Login</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </div>     
            </form> 
        </CardContent>
    )
}

const SecondFactorForm = ({ secondFactorToken }) => {
    const [authenticateSecondFactor, { data }] = useMutation(AUTHENTICATE_SECOND_FACTOR)

    const handleSubmit = handleForm(({ totp }) => {
        console.log(secondFactorToken, totp)
        authenticateSecondFactor({ 
            variables: { token: secondFactorToken, totp } 
        })
    }, ['totp'])

    useEffect(() => {
        if (data?.authenticateSecondFactor) {
            console.log(data)
        }
    }, [data])

    return (
        <CardContent>
            <div class="header">
                <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                    Security Verification
                </Typography> 
            </div>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={1} direction="row" justify="center" alignItems="center">
                    <Grid item xs={12}>
                        <TextField id="" name="totp" placeholder="Enter 6-digit Authentication Code" label="Authentication Code" variant="outlined" 
                    /*onChange= {}*/ fullWidth required  />
                    </Grid>
                </Grid>
                <div class="auth-btn">
                    <Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}} fullWidth>
                                <Typography style={{ fontWeight: 500 }}>Submit</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </form>
        </CardContent>
    )
}

function LoginForm() {
    const theme = createTheme({
        typography: {
            fontFamily: [
            'Poppins',
            'sans-serif',
            ].join(','),
        },
    });

    const [secondFactorToken, setSecondFactorToken] = useState(null)
    
    return(
        <div className="cover-login">
            <ThemeProvider theme={theme} >
                <Grid>
                    <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
                        {secondFactorToken 
                            ? (
                                <SecondFactorForm secondFactorToken={secondFactorToken} />
                            ) : ( 
                                <FirstFactorForm setSecondFactorToken={setSecondFactorToken} />
                            )
                        }
                    </Card>
                </Grid>
            </ThemeProvider>
        </div>
    );
}

export default LoginForm;