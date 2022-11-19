import React, { useState, useCallback, useMemo, useEffect } from "react";
import "../styles/SmartLockSetting.css";
import { Button, CardContent, Typography, Card, Grid, TextField, Tabs, Tab, Box, MenuItem, Stack, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_AUTHORIZATION_RULE, READ_ALL_AUTHORIZATION_RULES } from "../queries/AuthorizationRule";
import { TabPanel } from "../components/TabPanel";
import { AuthorizationRuleArgsForm } from "../components/AuthorizationRuleArgsForm";
import { READ_ALL_LOCKS, UPDATE_SMART_LOCK_RULE, VERIFY_DEVICE } from "../queries/SmartLocks";
import { Edit, Link, QrCode } from "@mui/icons-material";
import { handleForm } from "../common/handleForm";
import QRCode from 'qrcode'
import html2pdf from "html2pdf.js";

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

    const openRuleEditor = (id) => {
        window.open(`/admin/editor/${id}`, '_blank').focus()
    }

    const createNewRule = async () => {
        const { 
            data: { 
                createAuthorizationRule:  { id }
            }
        } = await createAuthorizationRule()

        openRuleEditor(id)
    }

    const handleEditRule = (id) => (e) => {
        e.stopPropagation()

        openRuleEditor(id)
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
                        <MenuItem key={rule.id} value={rule.id} sx={{ textAlign: "left" }}>
                            <Stack direction="row" alignItems="center" width="100%">
                                <Typography sx={{ flexGrow: 1 }}>{rule.name}</Typography>
                                <IconButton onClick={handleEditRule(rule.id)}>
                                    <Edit />
                                </IconButton>
                            </Stack>
                        </MenuItem>
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

const VerifyDevice = ({ lock, close }) => {
    const [verifyDevice] = useMutation(VERIFY_DEVICE, {
        refetchQueries: [{ query: READ_ALL_LOCKS }]
    })

    const handleSubmit = handleForm(async ({ deviceId }) => {
        await verifyDevice({
            variables: { 
                smartLockId: lock.id,
                deviceId
            }
        })
        close()
    }, ["deviceId"])

    return (
        <Stack spacing={2}>
            <Typography>
                Scan the QR code in the ESP configuration page or enter the device ID manually
            </Typography>
            <form onSubmit={handleSubmit}>
                <Stack direction="row" spacing={1} justifyContent="center">
                    <TextField name="deviceId" label="Device ID" size="small" />
                    <Button type="submit" variant="contained">Verify</Button>
                </Stack>
            </form>
            <Button onClick={close} color="error" variant="contained">Cancel</Button>
        </Stack>
    )
}

function SmartLockSetting({ lock }) {
    const [mode, setMode] = useState("settings")

    const printQrCode = async () => {
        const container = document.createElement("div")
        container.style.padding = '2rem'

        const qrImage = document.createElement("img")
        const qrDataUrl = await QRCode.toDataURL(lock.id, { width: 1024 })
        qrImage.src = qrDataUrl
        qrImage.style.width = '32rem'
        qrImage.style.aspectRatio = '1'

        const lockNameDiv = document.createElement("div")
        const lockNameText = document.createTextNode(lock.name)
        lockNameDiv.appendChild(lockNameText)
        lockNameDiv.style.textAlign = 'center'

        container.appendChild(qrImage)
        container.appendChild(lockNameDiv)

        const result = await html2pdf()
            .from(container)
            .set({ margin: 2, filename: `qrcode_${lock.name.toLowerCase()}` })
            .toPdf()
            .get('pdf')

        window.open(result.output('bloburl'), '_blank')
    }

    const {
        data: { authorizationRules } = {},
        loading: authorizationRulesLoading
    } = useQuery(READ_ALL_AUTHORIZATION_RULES)

    if (authorizationRulesLoading) return <></>

    return(
        <div className="cover-setting" style={{ zIndex: 3000 }}>
            <ThemeProvider theme={theme} >                    
                <Stack sx={{ p: 2 }} gap={1}>
                    <Typography variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
                        Settings
                    </Typography> 
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography align="left" style={{ fontWeight: 500 }} color="#333333">
                            <b>Lock :</b> {lock.name}
                        </Typography>
                        <IconButton>
                            <Edit />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={printQrCode}>
                            <QrCode />
                        </IconButton>
                    </Stack>
                    <Stack direction="row" alignItems="center">
                        <Typography sx={{ flexGrow: 1 }}>
                            <b>Device MAC Address :</b> {lock?.device?.macAddress ?? 'N/A'}
                        </Typography>
                        <IconButton onClick={() => setMode('verify')}>
                            <Link />
                        </IconButton>
                    </Stack>
                </Stack>
                <Grid>
                    <Card style={{ width: 500, p: 2, margin: "0 auto" }}>
                        <CardContent>
                            {(() => {
                                switch (mode) {
                                    case 'settings':
                                        return <SecuritySection {...{ authorizationRules, lock }} />
                                    case 'verify':
                                        return <VerifyDevice {...{ lock, close: () => setMode('settings') }} />
                                }
                            })()}
                        </CardContent>
                    </Card>
                </Grid>
            </ThemeProvider>
        </div>
    );
}
            
export default SmartLockSetting;