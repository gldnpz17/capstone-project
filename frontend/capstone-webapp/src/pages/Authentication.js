import React from "react";
import "../styles/Authentication.css";
import { Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'

function LoginForm() {

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
            },});
    
    return(

            <div className="cover-login">

                <ThemeProvider theme={theme} >
                    <Grid>
                        <Card style={{ maxWidth: 450, padding: "2px 5px", margin: "0 auto" }}>
                        <CardContent>
                        <div class="header">
                            <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                                Security Verification
                            </Typography> 
                        </div>
                        
                            <Grid container spacing={1} direction="row" justify="center" alignItems="center">
                                <Grid item xs={12}>
                                <p className="desc">Enter Security Code Provided by the Authentication System</p>
                                </Grid>  
                            </Grid>
                            
                            <Grid container spacing={1} direction="row" justify="center" alignItems="center">
                                <Grid item xs={12}>
                                <TextField id="" name="Authentication Code" placeholder="Enter 6-digit Authentication Code" label="Authentication Code" variant="outlined" 
                                /*onChange= {}*/ fullWidth required  />
                                </Grid>  
                            </Grid>

                            
                            <div class="btn">
                                <Grid>
                                    <Grid item xs={12}>
                                        <Button className="auth-btn" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                            <Typography style={{ fontWeight: 500 }}>Submit</Typography></Button>
                                    </Grid>
                                </Grid>
                            </div>

                        
                        </CardContent>
                        </Card>
                    </Grid>
                </ThemeProvider>
            </div>
    );
}

export default LoginForm;