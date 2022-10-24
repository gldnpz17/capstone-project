import { Add, Delete } from "@mui/icons-material"
import { Button, IconButton, Stack } from "@mui/material"
import { FormField } from "../common/FormField"
import { FormFrame } from "../common/FormFrame"
import { FormList } from "../common/FormList"
import { useForceRerender } from "../hooks/useForceRerender"
import { FieldComponent } from "./FieldComponent"
import { FrameComponent } from "./FrameComponent"

const ListComponent = ({ instance }) => {
  useForceRerender(instance)

  if (!instance) return <div>Empty instance.</div>

  return (
    <Stack spacing={1}>
      {instance.itemInstances.map((item, index) => (
        <Stack key={index} direction="row" alignItems="start">
          {(() => {
            if (item instanceof FormField.Instance) {
              return <FieldComponent instance={item} />
            } else if (item instanceof FormFrame.Instance) {
              return <FrameComponent instance={item} />
            } else if (item instanceof FormList.Instance) {
              return <ListComponent instance={item} />
            } else {
              throw new Error("Invalid instance type.")
            }
          })()}
          <IconButton onClick={instance.deleteItem(index)}>
            <Delete />
          </IconButton>
        </Stack>
      ))}
      <Button onClick={instance.addItem} startIcon={<Add />} variant="outlined">Add Item</Button>
    </Stack>
  )
}

export { ListComponent }