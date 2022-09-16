import React from "react";
import "../styles/EditClaim.css";
import { MenuItem, Button, CardContent, Typography, Card, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'


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

                          
                      <div className="option-expand">
                        <Grid container>

                          <Grid item xs={12}>
                            <Typography gutterBottom align="center" style={{ fontWeight: 400, marginTop: 20, }} color="#333333">Options : </Typography>
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
            </div>
              

            );
    }
            
export default AddClaim;