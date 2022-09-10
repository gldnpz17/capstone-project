import React from 'react';
import '../styles/AddUser.css'
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
                            User Setting
                        </Typography> 
                    </div>
                    
    
                        <form /*onSubmit={}*/>
                        <Grid container spacing={1}>
    
                            <Grid item xs={12}>
                            <TextField id="" name="Username" placeholder="Enter Username" label="Username" variant="outlined" 
                            /*onChange= {}*/ fullWidth required />
                            </Grid>
    
                            <Grid item xs={12}>
                            <TextField id="" name="Role" placeholder="Choose Role" label="Role" type="password" variant="outlined"  
                            /*onChange= {}*/ fullWidth required select />
                            </Grid>

                            <Grid item xs={12}>
                            <TextField id="" name="Authority" placeholder="Choose Authority" label="Authority" variant="outlined"  
                            /*onChange= {}*/ fullWidth required select />
                            </Grid>
    
                            
                        </Grid>

                        
                        <div class="login-btn">
                            <Grid>
                                <Grid item xs={12}>
                                    <Button type="submit" /*onClick={}*/ variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}} fullWidth>
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