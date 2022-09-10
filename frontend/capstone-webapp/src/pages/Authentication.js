import React from "react";
import "../styles/Authentication.css";
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
                        <Card style={{ maxWidth: 450, padding: "2px 5px", margin: "0 auto" }}>
                        <CardContent>
                        <div class="header">
                            <Typography gutterBottom variant="h5" align="center" style={{ fontWeight: 600 }} color="#333333">
                                Security Verification
                            </Typography> 
                        </div>
                        
        
                            
                            <Grid container spacing={1} direction="row" justify="center" alignItems="center">
        
                                <Grid item xs={12}>
                                <TextField id="" name="Authentication Code" placeholder="Enter 6-digit Authentication Code" label="Authentication Code" variant="outlined" 
                                /*onChange= {}*/ fullWidth required  />
                                </Grid>
        
                                
                            </Grid>

                            
                            <div class="auth-btn">
                                <Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" /*onClick={}*/ variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}} fullWidth>
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