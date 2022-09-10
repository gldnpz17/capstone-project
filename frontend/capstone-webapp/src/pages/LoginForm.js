import React from "react";
import "../styles/LoginForm.css";
import { Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'

function LoginForm() {

        const theme = createTheme({
            typography: {
              fontFamily: [
                'Poppins',
                'sans-serif',
              ].join(','),
            },});
    
    return(

            <div className="cover-login">

                <ThemeProvider theme={theme} >
                    <Grid>
                        <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
                        <CardContent>
                        <div class="header">
                            <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                                Login
                            </Typography> 
                        </div>
                        
        
                            
                            <Grid container spacing={1}>
        
                                <Grid item xs={12}>
                                <TextField id="" name="Username" placeholder="Enter Username" label="Username" variant="outlined" 
                                /*onChange= {}*/ fullWidth required />
                                </Grid>
        
                                <Grid item xs={12}>
                                <TextField id="" name="Role" placeholder="Enter Password" label="Password" type="password" variant="outlined"  
                                /*onChange= {}*/ fullWidth required />
                                </Grid>
        
                                
                            </Grid>

                            
                            <div class="login-btn">
                                <Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" /*onClick={}*/ variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}} fullWidth>
                                            <Typography style={{ fontWeight: 500 }}>Login</Typography></Button>
                                    </Grid>
                                </Grid>
                            </div>

                        
                        </CardContent>
                        </Card>
                    </Grid>
                </ThemeProvider>
            </div>

        /*
        <div className="cover-login">
            
            <h1>Login</h1>
            <input type="text" placeholder="username"/>
            <input type="password" placeholder="password"/>

            <div className="invalid-user">
            <p>Invalid Username or Password!</p>
            </div>

            <div className="login-btn">
                Login
            </div>

        </div>
        */
    );
}

export default LoginForm;