import React, { useState } from 'react';
import '../styles/ClaimManagement.css';
import AddClaim from '../components/AddClaim.js';
import { Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';
import EditClaim from '../components/AddClaim';

const AccManagement = () =>  {

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal)
  }

  const theme = createTheme({

    palette: {
      primary: {
        main: "#5572c7"},
      secondary: {
        main: "#db4d4d"
      }
    },
    typography: {
      fontFamily: [
        'Poppins',
        'sans-serif',
      ].join(','),
    },});

    return (
        <div class="main">

        <div class="user-field">
            <div className='username-field'>
                <p>Username : </p>
            </div>

            <div className='username-field'>
                <p>Claims :  </p>
            </div>
        </div>

          <table class="content-table">
                <thead>
                  <tr>
                    <th>Claim Type</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>Value</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>Value</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                    </td>
                  </tr>
                </tbody>
          </table>

          <div class="add2-btn">
            <ThemeProvider theme={theme} >
              <Grid>
                  <Grid item xs={12}>
                      <Button type="submit" onClick={toggleModal} variant="contained" color="primary" value="" style={{ textTransform: 'none'}}>
                          <Typography style={{ fontWeight: 500 }}>Add Claim Type</Typography></Button>
                  </Grid>
              </Grid>
            </ThemeProvider>
          </div>     

        {modal && (
        <div className="modal">
          <div className="overlay">
            <div className="modal-content">
               <AddClaim/>
               <div>
                <button className="btn-cancel" onClick={toggleModal} style={{ textTransform: 'none'}}><p>Cancel</p></button>
               </div>
            </div>
          </div>
        </div>
        )}
        </div>

        

    )


}

export default AccManagement
