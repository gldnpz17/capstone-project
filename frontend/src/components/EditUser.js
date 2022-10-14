import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/EditUser.css';
import AddClaim from './AddClaim.js'
import { Button, Typography, Grid, createTheme,ThemeProvider, Card, CardContent, TextField, MenuItem, Popper, Fade, Paper, useTheme } from '@mui/material';
import EditClaim from './AddClaim'
import { Box, Stack } from '@mui/system';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_CLAIM_TO_ACCOUNT, DELETE_CLAIM, READ_ACCOUNT_BY_ID, READ_ALL_CLAIM_TYPES, UPDATE_CLAIM } from '../queries/Accounts';
import { ADD_ENUM_OPTION, CREATE_CLAIM_TYPE, DELETE_CLAIM_TYPE, READ_CLAIM_TYPE_BY_ID as READ_CLAIM_TYPE_BY_ID, REMOVE_ENUM_OPTION } from '../queries/ClaimTypes';
import { handleForm } from '../common/handleForm';
import { Add } from '@mui/icons-material';
import { usePopup } from '../hooks/usePopup';

const DataTypeButton = ({ selectedDataType, dataType, setSelectedDataType, label, disabled }) => (
    <Button size="small" onClick={() => setSelectedDataType(dataType)} disabled={disabled}
        variant={dataType === selectedDataType ? "contained" : "outlined"}
    >
        {label}
    </Button>
)

const useEnumOptions = () => {
    const [enumOptions, setEnumOptions] = useState([])
    const addEnumOption = (value) => {
        if (value && !enumOptions.find(option => option === value)) {
            setEnumOptions([...enumOptions, value])
        }
    }
    const removeEnumOption = (value) => () => setEnumOptions(enumOptions.filter(option => option !== value))

    return {
        enumOptions,
        addEnumOption,
        removeEnumOption
    }
}

const ClaimDataTypeOptions = ({ disabled, dataType, setDataType, defaultDataType }) => {
    // The keys are the button labels and the 
    // values are the strings sent to the API.
    const dataTypes = {
        String: "string",
        Number: "number",
        Bool: "boolean",
        Enum: "enum"
    }

    useEffect(() =>{
        if (!defaultDataType && !dataType) setDataType(dataTypes[Object.keys(dataTypes)[0]])
    }, [])

    return (
        <Stack direction="row" gap={1} py={1}>
            {Object.keys(dataTypes).map(key => (
                <DataTypeButton
                    key={key}
                    label={key} 
                    dataType={dataTypes[key]}
                    selectedDataType={dataType}
                    setSelectedDataType={setDataType ?? (() => {})}
                    {...{ disabled }}
                />
            ))}
        </Stack>
    )
}

const ClaimTypeEnumOptions = ({ enumOptions, addEnumOption, removeEnumOption }) => {
    const { props } = useTheme()

    const handleAddEnumOption = handleForm(({ optionName }) => {
        addEnumOption(optionName)
    }, ["optionName"])

    return (
        <Stack>
            <form onSubmit={handleAddEnumOption} style={{ width: "100%" }}>
                <Stack direction="row" gap={1} alignItems="center" py={1}>
                    <TextField
                        name="optionName"
                        sx={{ flexGrow: 1 }} 
                        placeholder="Enter Option Name" 
                        label="New Option"
                        onKeyDown={e => e.stopPropagation()}
                        {...props.smallFormField}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        <Add />
                    </Button>
                </Stack>
            </form>
            <Grid container p={1}>
                {enumOptions.map(option => (
                    <Grid container spacing={1}>
                        <div className="claim-data">
                            <p className="claim-name">{option}</p>
                            <button onClick={removeEnumOption(option)} type="button" className="act-btn del-btn">
                                <i class="fa fa-trash"></i>
                            </button>   
                        </div>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}

const AddClaimForm = ({ close }) => {
    const [name, setName] = useState("")
    const [dataType, setDataType] = useState(null)
    const { enumOptions, addEnumOption, removeEnumOption } = useEnumOptions()

    const [createClaimType] = useMutation(CREATE_CLAIM_TYPE, {
        refetchQueries: [ { query: READ_ALL_CLAIM_TYPES } ]
    })

    const handleSave = async () => {
        await createClaimType({ 
            variables: { name, dataType, options: enumOptions } 
        })

        close()
    }

    const { props } = useTheme()

    return (
        <Stack>
            <TextField 
                placeholder="Enter Claim Name"
                label="Claim Name"
                value={name} onChange={e => setName(e.target.value)}
                required
                onKeyDown={e => e.stopPropagation()}
                {...props.smallFormField}
            />
            <ClaimDataTypeOptions {...{ dataType, setDataType }} />
            {dataType === "enum" && (
                <ClaimTypeEnumOptions {...{ enumOptions, addEnumOption, removeEnumOption }} />
            )}
            <Stack direction="row">
                <Button onClick={close} variant="outlined">Cancel</Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={handleSave} variant="contained">Save</Button>
            </Stack>
        </Stack>
    )
}

const EditClaimForm = ({ claimTypeId, close }) => {
    const { 
        data: {
            claimTypes: [{ name, dataType, options } = {}]
        } = { claimTypes: [] }, 
        loading 
    } = useQuery(READ_CLAIM_TYPE_BY_ID, { 
        variables: { id: claimTypeId } 
    })

    const [addEnumOption] = useMutation(ADD_ENUM_OPTION, {
        refetchQueries: [ { query: READ_CLAIM_TYPE_BY_ID } ]
    })

    const [removeEnumOption] = useMutation(REMOVE_ENUM_OPTION, {
        refetchQueries: [ { query: READ_CLAIM_TYPE_BY_ID } ]
    })
    
    const handleAddOption = async (value) => {
        await addEnumOption({
            variables: { claimTypeId, value }
        })
    }

    const handleRemoveOption = (value) => async () => {
        await removeEnumOption({
            variables: { id: options.find(o => o.value === value).id }
        })
    }

    const { props } = useTheme()

    if (loading) return <div>Loading...</div>

    return (
        <Stack>
            <TextField 
                placeholder="Enter Claim Name"
                label="Claim Name"
                value={name}
                required
                onKeyDown={e => e.stopPropagation()}
                disabled
                {...props.smallFormField}
            />
            <ClaimDataTypeOptions dataType={dataType} disabled />
            {dataType === "enum" && (
                <ClaimTypeEnumOptions 
                    enumOptions={options.map(o => o.value)}
                    addEnumOption={handleAddOption}
                    removeEnumOption={handleRemoveOption}
                />
            )}
            <Stack direction="row-reverse">
                <Button onClick={close} variant="contained">Close</Button>
            </Stack>
    </Stack>
    )
}

const ClaimTypeEditButton = ({ selectId, type, openClaimTypePopup }) => {
    const [top, setTop] = useState(0)
    const buttonRef = useRef()

    // TODO: Fix this stupid mess.
    // It works but it's so fucking stupid and could possibly lead to bugs in the future.
    // As for the reason why, it seems like the <MenuItem> component can only be a direct
    // descendant of the <Select> / <TextField> component so i can't wrap it in a div/<Box>.
    // And i couldn't put the button inside the <MenuItem> since if i disabled the <MenuItem>
    // it would also disable the button alongside it. Go come up w/ a better solution dumbass.
    useEffect(() => {
        let menuItem = null
        while (!menuItem) menuItem = document.getElementById(`${selectId}-${type.id}`)

        if (menuItem && buttonRef.current) {
            const { offsetTop, offsetHeight: menuItemHeight } = menuItem
            const { offsetHeight: buttonHeight } = buttonRef.current
            setTop(offsetTop + 0.5 * menuItemHeight - 0.5 * buttonHeight)
        }
    }, [])

    return (
        <button
            style={{ position: "absolute", right: "0.5rem", transition: "all 0.3s, top 0s", top, zIndex: 2000 }}
            disabled={false} ref={buttonRef}
            type="button" class="act-btn edit-btn"
            onClick={openClaimTypePopup}
        >
            <i class="fas fa-edit"></i>
        </button>
    )
}

const ClaimsTypeSelect = ({ label = "", disabled, disabledTypeIds, value, onChange }) => {
    const {
        data: { claimTypes } = {},
        loading: claimTypesLoading
    } = useQuery(READ_ALL_CLAIM_TYPES)

    const selectId = useMemo(() => Math.random(), [])

    const popupProps = {
        placement: "right-start",
        popperOptions: { 
            modifiers: [
                { name: "offset", options: { offset: [0, 24] } }
            ] 
        }
    }

    const [openAddPopup, renderAddPopup] = usePopup(AddClaimForm, popupProps)
    const [openEditPopup, renderEditPopup] = usePopup(EditClaimForm, popupProps)

    return (
        <TextField select size="small" disabled={disabled} label={label} fullWidth value={value} onChange={onChange}
            SelectProps={{
                MenuProps: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" }
                }
            }}
            sx={{ position: "relative" }}
        >
            {renderAddPopup()}
            {renderEditPopup()}
            {claimTypesLoading
                ? (
                    <MenuItem disabled>
                        <Typography>Loading claim types...</Typography>
                    </MenuItem>
                )
                : (
                    [
                        claimTypes.map(type => (
                            <MenuItem key={type.id} id={`${selectId}-${type.id}`} value={type.id} disabled={disabledTypeIds.find(id => type.id === id)}>
                                <Stack direction="row" width="100%" alignItems="center">
                                    <Typography textAlign="start" sx={{ flexGrow: 1, pr: 6 }}>{type.name}</Typography>
                                </Stack>
                            </MenuItem>
                        )),
                        claimTypes.map(type => (
                            <ClaimTypeEditButton 
                                openClaimTypePopup={openEditPopup({ claimTypeId: type.id })}
                                {...{ type, selectId }} 
                            />
                        )),
                        <Box px={2} py={1} sx={{ display: "flex", justifyContent: "center" }}>
                            <Button variant="contained" color="primary" value="" style={{ textTransform: 'none'}}
                                onClick={openAddPopup()}
                            >
                                <Typography>Add Claim Type</Typography>
                            </Button>
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
            field = <TextField onChange={onChange} size="small" defaultValue={value} fullWidth />
            break
        case 'number':
            field = <TextField onChange={onChange} size="small" defaultValue={value} fullWidth type="number" />
            break
        case 'enum':
            field = (
                <TextField onChange={onChange} sx={{ textAlign: "start" }} size="small" select fullWidth defaultValue={value}>
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
