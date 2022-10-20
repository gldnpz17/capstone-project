import { Button, List, Divider, Drawer, Box, Typography, IconButton, ThemeProvider } from '@mui/material'
import {useState} from 'react'
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from '../components/UItheme'

export const NavSideBar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState (false)
    return (
        <>
            <ThemeProvider theme={theme}>
            <IconButton size='large' edge='start' color='inherit' aria-label='logo' onClick={() => setIsDrawerOpen(true) }>
                <i class="fas fa-bars"></i>
            </IconButton>
            <Drawer 
                anchor='left' 
                open={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)}
            >
                <Box p={4} width='250px'role='presentation'>
                        <Typography className="header" gutterBottom variant="h5" align="left" style={{ fontWeight: 800 }} color="primary">
                            Navigation Menu
                        </Typography> 
                    <List>
                        <Button /*onClick={}*/ variant="text" value="" style={{ textTransform: 'none'}} startIcon={<GroupIcon />} fullwidth>
                            Account Management
                        </Button>
                    </List>
                    <List>
                        <Button /*onClick={}*/ variant="text" value="" style={{ textTransform: 'none'}} startIcon={<LockIcon />} fullwidth>
                            Lock Management
                        </Button>
                    </List>
                    <Divider/>
                    <List>
                        <Button /*onClick={}*/ variant="text" value="" style={{ textTransform: 'none'}} startIcon={<LogoutIcon />} fullwidth>
                            Log Out
                        </Button>
                    </List>
                </Box>
            </Drawer>
            </ThemeProvider>
        </>
    )
}