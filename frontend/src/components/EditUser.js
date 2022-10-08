import React, { useMemo, useRef, useState } from 'react';
import '../styles/EditUser.css';
import AddClaim from './AddClaim.js'
import { Button, Typography, Grid, createTheme,ThemeProvider, Card, CardContent, TextField, MenuItem, Popper, Fade, Paper } from '@mui/material';
import EditClaim from './AddClaim'
import { Box, Stack } from '@mui/system';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_CLAIM_TO_ACCOUNT, DELETE_CLAIM, READ_ACCOUNT_BY_ID, READ_ALL_CLAIM_TYPES, UPDATE_CLAIM } from '../queries/Accounts';

const AddClaimTypeButton = () => {
    const anchorEl = useRef()
    const [popupOpen, setPopupOpen] = useState(false)

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

    const [datatypeselect, setDataType] = React.useState('str');

    const handleChange = (event) => {
      setDataType(event.target.value);
    };

    return (
        <>
            <Popper open={popupOpen} anchorEl={anchorEl?.current} transition 
                sx={{ zIndex: 2000 }} placement="right-start" 
                popperOptions={{ 
                    modifiers: [
                        { name: "offset", options: { offset: [0, 24] } }
                    ] 
                }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper sx={{ maxWidth: 400 }}>
                            <Grid>
                                <Card style={{ maxWidth: 400, padding: "2px 5px", margin: "0 auto" }}>
                                    <CardContent>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <TextField id="" size="small" name="Name" placeholder="Enter Claim Name" label="Claim Name" variant="outlined" 
                                                /*onChange= {}*/ fullWidth required />
                                        </Grid>

                                        <Stack direction="row" gap={1} p={1}>
                                            <Button variant="contained" size="small">String</Button>
                                            <Button variant="outlined" size="small">Number</Button>
                                            <Button variant="outlined" size="small">Bool</Button>
                                            <Button variant="outlined" size="small">Enum</Button>
                                        </Stack>
                                
                                        <div className="option-expand" id="OptionExpand">
                                            <Stack direction="row" gap={1} alignItems="center" p={1}>
                                                <TextField id="" sx={{ flexGrow: 1 }} size="small" name="New-Claim" placeholder="Enter Option Name" label="New Option" variant="outlined"  
                                                    /*onChange= {}*/ fullWidth />
                                                <Button className="btn-confirm" type="submit" variant="contained" color="primary" value="" style={{ textTransform: 'none'}}>
                                                    <Typography style={{ fontWeight: 500 }}>+</Typography>
                                                </Button>
                                            </Stack>
                                            <Grid container p={1}>
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
                                        </div>
                                    </Grid>
                                </CardContent>
                                </Card>
                            </Grid>
                        </Paper>
                    </Fade>
                )}
            </Popper>
            <Button variant="contained" color="primary" value="" style={{ textTransform: 'none'}}
                ref={anchorEl} onClick={() => setPopupOpen(true)}
            >
                <Typography style={{ fontWeight: 500 }}>Add Claim Type</Typography>
            </Button>
        </>
    )
}

const ClaimsTypeSelect = ({ label = "", disabled, disabledTypeIds, value, onChange }) => {
    const {
        data: { claimTypes } = {},
        loading: claimTypesLoading
    } = useQuery(READ_ALL_CLAIM_TYPES)

    return (
        <TextField select size="small" disabled={disabled} label={label} fullWidth value={value} onChange={onChange}
            SelectProps={{
                MenuProps: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" }
                }
            }}
        >
            {claimTypesLoading
                ? (
                    <MenuItem disabled>
                        <Typography>Loading claim types...</Typography>
                    </MenuItem>
                )
                : (
                    [
                        claimTypes.map(type => (
                            <MenuItem value={type.id} disabled={disabledTypeIds.find(id => type.id === id)}>
                                <Stack direction="row" width="100%" alignItems="center">
                                    <Typography textAlign="start" sx={{ flexGrow: 1 }}>{type.name}</Typography>
                                    {type.id !== value && (
                                        <button type="button" 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }} class="act-btn del-btn"
                                        >
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    )}
                                </Stack>
                            </MenuItem>
                        )),
                        <Box px={2} py={1} sx={{ display: "flex", justifyContent: "center" }}>
                            <AddClaimTypeButton />
                        </Box>
                    ]
                )
            }
        </TextField>
    )
}

const ClaimValueField = ({ claim: { type, value }, onChange }) => {
    let field = null
    switch (type.dataType) {
        case 'string':
            field = <TextField autoFocus onChange={onChange} size="small" defaultValue={value} fullWidth />
            break
        case 'number':
            field = <TextField autoFocus onChange={onChange} size="small" defaultValue={value} fullWidth type="number" />
            break
        case 'enum':
            field = (
                <TextField autoFocus onChange={onChange} sx={{ textAlign: "start" }} size="small" select fullWidth defaultValue={value}>
                    {type.options.map(({ value: optionValue }) => (
                        <MenuItem sx={{ textAlign: "start" }} key={optionValue} value={optionValue}>
                            {optionValue}
                        </MenuItem>
                    ))}
                </TextField>
            )
            break
    }

    return field
}

const AccountClaimsTableRow = ({ 
    claim 
}) => {
    const [updateClaim] = useMutation(UPDATE_CLAIM, {
        refetchQueries: [ { query: READ_ACCOUNT_BY_ID } ]
    })

    const [deleteClaim] = useMutation(DELETE_CLAIM, {
        refetchQueries: [ { query: READ_ACCOUNT_BY_ID } ],
        variables: { id: claim.id }
    })

    const handleChange = async (e) => {
        updateClaim({ 
            variables: {
                id: claim.id,
                value: e.target.value
            } 
        })
    }

    return (
        <tr>
            <td>
                <Typography textAlign="start">{claim.type.name}</Typography>
            </td>
            <td>
                <ClaimValueField onChange={handleChange} claim={claim} />
            </td>
            <td>
                <button onClick={deleteClaim} type="button" class="act-btn del-btn"><i class="fa fa-trash"></i></button>
            </td>
        </tr>
    )
}

const AddClaimTableRow = ({ accountId, claims }) => {
    const [value, setValue] = useState(null)

    const [addClaimToAccount] = useMutation(ADD_CLAIM_TO_ACCOUNT, {
        refetchQueries: [ { query: READ_ACCOUNT_BY_ID } ]
    })

    const handleAdd = async (e) => {
        setValue(e.target.value)

        await addClaimToAccount({ 
            variables: { 
                typeId: e.target.value,
                accountId
            } 
        })

        setValue(null)
    }
    
    return (
        <tr>
            <td>
                <ClaimsTypeSelect disabled={Boolean(value)} onChange={handleAdd} value={value} label="Claim Type" 
                    disabledTypeIds={claims.map(claim => claim.type.id)}
                />
            </td>
            <td>
                <TextField size="small" disabled placeholder="Claim Value" />
            </td>
        </tr>
    )
}

const AccountClaimsTable = ({ accountId, claims }) => {
    return (
        <table class="edit-user-content-table">
            <thead>
                <tr>
                    <th style={{ minWidth: "8rem" }}>Claim Type</th>
                    <th>Value</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {claims.map(claim => (
                    <AccountClaimsTableRow claim={claim} />
                ))}
                <AddClaimTableRow claims={claims} accountId={accountId} />
            </tbody>
        </table>
    )
}

const EditUser = ({ accountId }) =>  {
    const {
        data: { accounts: [account] } = { accounts: [] },
        loading: accountLoading
    } = useQuery(READ_ACCOUNT_BY_ID, { variables: { id: accountId } })

    if (accountLoading) return null

    return (
        <Grid>
            <Card style={{ maxWidth: 450, padding: "2px 5px", margin: "0 auto" }}>
                <CardContent>
                    <div>
                        <div class="user-field">
                            <div className='username-field'>
                                <p>Username : {account.username}</p>
                            </div>
                        </div>

                        <AccountClaimsTable claims={account.claims} accountId={accountId} />
                    </div>
                </CardContent>
            </Card>
        </Grid>
    )
}

export default EditUser
