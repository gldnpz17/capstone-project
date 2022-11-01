import Editor from "@monaco-editor/react"
import { PlayArrow } from "@mui/icons-material"
import { Button, Grid, ListItem, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RootComponent } from "../components/RootComponent"
import { Project, SyntaxKind, TypeReferenceNode, ArrayTypeNode } from "ts-morph"
import { useParams } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { APPLY_SCHEMA, READ_AUTHORIZATION_RULE_BY_ID, SAVE_AUTHORIZATION_RULE } from "../queries/AuthorizationRule"

const DEFAULT_EDITOR_CODE = 
`class Args {
    foo: string
    bar: number[]
}

function authorize(args: Args) {

}
`

const FormGroup = ({ groupSchema, state, setState }) => {
  useEffect(() => {
    if (!state) setState({})
  }, [state])

  const setField = useCallback((fieldName) => (value) => {
    setState({ ...state, [fieldName]: value })
  }, [state, setState])

  return (
    <div>
      {state && Object.keys(groupSchema.fieldSchema).map(name => {
        const schema = groupSchema.fieldSchema[name]
        return (
          <div key={name}>
            <span>{name}</span>
            <span>
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
            </span>
          </div>
        )
      })}
    </div>
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
    <div>
      {state && state.map((state, index) => {
        const schema = listSchema.itemSchema
        return (
          <div key={index}>
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
            <button onClick={deleteItem(index)}>delete</button>
          </div> 
        )
      })}
      <button onClick={addItem}>add item</button>
    </div>
  )
}

const FormPrimitive = ({ primitiveSchema, state, setState }) => {
  useEffect(() => {
    if (!state) setState("")
  }, [state])

  return (
    <input type="text" value={state ?? ""} onChange={e => setState(e.target.value)} />
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

  return (
    <Stack sx={{ height: "100%", width: "100%" }}>
      <Stack flexDirection="row" sx={{ p: 2 }} spacing={1} alignItems="center">
        <Typography>Authorization Rule Editor</Typography>
        <Box sx={{ flexGrow: 1 }} />
        {(rule?.savedRule !== editorContent && !saveAuthorizationRuleLoading) && (
          <Typography>There are unsaved changes.</Typography>
        )}
        {saveAuthorizationRuleLoading && (
          <Typography>Saving changes...</Typography>
        )}
        <Button variant="contained" startIcon={<PlayArrow />}>Run</Button>
      </Stack>
      {(ruleLoading || !schema)
        ? (
          <Typography>Loading...</Typography>
        )
        : (
          <>
            <Grid container sx={{ flexGrow: 1 }}>
              <Grid item xs={8}>
                <Editor 
                  height="100%"
                  defaultLanguage='typescript'
                  theme="vs-dark"
                  defaultValue={rule.savedRule}
                  onChange={text => setEditorContent(text)}
                  onMount={(editor, _) => setEditorContent(editor.getValue())}
                />
              </Grid>
              <Grid item xs={4} sx={{ p: 2 }}>
                <Stack>
                  {applySchemaLoading && (
                    <Typography>Applying new schema...</Typography>
                  )}
                  <FormGroup groupSchema={schema.root} state={formState} setState={(newState) => setFormState((oldState) => ({ ...oldState, ...newState }))} />
                </Stack>
              </Grid>
            </Grid>
            <Box sx={{ height: "10rem" }}>

            </Box>
          </>
        )
      }
    </Stack>
  )
}

export { AuthorizationRuleEditor }