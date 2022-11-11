import React, { useState } from 'react';
import '../styles/Global.css';
import AddUser from '../components/AddUser.js';
import { Button, Typography, Grid, createTheme,ThemeProvider } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_ACCOUNT, READ_ALL_ACCOUNTS, READ_ALL_CLAIM_TYPES } from '../queries/Accounts';
import { useModal } from '../hooks/useModal';
import EditUser from '../components/EditUser';
import theme from '../components/UItheme';
import { useOutletContext } from 'react-router-dom';
import { authorizePage, authorizeSuperAdminPage } from '../higher-order-components/authorizePage';

const AccountsTableRow = ({ 
    account: { id, username, privilegePreset, claims },
    claimTypes,
    openEditUserModal
}) => {
    const [deleteAccount] = useMutation(DELETE_ACCOUNT, { 
        variables: { id },
        refetchQueries: [ { query: READ_ALL_ACCOUNTS } ]
    })

    return (
        <tr>
            <td>{username}</td>
            <td>{privilegePreset.name}</td>
            {claimTypes.map(type => (
                <td>{claims.find(claim => claim.type.id === type.id)?.value ?? "-" }</td>
            ))}
            <td>
                <button 
                    type="button" class="act-btn edit-btn" 
                    onClick={openEditUserModal({ accountId: id })}
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="act-btn del-btn" onClick={() => deleteAccount()}>
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
    )
}

const AccManagement = () =>  {
    const {
        data: { accounts } = { accounts: [] },
        loading: accountsLoading
    } = useQuery(READ_ALL_ACCOUNTS)

    const {
        data: { claimTypes } = { claimTypes: [] },
        loading: claimTypesLoading
    } = useQuery(READ_ALL_CLAIM_TYPES)

    const { openAddUserModal, openEditUserModal } = useOutletContext()

    return (
        <div class="main">
            <div class="add2-btn">
                <ThemeProvider theme={theme} >
                    <Button type="submit" onClick={openAddUserModal()} variant="contained" color="primary" value="" style={{ textTransform: 'none'}}>
                        <Typography style={{ fontWeight: 500 }}>Add User</Typography>
                    </Button>
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
                                openEditUserModal={openEditUserModal}
                            />
                        ))}
                    </tbody>
                </table>    
            )} 
        </div>
    )
}

export default authorizeSuperAdminPage(AccManagement)
