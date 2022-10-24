import { Checkbox, TextField } from "@mui/material"
import { FormField } from "../common/FormField"
import { useForceRerender } from "../hooks/useForceRerender"

const FieldComponent = ({ instance }) => {
  useForceRerender(instance)

  if (!instance) return <div>Empty instance.</div>
  
  const { value, template: { dataType }, setValue: onChange } = instance
  
  switch (dataType) {
    case "string":
      return <TextField size="small" fullWidth {...{ value, onChange }} />
    case "number":
      return <TextField size="small" fullWidth type="number" {...{ value, onChange }} />
    case "boolean":
      return <Checkbox type="checkbox" {...{ value, onChange }} />
  }
}

export { FieldComponent }