import React, { useState } from "react";
import "../styles/SmartLockSetting.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Tabs, Tab, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

function SmartLockSetting({ lock }) {
    const [tab, setTab] = useState(0)

    return(
        <div className="cover-setting" style={{ zIndex: 3000 }}>
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
                    <Card style={{ width: 500, padding: "2px 5px", margin: "0 auto" }}>
                        <CardContent>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tab} onChange={(_, tab) => setTab(tab)}>
                                        <Tab label="Configuration" />
                                        <Tab label="Security" />
                                    </Tabs>
                                </Box>
                                <TabPanel value={tab} index={0}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <TextField id="" name="Name" placeholder="Enter Name" label="Name" variant="outlined" 
                                            /*onChange= {}*/ fullWidth required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField id="" name="wifiSsid" placeholder="My WiFi" label="WiFi SSID" variant="outlined" 
                                            /*onChange= {}*/ fullWidth required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField id="" name="wifiPassword" label="WiFi Password" variant="outlined" 
                                            /*onChange= {}*/ fullWidth required />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField id="" name="Connected-Device" label="Connected Device" variant="outlined"  
                                            /*onChange= {}*/ fullWidth required select />
                                        </Grid>
                                    </Grid>
                                </TabPanel>
                                <TabPanel value={tab} index={1}>
                                    <Grid container spacing={1}>                
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
                                </TabPanel>
                            </Box>
                            <div className="btn-submit">
                                <Grid className="btn">
                                    <Grid item xs={12}>
                                        <Button className="btn-save" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                                            <Typography style={{ fontWeight: 500 }}>Save</Typography></Button>
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
            
export default SmartLockSetting;