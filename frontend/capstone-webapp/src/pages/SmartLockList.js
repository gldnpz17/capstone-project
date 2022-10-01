import * as React from 'react';
import Box from '@mui/material/Box';
import "../styles/SmartLockList.css";
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Link, Button, Typography, Grid, TextField } from '@mui/material';
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
  { field: 'id', headerName: 'ID', width: 90, headerClassName: 'headrow', headerAlign:'center', align: 'center', },
  {
    field: 'name',
    headerName: 'Name',
    headerClassName: 'headrow',
    width: 150,
    editable: true,
    headerAlign:'center',
    align: 'center',
  },
  {
    field: 'status',
    headerName: 'Status',
    headerClassName: 'headrow',
    width: 150,
    editable: true,
    headerAlign:'center',
    align: 'center',
  },
  {
    field: 'connection',
    headerName: 'Connection',
    headerClassName: 'headrow',
    width: 150,
    editable: true,
    headerAlign:'center',
    align: 'center',
  },
  {
    field: 'action',
    headerName: 'Actions',
    headerClassName: 'headrow',
    headerAlign:'center',
    align:'center',
    width: 110,
    renderCell: (cellValues) => {
      return (
        <div>
          <button type="button" class="act-btn edit-btn"><i class="fas fa-edit"></i></button>
          <button type="button" class="act-btn list-btn"><i class="fa fa-list"></i></button>
        </div>
      );
    }
  },
];

const rows = [ 
  { id: 1, name: 'E6', status: 'Locked', connection:'Connected' },
  { id: 2, name: 'E5', status: 'Open', connection:'Connected' },
  { id: 3, name: 'Ruang Sidang', status: 'Locked', connection:'Connected' },
];

export default function DataGridDemo() {
  return (
    <div className='cover-smartlocklist'>
      <ThemeProvider theme={theme}>
        
        <div className="cover-addlock">
          <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
            <i class="fas fa-lock"></i>Add New Lock
          </Typography> 

          <Grid container spacing={1} className="grid-addlock">

            <Grid item xs={4}>
              <TextField id="" name="Name" placeholder="Name" label="Name" variant="outlined"  
              /*onChange= {}*/ fullWidth required />
            </Grid>

            <Grid item xs={1}>
              <Button className="btn-confirm" type="submit" /*onClick={}*/ variant="contained" color="primary" value="" style={{ textTransform: 'none'}} fullWidth>
              <Typography style={{ fontWeight: 800 }}>+</Typography></Button>
            </Grid>

            <Grid item xs={7}>
              <Typography className="desc-addlock" align="left">The instructions to connect this lock with a device can be found <Link>here.</Link></Typography>
            </Grid>

          </Grid>
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
