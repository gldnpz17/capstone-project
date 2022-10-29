import Editor from "@monaco-editor/react"
import { PlayArrow } from "@mui/icons-material"
import { Button, Grid, ListItem, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RootComponent } from "../components/RootComponent"
import { Project, SyntaxKind, TypeReferenceNode, ArrayTypeNode } from "ts-morph"

const DEFAULT_EDITOR_CODE = 
`class Args {
    foo: string
    bar: number[]
}

function authorize(args: Args) {

}
`

const mapPrimitiveState = (primitiveSchema, oldState) => {
  try {
    switch(primitiveSchema.primitiveType) {
      case 'number':
        return Number.parseFloat(oldState)
      case 'string':
        return typeof (oldState) === 'string' ? oldState : oldState.toString()
      default:
        return null
    }
  } catch {
    return null
  }
}

const mapListState = (listSchema, oldState) => {
  return oldState.map(state => {
    const schema = listSchema.itemSchema

    switch (schema.type) {
      case 'primitive':
        return mapPrimitiveState(schema, state)
      case 'list':
        return mapListState(schema, state)
      case 'group':
        return mapGroupState(schema, state)
    }
  })
}

const mapGroupState = (groupSchema, oldState) => {
  const newState = {}

  for (const name in groupSchema.fieldSchema) {
    if (!oldState[name]) {
      newState[name] = null
      continue
    }

    const schema = groupSchema.fieldSchema[name]
    switch (schema.type) {
      case 'primitive':
        newState[name] = mapPrimitiveState(schema, oldState[name])
        break
      case 'list':
        newState[name] = mapListState(schema, oldState[name])
        break
      case 'group':
        newState[name] = mapGroupState(schema, oldState[name])
        break
    }
  }

  return newState
}

class FormSchemaError extends Error {
  constructor(message) {
    super(message)
  }
}

const generateListSchema = (inputArrayType) => {
  const arrayType = inputArrayType.getFirstChildByKind(SyntaxKind.ArrayType)
  const typeReference = inputArrayType.getFirstChildByKind(SyntaxKind.TypeReference)
  const primitiveType = inputArrayType?.getType()?.getArrayElementType()?.compilerType?.['intrinsicName']

  let itemSchema = null
  if (arrayType) {
    itemSchema = generateListSchema(arrayType)
  } else if (typeReference) {
    itemSchema = generateGroupSchema(typeReference)
  } else if (primitiveType) {
    itemSchema = {
      type: 'primitive',
      primitiveType
    }
  } else {
    throw new FormSchemaError('Invalid AST node type for the Array\'s itemSchema.')
  }

  return {
    type: 'list',
    itemSchema
  }
}

const generateGroupSchema = (typeReference) => {
  const classDeclaration = typeReference
    ?.getFirstChildByKind(SyntaxKind.Identifier)
    ?.getDefinitionNodes()
    ?.find(definition => definition.isKind(SyntaxKind.ClassDeclaration))

  const name = classDeclaration?.getFirstChildByKind(SyntaxKind.Identifier)?.getText()

  if (!name) throw new FormSchemaError('Unabled to get class identifier.')

  const fieldSchema = classDeclaration
    ?.getFirstChildByKind(SyntaxKind.SyntaxList)
    ?.getChildrenOfKind(SyntaxKind.PropertyDeclaration)
    ?.reduce((propertyObject, property) => {
      const arrayType = property.getFirstChildByKind(SyntaxKind.ArrayType)
      const typeReference = property.getFirstChildByKind(SyntaxKind.TypeReference)
      const primitiveKeyword = [
        SyntaxKind.StringKeyword, 
        SyntaxKind.BooleanKeyword, 
        SyntaxKind.NumberKeyword
      ].find(syntaxKind => Boolean(property.getFirstChildByKind(syntaxKind)))

      let schema = null
      try {
        if (arrayType) {
          schema = generateListSchema(arrayType)
        } else if (typeReference) {
          schema = generateGroupSchema(typeReference)
        } else if (primitiveKeyword) {
          schema = {
            type: 'primitive',
            primitiveType: property?.getFirstChildByKind(primitiveKeyword)?.getText() ?? null
          }
        } else {
          throw new FormSchemaError('Invalid AST node type for the group\'s fieldSchema.')
        }
      } catch {
        return propertyObject
      }

      const propertyName = property?.getFirstChildByKind(SyntaxKind.Identifier)?.getText()

      if (!propertyName) throw new FormSchemaError('Can\'t resolve property name.')

      return {
        ...propertyObject,
        [propertyName]: schema
      }
    }, {})

  return {
    type: 'group',
    name,
    fieldSchema: fieldSchema ?? {}
  }
}

const generateFormSchema = (code) => {
  const project = new Project({ useInMemoryFileSystem: true })
  const source = project.createSourceFile("something.ts", code)

  const authorizeFunction = source
    .getFirstChildByKind(SyntaxKind.SyntaxList)
    ?.getChildrenOfKind(SyntaxKind.FunctionDeclaration)
    ?.find(func => func.getName() === 'authorize')

  if (!authorizeFunction) throw new FormSchemaError('Cannot find a function with the identifier "authorize".')

  const argsTypeReference = authorizeFunction
    ?.getFirstChildByKind(SyntaxKind.SyntaxList)
    ?.getChildrenOfKind(SyntaxKind.Parameter)
    ?.find(param => param.getName() === 'args')
    ?.getFirstChildByKind(SyntaxKind.TypeReference)

  if (!argsTypeReference) throw new FormSchemaError('Cannot find a parameter named "args" inside the "authorize" function.')

  return {
    root: generateGroupSchema(argsTypeReference)
  }
}

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

const defaultFormState = {
  schema: generateFormSchema(DEFAULT_EDITOR_CODE),
  state: {}
}

const AuthorizationRuleEditor = () => {
  const [editorContent, setEditorContent] = useState(DEFAULT_EDITOR_CODE)
  const [savedEditorContent, setSavedEditorContent] = useState(DEFAULT_EDITOR_CODE)
  const [form, setForm] = useState(defaultFormState)

  const setFormState = (newState) => setForm((oldForm) => ({ ...oldForm, state: { ...oldForm.state, ...newState } }))
  const setFormSchema = useCallback((schema) => setForm({ schema, state: mapGroupState(schema.root, form.state) }), [form.state])

  const changesSaved = useMemo(() => editorContent === savedEditorContent, [editorContent, savedEditorContent])

  useEffect(() => {
    setFormSchema(generateFormSchema(savedEditorContent))
  }, [savedEditorContent])

  useEffect(() => {
    const callback = e => {
      if (e.ctrlKey && e.key == "s") {
        setSavedEditorContent(editorContent)
        e.preventDefault()
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
        {!changesSaved && (
          <Typography>There are unsaved changes.</Typography>
        )}
        <Button variant="contained" startIcon={<PlayArrow />}>Run</Button>
      </Stack>
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid item xs={8}>
          <Editor 
            height="100%"
            defaultLanguage='typescript'
            defaultValue={DEFAULT_EDITOR_CODE}
            theme="vs-dark"
            onChange={text => setEditorContent(text)}
            onMount={(editor, _) => setEditorContent(editor.getValue())}
          />
        </Grid>
        <Grid item xs={4} sx={{ p: 2 }}>
          <FormGroup groupSchema={form.schema.root} state={form.state} setState={setFormState} />
        </Grid>
      </Grid>
      <Box sx={{ height: "10rem" }}>

      </Box>
    </Stack>
  )
}

export { AuthorizationRuleEditor }