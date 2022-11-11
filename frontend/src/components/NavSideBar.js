import { Button, List, Divider, Drawer, Box, Typography, IconButton, ThemeProvider, Stack } from '@mui/material'
import {useState} from 'react'
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from '../components/UItheme'
import { Outlet } from 'react-router-dom';
import { useModal } from '../hooks/useModal';
import AddUser from './AddUser';
import EditUser from './EditUser'
import SmartLockSetting from '../pages/SmartLockSetting';

export const NavSideBar = () => {
    const [AddUserModal, openAddUserModal] = useModal(AddUser)
    const [EditUserModal, openEditUserModal] = useModal(EditUser)
    const [SettingModal, openSettingModal] = useModal(SmartLockSetting)

    return (
        <>
            <ThemeProvider theme={theme}>
                <Stack direction="row" sx={{ width: "100%", height: "100%" }}>
                    <Drawer 
                        anchor='left' 
                        open={true}
                        variant="persistent"
                    >
                        <Box role='presentation' sx={{ width: "20rem", p: 0 }}>
                            <Box sx={{ p: 4 }}>
                                <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="primary">
                                    Navigation Menu
                                </Typography> 
                                <Stack gap={2}>
                                    <Button variant="text" href="/admin/accounts" sx={{ justifyContent: "left" }} style={{ textTransform: 'none'}} startIcon={<GroupIcon />} fullWidth>
                                        Account Management
                                    </Button>
                                    <Button variant="text" href="/admin/smart-locks" sx={{ justifyContent: "left" }} style={{ textTransform: 'none'}} startIcon={<LockIcon />} fullWidth>
                                        Lock Management
                                    </Button>
                                    <Divider/>
                                    <Button variant="text" sx={{ justifyContent: "left" }} style={{ textTransform: 'none'}} startIcon={<LogoutIcon />} fullWidth>
                                        Log Out
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>
                    </Drawer>
                    <Box sx={{ ml: "20rem", position: "relative", width: "100%", height: "100%", py: 4, px: 8 }}>
                        <Outlet context={{ openAddUserModal, openEditUserModal, openSettingModal }} />
                    </Box>
                    <AddUserModal />
                    <EditUserModal />
                    <SettingModal />
                </Stack>
            </ThemeProvider>
        </>
    )
}