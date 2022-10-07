import React, { useState } from 'react';
import '../styles/AccManagement.css';
import AddUser from '../components/AddUser.js';
import { Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';
import { useQuery } from '@apollo/client';
import { READ_ALL_ACCOUNTS, READ_ALL_CLAIM_TYPES } from '../queries/Accounts';

const AccountsTableRow = ({ 
    account: { username, privilegePreset, claims },
    claimTypes
}) => (
    <tr>
        <td>{username}</td>
        <td>{privilegePreset.name}</td>
        {claimTypes.map(type => (
            <td>{claims.find(claim => claim.type.id === type.id)?.value ?? "-" }</td>
        ))}
        <td>
            <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
            <button type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
        </td>
    </tr>
)

const AccManagement = () =>  {
  const [modal, setModal] = useState(false);

  const {
    data: { accounts } = { accounts: [] },
    loading: accountsLoading
  } = useQuery(READ_ALL_ACCOUNTS)

  const {
    data: { claimTypes } = { claimTypes: [] },
    loading: claimTypesLoading
  } = useQuery(READ_ALL_CLAIM_TYPES)

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

    console.log(claimTypes)

    return (
        <div class="main">
            <div class="add2-btn">
                <ThemeProvider theme={theme} >
                    <Grid>
                        <Grid item xs={12}>
                            <Button type="submit" onClick={toggleModal} variant="contained" color="primary" value="" style={{ textTransform: 'none'}}>
                                <Typography style={{ fontWeight: 500 }}>Add User</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </ThemeProvider>
            </div>

            {!(accountsLoading && claimTypesLoading) && (
                <table class="content-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Authority</th>
                            {claimTypes.map(type => (
                                <th>{type.name}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => (
                            <AccountsTableRow 
                                account={account}
                                claimTypes={claimTypes} 
                            />
                        ))}
                    </tbody>
                </table>    
            )} 

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
