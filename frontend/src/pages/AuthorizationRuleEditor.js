import '../styles/AuthorizationRuleEditor.css'
import Editor from "@monaco-editor/react"
import { PlayArrow, TextFields } from "@mui/icons-material"
import { Button, Grid, ListItem, Stack, Tab, Tabs, Typography, IconButton, TextField, CircularProgress } from "@mui/material"
import { Edit, Save, Close, RocketLaunch } from "@mui/icons-material"
import { Box } from "@mui/system"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RootComponent } from "../components/RootComponent"
import { Project, SyntaxKind, TypeReferenceNode, ArrayTypeNode } from "ts-morph"
import { useParams } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { APPLY_SCHEMA, DEPLOY_AUTHORIZATION_RULE, READ_AUTHORIZATION_RULE_BY_ID, READ_AUTHORIZATION_RULE_NAME, SAVE_AUTHORIZATION_RULE, TEST_AUTHORIZATION_RULE, UPDATE_AUTHORIZATION_RULE } from "../queries/AuthorizationRule"
import { TabPanel } from "../components/TabPanel"
import { AuthorizationRuleArgsForm } from "../components/AuthorizationRuleArgsForm"
import { ClaimsTable } from "../components/ClaimsTable"
import theme from "../components/UItheme"
import { READ_ALL_CLAIM_TYPES } from "../queries/Accounts"

const RuleName = ({ id }) => {
  const [isEditing, setIsEditing] = useState(false)
  const {
    data: { authorizationRules: [{ name }] } = { authorizationRules: [{}] },
    loading: nameLoading,
    refetch
  } = useQuery(READ_AUTHORIZATION_RULE_NAME, {
    variables: { id },
    skip: Number.isNaN(id),
    fetchPolicy: 'no-cache'
  })
  const [updateAuthorizationRule, { loading: updateLoading }] = useMutation(UPDATE_AUTHORIZATION_RULE)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const ruleName = e.target.ruleName.value

    await updateAuthorizationRule({
      variables: {
        id,
        authorizationRule: {
          name: ruleName
        }
      }
    })

    await refetch()

    setIsEditing(false)
  }

  if (nameLoading) return <></>

  return (
    <Stack direction="row" gap={1} alignItems="center">
      {isEditing
        ? (
          <form onSubmit={handleSubmit}>
            <TextField size="small" name="ruleName" defaultValue={name} />
            {!updateLoading && (
              <>
                <IconButton type="submit">
                  <Save />
                </IconButton>
                <IconButton onClick={() => setIsEditing(false)}>
                  <Close />
                </IconButton>
              </>
            )}
          </form>
        )
        : (
          <>
            <Typography>{name}</Typography>
            <IconButton onClick={() => setIsEditing(true)}>
              <Edit />
            </IconButton>
          </>
        )}
    </Stack>
  )
}

const AuthorizationRuleEditor = () => {
  const { ruleId } = useParams()

  const {
    data: { 
      authorizationRules: [rule] 
    } = { authorizationRules: [] },
    loading: ruleLoading
  } = useQuery(READ_AUTHORIZATION_RULE_BY_ID, { 
    variables: { id: Number.parseInt(ruleId) } 
  })

  const {
    data: { claimTypes } = {},
    loading: claimTypesLoading
  } = useQuery(READ_ALL_CLAIM_TYPES)

  const schema = useMemo(() => rule ? JSON.parse(rule.savedFormSchema) : null, [rule])

  const [editorContent, setEditorContent] = useState()
  const [formState, setFormState] = useState({})

  const [applySchema, { loading: applySchemaLoading }] = useMutation(APPLY_SCHEMA, {
    variables: { schema: rule?.savedFormSchema, values: JSON.stringify(formState) }
  })

  const updateSchema = useCallback(async () => {
    const oldState = JSON.stringify(formState)
    const newSchema = rule.savedFormSchema

    const { data: { applySchema: newState } } = await applySchema({
      variables: { schema: newSchema, values: oldState }
    })

    setFormState(JSON.parse(newState))

  }, [rule, formState])

  useEffect(() => {
    if (rule) setEditorContent(rule.savedRule)
  }, [rule])

  useEffect(() => {
    if (rule) updateSchema()
  }, [rule])

  const [saveAuthorizationRule, { loading: saveAuthorizationRuleLoading }] = useMutation(SAVE_AUTHORIZATION_RULE, {
    variables: { id: Number.parseInt(ruleId), authorizationRule: editorContent },
    refetchQueries: [ { query: READ_AUTHORIZATION_RULE_BY_ID } ]
  })

  const [tab, setTab] = useState(0)
  
  useEffect(() => {
    const callback = e => {
      if (e.ctrlKey && e.key == "s") {
        e.preventDefault()
        saveAuthorizationRule()
      }
    }

    document.addEventListener("keydown", callback)

    return () => document.removeEventListener("keydown", callback)
  }, [editorContent])

  const [claims, setClaims] = useState([])

  const onAddClaim = useCallback(async ({ type }) => {
    if (claims.find(claim => claim.type.id === type.id )) return
    const id = Math.random()
    setClaims([...claims, { id, type }])
  }, [claims])

  const onUpdateClaim = useCallback(async ({ id, value }) => {
    const newClaims = claims.slice()
    newClaims.find(claim => claim.id === id).value = value
    setClaims(newClaims)
  }, [claims])

  const onDeleteClaim = useCallback(async ({ id }) => {
    setClaims(claims.filter(claim => claim.id !== id))
  }, [claims])

  const mappedClaims = useMemo(() => {
    return claims.map(claim => ({
      typeId: claim.type.id,
      value: claim.value
    }))
  })

  const [testAuthorizationRule] = useMutation(TEST_AUTHORIZATION_RULE, {
    variables: { 
      id: Number.parseInt(ruleId), 
      args: JSON.stringify(formState),
      claims: mappedClaims
    }
  })

  const [logs, setLogs] = useState([])

  const handleRun = useCallback(async () => {
    const { 
      data: { testAuthorizationRule: { logMessages } } 
    } = await testAuthorizationRule()

    setLogs([...logs, ...logMessages])
  }, [testAuthorizationRule, logs])

  const [deployAuthorizationRule] = useMutation(DEPLOY_AUTHORIZATION_RULE, {
    variables: { id: ruleId },
    refetchQueries: [{ query: READ_AUTHORIZATION_RULE_BY_ID }]
  })

  const hasBeenDeployed = useMemo(() => {
    if (!rule) return false
    return rule.savedRule === rule.deployedRule
  }, [rule])

  return (
    <Stack sx={{ height: "100%", width: "100%" }}>
      <Stack flexDirection="row" sx={{ py: 1, px: 2, backgroundColor: theme.palette.primary.main, color: "white" }} gap={1} alignItems="center">
        <Typography><b>Authorization Rule Editor</b> -&nbsp;</Typography>
        <RuleName id={Number.parseInt(rule?.id)} />
        <Box sx={{ flexGrow: 1 }} />
        {(rule?.savedRule !== editorContent && !saveAuthorizationRuleLoading) && (
          <Typography>There are unsaved changes.</Typography>
        )}
        {saveAuthorizationRuleLoading && (
          <Typography>Saving changes...</Typography>
        )}
        <Button color="secondary" variant="contained" startIcon={<PlayArrow />} onClick={handleRun}>Run</Button>
        <Button color="secondary" variant="contained" disabled={hasBeenDeployed} startIcon={<RocketLaunch />} onClick={deployAuthorizationRule}>Deploy</Button>
      </Stack>
      {((ruleLoading || claimTypesLoading) || !schema)
        ? (
          <Typography>Loading...</Typography>
        )
        : (
          <>
            <Grid container sx={{ flexGrow: 1 }}>
              <Grid item xs={8}>
                <Editor
                  className="authorization-rule-editor"
                  height="100%"
                  defaultLanguage='typescript'
                  theme="vs-dark"
                  defaultValue={rule.savedRule}
                  onChange={text => setEditorContent(text)}
                  onMount={(editor, monaco) => {
                    setEditorContent(editor.getValue())
                    editor.getModel().updateOptions({ tabSize: 2 })
                    const smartLockLibUri = 'ts:filename/request.d.ts'
                    const smartLockLibSource = `
                      namespace SmartLock {
                        type ClaimTypes = ${claimTypes.map(type => `"${type.camelCaseName}"`).join(" | ")}
                        declare type Request {
                          log(message: any): void
                          claims: Record<ClaimTypes, string | number | boolean>
                          allow(): void
                          deny(message: string): void
                        }
                      }
                    `
                    monaco.languages.typescript.javascriptDefaults.addExtraLib(smartLockLibSource, smartLockLibUri)
                    monaco.editor.createModel(smartLockLibSource, 'typescript', monaco.Uri.parse(smartLockLibUri))
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <Stack sx={{ height: "100%", mx: 2 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(_, tab) => setTab(tab)}>
                      <Tab label="Claims" />
                      <Tab label="Arguments" />
                    </Tabs>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {/*CSS fuckery plz don't ask why.*/}
                    <Box sx={{ height: 0, minHeight: "100%", overflowY: "scroll" }}>
                      <TabPanel value={tab} index={0}>
                        <Box sx={{ py: 2 }}>
                          <ClaimsTable {...{ claims, onAddClaim, onUpdateClaim, onDeleteClaim }} />
                        </Box>
                      </TabPanel>
                      <TabPanel value={tab} index={1}>
                        <Stack sx={{ py: 2 }}>
                          {applySchemaLoading && (
                            <Typography>Applying new schema...</Typography>
                          )}
                          <AuthorizationRuleArgsForm {...{ schema, formState, setFormState }} />
                        </Stack>
                      </TabPanel>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
            <Stack sx={{ height: "15rem" }}>
              <Stack direction="row" sx={{ px: 2, py: 1, alignItems: "center", backgroundColor: theme.palette.primary.main, color: "white" }}>
                <Typography sx={{ flexGrow: 1 }}>OUTPUT</Typography>
                <Button color="secondary" sx={{ color: "white" }} variant="contained">Clear output</Button>
              </Stack>
              <Stack sx={{ overflowY: "scroll", flexGrow: 1 }}>
                {logs.map(log => (
                  <Typography fontSize={16} sx={{ cursor: "pointer", px: 2, ":hover": { backgroundColor: "#E8EBFC" } }} fontFamily="Inconsolata">{log}</Typography>
                ))}
              </Stack>
            </Stack>
          </>
        )
      }
    </Stack>
  )
}

export { AuthorizationRuleEditor }