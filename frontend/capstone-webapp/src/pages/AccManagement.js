import React, { useState } from 'react';
import '../styles/AccManagement.css';
import { Card, CardContent,TextField, Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';

const AccManagement = () =>  {

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal)
  }

  const theme = createTheme({
    typography: {
      fontFamily: [
        'Poppins',
        'sans-serif',
      ].join(','),
    },});

    return (
        <div class="main">

          <div class="add2-btn">
            <ThemeProvider theme={theme} >
              <Grid>
                  <Grid item xs={12}>
                      <Button type="submit" onClick={toggleModal} variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}}>
                          <Typography style={{ fontWeight: 500 }}>Add User</Typography></Button>
                  </Grid>
              </Grid>
            </ThemeProvider>
          </div>

          <table class="content-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Authority</th>
                    <th>Claims</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>Mahasiswa</td>
                    <td>Authority</td>
                    <td>Claim</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                      <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>Dosen</td>
                    <td>Authority</td>
                    <td>Claim</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                      <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
          </table>     

        {modal && (
        <div className="modal">
          <div className="overlay">
            <div className="modal-content">
              <div className="cover-add">
                <ThemeProvider theme={theme} >
                    <Grid>
                        <Card style={{ maxWidth: 450, padding: "20px 5px", margin: "0 auto" }}>
                        
                        <CardContent>
                        
                        <Grid>
                            <div>
                                <button className="close-modal close-btn" onClick={toggleModal}>
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </Grid>
                        

                        <Grid container spacing={1}>
                            <div class="header">
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
              </div>
            </div>
        </div>
        )}
        </div>

        
    )
}

export default AccManagement
