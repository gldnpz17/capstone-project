import React, { useState } from 'react';
import '../styles/Authority.css';
import AddUser from '../components/AddUser.js';
import { Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';
import theme from '../components/UItheme';

const AccManagement = () =>  {

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal)
  }

    return (
        <div class="main">

          <div class="add2-btn">
            <ThemeProvider theme={theme} >
              <Grid>
                  <Grid item xs={12}>
                      <Button type="submit" onClick={toggleModal} variant="contained" color="primary" value="" style={{ textTransform: 'none'}}>
                          <Typography style={{ fontWeight: 500 }}>Add User</Typography></Button>
                  </Grid>
              </Grid>
            </ThemeProvider>
          </div>

          <table class="content-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Authorities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>Authority1, Authority2</td>
                    <td>
                      <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
                      <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>Authority1, Authority2</td>
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
               <AddUser/>
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
