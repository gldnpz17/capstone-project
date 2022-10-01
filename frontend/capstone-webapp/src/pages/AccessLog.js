import * as React from 'react';
import Box from '@mui/material/Box';
import "../styles/SmartLockList.css";
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Typography} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'


function QuickSearchToolbar() {
    return (
      <Box
        sx={{
          p: 0.5,
          pb: 0,
          color: 'white',
          m: 1,
        }}
      >
        <GridToolbarQuickFilter />
      </Box>
    );
  }

const theme = createTheme({

    palette: {
        primary: {
         main: "#5572c7"}
      },
    typography: {
      fontFamily: [
        'Poppins',
        'sans-serif',
      ].join(','),
    },});

    const columns = [
        {
          field: 'time',
          headerName: 'Time',
          headerClassName: 'headrow',
          width: 260,
          editable: true,
          headerAlign:'center',
          align: 'center',
        },
        {
          field: 'action',
          headerName: 'Action',
          headerClassName: 'headrow',
          width: 200,
          editable: true,
          headerAlign:'center',
          align: 'center',
        },
        {
          field: 'performed',
          headerName: 'Performed By',
          headerClassName: 'headrow',
          width: 190,
          editable: true,
          headerAlign:'center',
          align: 'center',
        },

      ];
      
      const rows = [ 
        { id: 1, time: '1994-11-05T08:15:30-05:00', action: 'Open', performed:'User1' },
        { id: 2, time: '1994-11-05T08:15:30-05:00', action: 'Lock', performed:'User8' },
        { id: 1, time: '1994-11-05T08:15:30-05:00', action: 'Open', performed:'User9' },
      ];  

function AccessLog() {
    return (
    <div className='cover-smartlocklist'>
        <ThemeProvider theme={theme}>
            
            <div className="cover-addlock">
            <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
                Access Logs
            </Typography> 

            <Typography className="header" gutterBottom align="left" style={{ fontWeight: 500 }} color="#333333">
                Lock: E6
            </Typography> 
            

            </div>

        <Box sx={{ height: 400, '& .headrow': {
                backgroundColor: '#5572c7', color: 'white'
            }, }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                experimentalFeatures={{ newEditingApi: true }}
                components={{ Toolbar: QuickSearchToolbar }}
            />
        </Box>
        </ThemeProvider>
    </div>
    );
  }
  
  export default AccessLog;