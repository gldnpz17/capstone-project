import { Box, Card, Typography } from "@mui/material"
import { Stack } from "@mui/system"
import { camelCaseToTitleCase } from "../common/camelCaseToTitleCase"
import { FormField } from "../common/FormField"
import { FormFrame } from "../common/FormFrame"
import { FormList } from "../common/FormList"
import { useForceRerender } from "../hooks/useForceRerender"
import { FieldComponent } from "./FieldComponent"
import { ListComponent } from "./ListComponent"

const FrameComponent = ({ instance }) => {
  useForceRerender(instance)

  if (!instance) return <div>Empty instance.</div>

  return (
    <Card variant="outlined" sx={{ p: 2, flexGrow: 1 }}>
      <Typography>{camelCaseToTitleCase(instance.template.title)}</Typography>
      <Stack spacing={1}>
        {Object.keys(instance.fieldInstances).map(fieldName => (
          <Stack key={fieldName} direction="row" spacing={1}>
            <Typography width={40}>{camelCaseToTitleCase(fieldName)}</Typography>
            <Box sx={{ flexGrow: 1 }}>
              {(() => {
                const fieldInstance = instance.fieldInstances[fieldName]
                if (fieldInstance.template instanceof FormField) {
                  return <FieldComponent instance={fieldInstance} />
                } else if (fieldInstance.template instanceof FormFrame) {
                  return <FrameComponent instance={fieldInstance} />
                } else if (fieldInstance.template instanceof FormList) {
                  return <ListComponent instance={fieldInstance} />
                } else {
                  throw new Error("Invalid instance type.")
                }
              })()}
            </Box>
          </Stack>
          ))}
      </Stack>
    </Card>
  )
}

export { FrameComponent }