import { Card, CardContent, Fade, Grid, Paper, Popper } from "@mui/material"
import { useCallback, useEffect, useState } from "react"

const Popup = ({ anchorEl, close, Content, args, popperProps }) => {
    useEffect(() => {
        return () => close()
    }, [])

    return (
        <Popper open={Boolean(anchorEl)} 
            transition 
            sx={{ zIndex: 2000 }}  
            {...{ ...popperProps, anchorEl }}
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                    <Paper sx={{ maxWidth: 400 }}>
                        <Card style={{ maxWidth: 400, padding: "2px 5px", margin: "0 auto" }}>
                            <CardContent>
                                <Content {...args} close={close} />
                            </CardContent>
                        </Card>
                    </Paper>
                </Fade>
            )}
        </Popper>
    )
}

const usePopup = (Content, popperProps={}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [args, setArgs] = useState({})

  const open = (args={}) => (e) => {
    e.stopPropagation()
    setArgs(args)
    setAnchorEl(e.target)
  }

  const close = () => {
    setArgs({})
    setAnchorEl(null)
  }

  const renderPopup = () => (
    <Popup {...{ anchorEl, close, Content, args, popperProps }} />
  )
  
  return [open, renderPopup]
}

export { usePopup }