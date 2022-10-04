import React from "react";
import "../styles/AddUser.css";
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

                                <Grid item xs={12}>
                                <TextField id="" name="Username" placeholder="Enter Username" label="Username" variant="outlined" 
                                /*onChange= {}*/ fullWidth required />
                                </Grid>

                                <Grid item xs={12}>
                                <TextField id="" name="Authority" placeholder="Choose Authority" label="Authority" variant="outlined"  
                                /*onChange= {}*/ fullWidth required select />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png"
                                    alt="qr" width="150" height="150"></img>
                                </Grid>

                                <Grid item xs={8}>
                                <TextField id="" name="Shared-Secret" placeholder="Enter Code" label="Shared Secret" type="password" variant="outlined"  
                                /*onChange= {}*/ fullWidth required />
                                </Grid>

                                <Grid item xs={4}>
                                <Button className="btn-confirm" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                <Typography style={{ fontWeight: 500 }}>Confirm</Typography></Button>
                                </Grid>

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