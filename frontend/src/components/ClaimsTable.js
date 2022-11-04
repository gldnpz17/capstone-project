import React, { useCallback, useState } from 'react';
import '../styles/EditUser.css';
import '../styles/Global.css';
import { Typography, TextField, MenuItem, Button, IconButton } from '@mui/material';
import { ClaimsTypeSelect } from './ClaimsTypeSelect';
import { Delete } from '@mui/icons-material';

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

const ClaimsTableRow = ({ claim, onUpdateClaim, onDeleteClaim }) => {
    const handleDelete = async () => {
        await onDeleteClaim({ id: claim.id })
    }

    const handleChange = useCallback(async (e) => {
        await onUpdateClaim({
            id: claim.id,
            value: e.target.value
        })
    }, [claim, onUpdateClaim])

    return (
        <tr>
            <td>
                <Typography textAlign="start">{claim.type.name}</Typography>
            </td>
            <td>
                <ClaimValueField onChange={handleChange} claim={claim} />
            </td>
            <td>
                <IconButton onClick={handleDelete}>
                    <Delete />
                </IconButton>
            </td>
        </tr>
    )
}

const AddClaimTableRow = ({ claims, onAddClaim }) => {
    const [value, setValue] = useState(null)

    const handleAdd = useCallback(async (type) => {
        setValue(type)
        console.log("aaaaaa", type)
        await onAddClaim({ type })
        setValue(null)
    }, [onAddClaim])
  
    return (
        <tr>
            <td>
                <ClaimsTypeSelect disabled={Boolean(value)} onChange={handleAdd} value={value} 
                    label="Claim Type" disabledTypeIds={claims.map(claim => claim.type.id)}
                />
            </td>
            <td>
                <TextField size="small" disabled placeholder="Claim Value" />
            </td>
        </tr>
    )
}

const ClaimsTable = ({ claims, onAddClaim, onUpdateClaim, onDeleteClaim }) => {
    return (
        <table className="edit-user-content-table">
            <thead>
                <tr>
                    <th style={{ minWidth: "8rem" }}>Claim Type</th>
                    <th>Value</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {claims.map(claim => (
                    <ClaimsTableRow key={claim.id} {...{ claim, onUpdateClaim, onDeleteClaim }} />
                ))}
                <AddClaimTableRow key="add-claim-row" {...{ claims, onAddClaim }} />
            </tbody>
        </table>
    )
}

export { ClaimsTable }