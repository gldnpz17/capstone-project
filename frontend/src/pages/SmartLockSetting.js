import React, { useState, useCallback, useMemo, useEffect } from "react";
import "../styles/SmartLockSetting.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Tabs, Tab, Box, MenuItem, Stack, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_AUTHORIZATION_RULE, READ_ALL_AUTHORIZATION_RULES } from "../queries/AuthorizationRule";
import { TabPanel } from "../components/TabPanel";
import { AuthorizationRuleArgsForm } from "../components/AuthorizationRuleArgsForm";
import { READ_ALL_LOCKS, UPDATE_SMART_LOCK_RULE } from "../queries/SmartLocks";
import { Edit } from "@mui/icons-material";

const SecuritySection = ({ lock, authorizationRules }) => {
    const [createAuthorizationRule] = useMutation(CREATE_AUTHORIZATION_RULE)
    const [ruleState, setRuleState] = useState({ ruleId: null, schema: null, formState: {} })
    const setSchema = useCallback((ruleId, schema) => {
        const lockRuleId = lock?.authorizationRule?.id
        let formState = {}
        if (ruleId === lockRuleId && lock.authorizationRuleArgs) {
            formState = JSON.parse(lock.authorizationRuleArgs)
        }

        setRuleState({ ruleId, schema, formState })
    }, [setRuleState, lock])

    const parsedSchema = useMemo(() => ruleState.schema ? JSON.parse(ruleState.schema) : null, [ruleState])
    const formState = ruleState.formState
    const setFormState = useCallback((newState) => {
        setRuleState((oldState) => {
            const oldFormState = oldState.formState
            const combinedState = {
                ...oldState,
                formState: {
                    ...oldFormState,
                    ...newState(oldFormState)
                }
            }

            return combinedState
        })
    }, [ruleState])

    
    useEffect(() => {
        const ruleId = lock?.authorizationRule?.id
        if (ruleId) {
            const rawFormState = lock.authorizationRuleArgs
            setRuleState({
                ruleId,
                schema: authorizationRules.find(rule => rule.id === ruleId).deployedFormSchema,
                formState: rawFormState ? JSON.parse(rawFormState) : {}
            })
        }
    }, [])

    const createNewRule = async () => {
        const { 
            data: { 
                createAuthorizationRule:  { id }
            }
        } = await createAuthorizationRule()

        window.open(`/admin/editor/${id}`, '_blank').focus()
    }

    const handleRuleChange = (e) => {
        const ruleId = e.target.value
        const rule = authorizationRules.find(rule => rule.id === ruleId)

        setSchema(rule?.id, rule?.deployedFormSchema)
    }

    const [updateSmartLockRule] = useMutation(UPDATE_SMART_LOCK_RULE, {
        refetchQueries: [{ query: READ_ALL_LOCKS }]
    })

    const handleCommitChanges = useCallback(async () => {
        await updateSmartLockRule({
            variables: {
                id: lock.id,
                ruleId: Number.parseInt(ruleState.ruleId),
                ruleArgs: JSON.stringify(ruleState.formState)
            }
        })
    }, [ruleState, lock])

    return (
        <Grid container spacing={1} sx={{ py: 2 }}>                
            <Grid item xs={8}>
                <TextField onChange={handleRuleChange}
                    label="Authorization Rule" defaultValue={lock?.authorizationRule?.id ?? "no-rule"} 
                    variant="outlined" fullWidth required select sx={{ textAlign: "left" }}
                >
                    <MenuItem key="no-rule" value="no-rule">No authorization rule</MenuItem>
                    {authorizationRules?.map(rule => (
                        <MenuItem key={rule.id} value={rule.id} sx={{ textAlign: "left" }}>{rule.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={4}>
                <Button onClick={createNewRule} className="btn-addrule" type="submit" variant="contained" color="primary" style={{ textTransform: 'none'}} fullWidth>
                    <Typography style={{ fontWeight: 500 }}>New Rule</Typography>
                </Button>
            </Grid>
            <Grid item xs={12}>
                {parsedSchema && (
                    <AuthorizationRuleArgsForm schema={parsedSchema} {...{ formState, setFormState }} />
                )}
            </Grid>
            <Grid item xs={12}>
                <Button onClick={handleCommitChanges} variant="contained" color="primary" style={{ textTransform: 'none'}} fullWidth>
                    <Typography style={{ fontWeight: 500 }}>Save</Typography>
                </Button>
            </Grid>
        </Grid>
    )
}

function SmartLockSetting({ lock }) {
    const {
        data: { authorizationRules } = {}
    } = useQuery(READ_ALL_AUTHORIZATION_RULES)

    return(
        <div className="cover-setting" style={{ zIndex: 3000 }}>
            <ThemeProvider theme={theme} >                    
                <Stack sx={{ p: 2 }} gap={1}>
                    <Typography variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
                        Settings
                    </Typography> 
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography align="left" style={{ fontWeight: 500 }} color="#333333">
                            <b>Lock :</b> E6
                        </Typography>
                        <IconButton>
                            <Edit />
                        </IconButton>
                    </Stack>
                    <Typography>
                        <b>Device MAC Address :</b> N/A
                    </Typography>
                </Stack>
                <Grid>
                    <Card style={{ width: 500, p: 2, margin: "0 auto" }}>
                        <CardContent>
                            <SecuritySection {...{ authorizationRules, lock }} />
                        </CardContent>
                    </Card>
                </Grid>
            </ThemeProvider>
        </div>
    );
}
            
export default SmartLockSetting;