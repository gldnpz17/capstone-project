import { useCallback, useEffect, useState } from "react"
import { FormRoot } from "../common/FormRoot"
import { useForceRerender } from "../hooks/useForceRerender"
import { FormErrorBoundary } from "./FormErrorBoundary"
import { FrameComponent } from "./FrameComponent"

const RootComponent = ({ editorContent, onChange }) => {
  const [formRoot] = useState(new FormRoot())

  const { rerender } = useForceRerender(formRoot.formFrameInstance)

  const setCode = useCallback(() => {
    try {
      formRoot.setCode(editorContent) 
    } catch(err) {
      console.error(err)
    }
  }, [editorContent])

  useEffect(() => {
    setCode()
  }, [editorContent])

  useEffect(() => {
    setCode()
    rerender()
  }, [])

  useEffect(() => {
    const unsubscribe = formRoot.addValueListener(onChange)
    return () => unsubscribe()
  }, [onChange])

  return (
    <FormErrorBoundary {...{ editorContent }} >
      <FrameComponent instance={formRoot.formFrameInstance} />
    </FormErrorBoundary>
  )
}

export { RootComponent }