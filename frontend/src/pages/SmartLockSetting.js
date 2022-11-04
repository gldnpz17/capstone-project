import React, { useState, useCallback, useMemo, useEffect } from "react";
import "../styles/SmartLockSetting.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Tabs, Tab, Box, MenuItem } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_AUTHORIZATION_RULE, READ_ALL_AUTHORIZATION_RULES } from "../queries/AuthorizationRule";
import { TabPanel } from "../components/TabPanel";
import { AuthorizationRuleArgsForm } from "../components/AuthorizationRuleArgsForm";
import { READ_ALL_LOCKS, UPDATE_SMART_LOCK_RULE } from "../queries/SmartLocks";

const GeneralSection = ({}) => {
    return (
        <Grid container spacing={1} sx={{ py: 2 }}>
            <Grid item xs={12}>
                <TextField id="" name="Name" placeholder="Enter Name" label="Name" variant="outlined" 
                /*onChange= {}*/ fullWidth required />
            </Grid>
            <Grid item xs={12}>
                <TextField id="" name="wifiSsid" placeholder="My WiFi" label="WiFi SSID" variant="outlined" 
                /*onChange= {}*/ fullWidth required />
            </Grid>
            <Grid item xs={12}>
                <TextField id="" name="wifiPassword" label="WiFi Password" variant="outlined" 
                /*onChange= {}*/ fullWidth required />
            </Grid>
            <Grid item xs={12}>
                <TextField id="" name="Connected-Device" label="Connected Device" variant="outlined"  
                /*onChange= {}*/ fullWidth required />
            </Grid>
        </Grid>
    )
}

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
    const [tab, setTab] = useState(0)
    const {
        data: { authorizationRules } = {}
    } = useQuery(READ_ALL_AUTHORIZATION_RULES)

    return(
        <div className="cover-setting" style={{ zIndex: 3000 }}>
            <ThemeProvider theme={theme} >                    
                <div className="cover-head">
                    <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
                        Settings
                    </Typography> 

                    <Typography className="header" gutterBottom align="left" style={{ fontWeight: 500 }} color="#333333">
                        Lock: E6
                    </Typography>    
                </div>
                <Grid>
                    <Card style={{ width: 500, padding: "2px 5px", margin: "0 auto" }}>
                        <CardContent>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tab} onChange={(_, tab) => setTab(tab)}>
                                        <Tab label="Configuration" />
                                        <Tab label="Security" />
                                    </Tabs>
                                </Box>
                                <TabPanel value={tab} index={0}>
                                    <GeneralSection />
                                </TabPanel>
                                <TabPanel value={tab} index={1}>
                                    <SecuritySection {...{ authorizationRules, lock }} />
                                </TabPanel>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </ThemeProvider>
        </div>
    );
}
            
export default SmartLockSetting;