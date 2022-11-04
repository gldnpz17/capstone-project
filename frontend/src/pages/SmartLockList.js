
import Box from '@mui/material/Box';
import "../styles/SmartLockList.css";
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Link, Button, Typography, Grid, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import theme from '../components/UItheme';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_LOCK, DELETE_LOCK, READ_ALL_LOCKS } from '../queries/SmartLocks';
import { useMemo } from 'react';
import { handleForm } from '../common/handleForm'
import { useModal } from '../hooks/useModal';
import SmartLockSetting from './SmartLockSetting';

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

export default function SmartLockList() {
  const {
    data: { smartLocks } = { smartLocks: [] }
  } = useQuery(READ_ALL_LOCKS)

  const [addLock] = useMutation(CREATE_LOCK, {
    refetchQueries: [ { query: READ_ALL_LOCKS } ]
  })

  const [deleteLock] = useMutation(DELETE_LOCK, {
    refetchQueries: [ { query: READ_ALL_LOCKS } ]
  })

  const handleSubmit = handleForm(async ({ name }) => {
    await addLock({ 
      variables: { name } 
    })
  }, ["name"])

  const [SettingModal, openSettingModal] = useModal(SmartLockSetting)

  const columns = [
    { field: 'id', headerName: 'ID', width: 350, headerClassName: 'headrow', headerAlign:'center', align: 'center', },
    { field: 'name', headerName: 'Name', headerClassName: 'headrow', width: 150, editable: true, headerAlign:'center', align: 'center' },
    { field: 'status', headerName: 'Status', headerClassName: 'headrow', width: 150, editable: true, headerAlign:'center', align: 'center' },
    { field: 'connection', headerName: 'Connection', headerClassName: 'headrow', width: 150, editable: true, headerAlign:'center', align: 'center' },
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
            <button onClick={openSettingModal({ lock: cellValues.row.raw })} type="button" className="act-btn edit-btn">
              <i className="fas fa-edit"></i>
            </button>
            <button onClick={() => deleteLock({ variables: { id: cellValues.id } })} type="button" className="act-btn del-btn">
              <i className="fa fa-trash"></i>
            </button>
          </div>
        );
      }
    },
  ];

  const rows = useMemo(() => smartLocks.map(lock => {
    const { id, name, lockStatus, device } = lock

    return {
      id,
      name,
      status: lockStatus,
      connection: device?.connectionStatus ?? 'unconnected',
      raw: lock
    }
  }, [smartLocks]))

  return (
    <div className='cover-smartlocklist'>
      <ThemeProvider theme={theme}>
        <div className="cover-addlock">
          <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="#333333">
            <i className="fas fa-lock"></i>Add New Lock
          </Typography> 

          <form onSubmit={handleSubmit}>
            <Grid container spacing={1} className="grid-addlock">
              <Grid item xs={4}>
                <TextField id="" name="name" placeholder="Name" label="Name" variant="outlined"  
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
          </form>
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
        <SettingModal />
      </ThemeProvider>
    </div>
  );
}
