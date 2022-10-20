import React from "react";
import "../styles/SmartLockSetting.css";
import { Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';


function SmartLockSetting() {

    return(

            <div className="cover-setting">
                <ThemeProvider theme={theme} >
                                            
                    <div className="cover-head">
                        <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
                            Settings
                        </Typography> 

                        <Typography className="header" gutterBottom align="left" style={{ fontWeight: 500 }} color="#333333">
                            Lock: E6
                        </Typography>    
                    </div>

                    <Grid>
                        <Card style={{ maxWidth: 540, padding: "2px 5px", margin: "0 auto" }}>
                        
                        <CardContent>
                        

                            <form /*onSubmit={}*/>
                            <Grid container spacing={1}>

                                <Grid item xs={12}>
                                <TextField id="" name="Name" placeholder="Enter Name" label="Name" variant="outlined" 
                                /*onChange= {}*/ fullWidth required />
                                </Grid>

                                <Grid item xs={12}>
                                <TextField id="" name="Connected-Device" label="Connected Device" variant="outlined"  
                                /*onChange= {}*/ fullWidth required select />
                                </Grid>                            

                                <Grid item xs={8}>
                                <TextField id="" name="Authorization-Rule" label="Authorization Rule" variant="outlined"  
                                /*onChange= {}*/ fullWidth required select />
                                </Grid>

                                <Grid item xs={4}>
                                <Button className="btn-addrule" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                <Typography style={{ fontWeight: 500 }}>Add Rule</Typography></Button>
                                </Grid>

                                <Grid item xs={12} spacing={1}>
                                    <TextField
                                        id="Auth-Custom"
                                        label="Authorization Rule Customization"
                                        fullwidth
                                        multiline
                                        rows={4}
                                        defaultValue=""    
                                    />
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
            
export default SmartLockSetting;