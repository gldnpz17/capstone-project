import { useCallback, useEffect, useMemo } from "react"
import { TextField, Checkbox, Stack, Box, Typography, Button, IconButton, Card } from "@mui/material"
import { Delete, Add } from "@mui/icons-material"
import { camelCaseToTitleCase } from "../common/camelCaseToTitleCase"

const FormGroup = ({ groupSchema, state, setState, isRoot = false }) => {
    useEffect(() => {
        if (!state) setState({})
    }, [state])

    const setField = useCallback((fieldName) => (value) => {
        setState({ ...state, [fieldName]: value })
    }, [state, setState])

    const content = (
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
                                        return <FormGroup groupSchema={schema} state={state[name]} setState={setField(name)} />
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

    if (isRoot) {
        return content
    } else {
        return (
            <Card variant="outlined" sx={{ px: 2, py: 1 }}>
                {content}
            </Card>
        )
    }
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
                                        return <FormGroup groupSchema={schema} state={state} setState={setItem(index)} />
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

    const mappedFieldProps = { size: "small", minWidth: 0, fullWidth: true, ...fieldProps }

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

const AuthorizationRuleArgsForm = ({ schema, formState, setFormState }) => (
    <FormGroup 
        groupSchema={schema.root} 
        state={formState} 
        setState={(newState) => setFormState((oldState) => ({ ...oldState, ...newState }))}
        isRoot
    />
)

export { AuthorizationRuleArgsForm }