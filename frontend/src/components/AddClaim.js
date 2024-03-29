import React from "react";
import "../styles/AddClaim.css";
import { MenuItem, Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { display } from "@mui/system";
import theme from '../components/UItheme';

const DataType = [
  {
    value: 'str',
    label: 'String',
  },
  {
    value: 'enum',
    label: 'Enum',
  },
  {
    value: 'num',
    label: 'Number',
  },
  {
    value: 'option',
    label: 'Option',
  },
];

function AddClaim() {

    const [datatypeselect, setDataType] = React.useState('str');

    const handleChange = (event) => {
      setDataType(event.target.value);
    };

    return(


            <div className="cover-claim">
                <ThemeProvider theme={theme} >
                    <Grid>
                        <Card style={{ maxWidth: 450, padding: "2px 5px", margin: "0 auto" }}>
                        
                        <CardContent>

                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                              <TextField id="" name="Name" placeholder="Enter Claim Name" label="Claim Name" variant="outlined" 
                              /*onChange= {}*/ fullWidth required />
                          </Grid>

                          <Grid item xs={12} style={{ marginTop:10 }}>
                              <TextField id="" name="DataType" placeholder="Enter Data Type" label="Data Type" variant="outlined" 
                              /*onChange= {}*/ select fullWidth required value={datatypeselect} onChange={handleChange} >
                                {DataType.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                                
                              </TextField>
                          </Grid>
                          
                      <div className="option-expand" id="OptionExpand">
                        <Grid container>

                          <Grid item xs={12}>
                            <Typography gutterBottom align="center" style={{ fontWeight: 400, marginTop: 20, marginBottom: 10 }} color="#333333">Options : </Typography>
                          </Grid>

                          <Grid container spacing={1}>
                            <div className="claim-data">
                              <p className="claim-name">Teknologi Informasi</p>
                              <button type="button" className="act-btn del-btn"><i class="fa fa-trash"></i></button>   
                            </div>
                          </Grid>

                          <Grid container spacing={1}>
                            <div className="claim-data">
                              <p className="claim-name">Teknik Elektro</p>
                              <button type="button" className="act-btn del-btn"><i class="fa fa-trash"></i></button>   
                            </div>
                          </Grid>

                        </Grid>

                        <Grid container spacing={1} style={{ marginTop:10 }}>
                          <Grid item xs={8}>
                            <TextField id="" name="New-Claim" placeholder="Enter Option Name" label="New Option" type="password" variant="outlined"  
                            /*onChange= {}*/ fullWidth />
                          </Grid>

                          <Grid item xs={4}>
                            <Button className="btn-confirm" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
                            <Typography style={{ fontWeight: 500 }}>Add</Typography></Button>
                          </Grid>
                        </Grid>
                        
                      </div>

                        </Grid>
                        </CardContent>
                        </Card>
                    </Grid>
                </ThemeProvider>

                <script>
                  document.getElementById("OptionExpand").style.display = "none";
                </script>
            </div>

            );

  
    }

    
            
export default AddClaim;