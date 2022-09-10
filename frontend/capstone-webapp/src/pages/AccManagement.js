import React from 'react';
import '../styles/AccManagement.css';
import { Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';

const AccManagement = () =>  {

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
                    <Button type="submit" /*onClick={}*/ variant="outlined" color="primary" value="" style={{ backgroundColor: '#5572c7', color: '#FFFFFF', textTransform: 'none'}}>
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

                
           
        </div>
    )
}

export default AccManagement
