import Editor from "@monaco-editor/react"
import { PlayArrow } from "@mui/icons-material"
import { Button, Grid, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useEffect, useMemo, useState } from "react"
import { RootComponent } from "../components/RootComponent"

const DEFAULT_EDITOR_CODE = 
`class Args {
    foo: string
    bar: number[]
}

function authorize(args: Args) {

}
`

const AuthorizationRuleEditor = () => {
  const [editorContent, setEditorContent] = useState(DEFAULT_EDITOR_CODE)
  const [savedEditorContent, setSavedEditorContent] = useState(DEFAULT_EDITOR_CODE)
  const [formValues, setFormValues] = useState({})

  const changesSaved = useMemo(() => editorContent === savedEditorContent, [editorContent, savedEditorContent])

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

  const onChange = (values) => setFormValues(values)

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
          <RootComponent {...{ editorContent: savedEditorContent, onChange }} />
        </Grid>
      </Grid>
      <Box sx={{ height: "10rem" }}>

      </Box>
    </Stack>
  )
}

export { AuthorizationRuleEditor }