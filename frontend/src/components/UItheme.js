import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
      primary: {
        main: "#5572c7"},
      secondary: {
        main: "#db4d4d"
      }
    },
    typography: {
      fontFamily: [
        'Poppins',
        'sans-serif',
        'Inconsolata'
      ].join(','),
    },
});

export default theme;