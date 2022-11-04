import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import '../styles/EditUser.css';
import '../styles/Global.css';
import { Button, Typography, TextField, MenuItem, useTheme, Grid } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useMutation, useQuery } from '@apollo/client';
import { READ_ALL_CLAIM_TYPES } from '../queries/Accounts';
import { ADD_ENUM_OPTION, CREATE_CLAIM_TYPE, READ_CLAIM_TYPE_BY_ID as READ_CLAIM_TYPE_BY_ID, REMOVE_ENUM_OPTION } from '../queries/ClaimTypes';
import { usePopup } from '../hooks/usePopup';
import { handleForm } from "../common/handleForm"
import { Add } from '@mui/icons-material';

const DataTypeButton = ({ selectedDataType, dataType, setSelectedDataType, label, disabled }) => (
    <Button size="small" onClick={() => setSelectedDataType(dataType)} disabled={disabled}
        variant={dataType === selectedDataType ? "contained" : "outlined"}
    >
        {label}
    </Button>
)

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
            type="button" className="act-btn edit-btn"
            onClick={openClaimTypePopup}
        >
            <i className="fas fa-edit"></i>
        </button>
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
                    <Grid key={option} container spacing={1}>
                        <div className="claim-data">
                            <p className="claim-name">{option}</p>
                            <button onClick={removeEnumOption(option)} type="button" className="act-btn del-btn">
                                <i className="fa fa-trash"></i>
                            </button>   
                        </div>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}

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

const ClaimsTypeSelect = ({ label = "", disabled, disabledTypeIds, value, onChange }) => {
    const {
        data: { claimTypes } = {},
        loading: claimTypesLoading
    } = useQuery(READ_ALL_CLAIM_TYPES)

    const selectId = useMemo(() => Math.random(), [])

    const handleChange = useCallback((e) => {
        const id = e.target.value
        const claimType = claimTypes.find(type => type.id === id)
        onChange(claimType)
    }, [claimTypes, onChange])

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
        <TextField select size="small" disabled={disabled} label={label} fullWidth value={value?.id ?? ""} onChange={handleChange}
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
                            <MenuItem key={type.id} id={`${selectId}-${type.id}`} value={type.id} disabled={Boolean(disabledTypeIds.find(id => type.id === id))}>
                                <Stack direction="row" width="100%" alignItems="center">
                                    <Typography textAlign="start" sx={{ flexGrow: 1, pr: 6 }}>{type.name}</Typography>
                                </Stack>
                            </MenuItem>
                        )),
                        claimTypes.map(type => (
                            <ClaimTypeEditButton key={`edit-button-${type.id}`}
                                openClaimTypePopup={openEditPopup({ claimTypeId: type.id })}
                                {...{ type, selectId }} 
                            />
                        )),
                        <Box key="add-claim-type" px={2} py={1} sx={{ display: "flex", justifyContent: "center" }}>
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

export { ClaimsTypeSelect }