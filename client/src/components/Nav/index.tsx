import React from 'react'
import {useHistory} from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core'

const Nav = () => {
    const history = useHistory();
    return (
        <div className="navbar">
            <AppBar className="nav" position="sticky">
                <Toolbar>
                    <IconButton onClick={() => history.push("/")} edge="start">
                        <img className="logo" src="/assets/images/primary-icon.png" alt="IntelliDnD logo"/>
                    </IconButton>
                    <div className="brand">IntelliDnD</div>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Nav;