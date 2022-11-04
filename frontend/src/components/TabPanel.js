import { Box, Typography } from "@mui/material";

function TabPanel({ children, sx, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      style={{ maxHeight: "100%" }}
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ maxHeight: "100%" }} >
          {children}
        </Box>
      )}
    </div>
  );
}

export { TabPanel }