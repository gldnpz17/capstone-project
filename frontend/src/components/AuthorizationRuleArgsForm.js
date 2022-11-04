import { useCallback, useEffect, useMemo } from "react"
import { TextField, Checkbox, Stack, Box, Typography, Button, IconButton, Card } from "@mui/material"
import { Delete, Add } from "@mui/icons-material"
import { camelCaseToTitleCase } from "../common/camelCaseToTitleCase"

const FormGroup = ({ groupSchema, state, setState}) => {
    useEffect(() => {
        if (!state) setState({})
    }, [state])

    const setField = useCallback((fieldName) => (value) => {
        setState({ ...state, [fieldName]: value })
    }, [state, setState])

    return (
        <Stack gap={2}>
            {state && Object.keys(groupSchema.fieldSchema).map(name => {
                const schema = groupSchema.fieldSchema[name]
                return (
                    <Stack key={name} direction="row">
                        <Typography sx={{ minWidth: "5rem", mt: 1 }}>{camelCaseToTitleCase(name)}</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                            {(() => {
                                switch (schema.type) {
                                    case 'group':
                                        return (
                                            <Card variant="outlined" sx={{ px: 2, py: 1 }}>
                                                <FormGroup groupSchema={schema} state={state[name]} setState={setField(name)} />
                                            </Card>
                                        )
                                    case 'list':
                                        return <FormList listSchema={schema} state={state[name]} setState={setField(name)} />
                                    case 'primitive':
                                        return <FormPrimitive primitiveSchema={schema} state={state[name]} setState={setField(name)} />
                                } 
                            })()}
                        </Box>
                    </Stack>
                )
            })}
        </Stack>
    )
}

const FormList = ({ listSchema, state, setState }) => {
    useEffect(() => {
        if (!state) setState([])
    }, [state])

    const setItem = useCallback((index) => (value) => {
        const newArray = state.slice()
        newArray.splice(index, 1, value)
        setState(newArray)
    }, [state, setState])

    const addItem = useCallback(() => {
        setState([...state, null])
    }, [state, setState])

    const deleteItem = useCallback((index) => () => {
        const newArray = state.slice()
        newArray.splice(index, 1)
        setState(newArray)
    }, [state, setState])

    return (
        <Stack gap={1}>
            {state && state.map((state, index) => {
                const schema = listSchema.itemSchema
                return (
                    <Stack key={index} direction="row" alignItems="start">
                        <Box sx={{ flexGrow: 1 }}>
                            {(() => {
                                switch (schema.type) {
                                    case 'group':
                                        return (
                                            <Card variant="outlined" sx={{ px: 2, py: 1 }}>
                                                <FormGroup groupSchema={schema} state={state} setState={setItem(index)} />
                                            </Card>
                                        ) 
                                    case 'list':
                                        return <FormList listSchema={schema} state={state} setState={setItem(index)} />
                                    case 'primitive':
                                        return <FormPrimitive primitiveSchema={schema} state={state} setState={setItem(index)} />
                                }
                            })()}
                        </Box>
                        <IconButton onClick={deleteItem(index)}>
                            <Delete />
                        </IconButton>
                    </Stack> 
                )
            })}
            <Button onClick={addItem} startIcon={<Add />} variant="contained">add item</Button>
        </Stack>
    )
}

const FormPrimitive = ({ primitiveSchema, state, setState }) => {
    const defaultValues = {
        string: "",
        number: 0,
        boolean: false
    }

    useEffect(() => {
        if (!state) setState(defaultValues[primitiveSchema.primitiveType])
    }, [state])

    const fieldProps = useMemo(() => {
        switch (primitiveSchema.primitiveType) {
            case "string":
                return {
                    value: state ?? defaultValues.string,
                    onChange: (e) => e.target.value
                }
            case "number":
                return {
                    value: state ?? defaultValues.number,
                    onChange: (e) => Number.parseFloat(e.target.value)
                }
            case "boolean":
                return {
                    checked: state ?? defaultValues.boolean,
                    onChange: (e) => Boolean(e.target.checked)
                }
            default:
                throw new Error("Invalid primitive type.")
        }
    }, [state])

    const mappedFieldProps = { size: "small", fullWidth: true, ...fieldProps }

    switch (primitiveSchema.primitiveType) {
        case "string":
            return <TextField type="text" {...mappedFieldProps} />
        case "number":
            return <TextField type="number" {...mappedFieldProps} />
        case "boolean":
            return <Checkbox {...mappedFieldProps} />
        default:
            return <></>
    }
}

const removeNullFromObject = (obj) => {
    const newObj = {}
    for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) continue

    if (typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) {
        newObj[key] = removeNullFromObject(obj[key])
        continue
    }
    
    newObj[key] = obj[key]
    }

    return newObj
}

const AuthorizationRuleArgsForm = ({ schema, formState, setFormState }) => {
    const handleSetState = useCallback((newState) => {
        setFormState((oldState) => {
            const newStateWithoutNulls = removeNullFromObject(newState)
            return ({ ...oldState, ...newStateWithoutNulls })
        })
    }, [setFormState])

    return (
        <FormGroup 
            groupSchema={schema.root} 
            state={formState} 
            setState={handleSetState}
        />
    )
}

export { AuthorizationRuleArgsForm }