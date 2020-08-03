import React from 'react'
import {useHistory, Link} from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core'

const Nav = () => {
    const history = useHistory();
    return (
        <div className="navbar">
            <AppBar className="nav" position="sticky">
                <Toolbar className="toolbar">
                    <div className="nav-left">
                        <IconButton onClick={() => history.push("/")} edge="start">
                            <img className="logo" src="/assets/images/primary-icon.png" alt="IntelliDnD logo"/>
                        </IconButton>
                        <div className="brand">IntelliDnD</div>
                    </div>
                    <div>
                        <Link to="/inventory">
                            <Button color="primary" variant="contained">Inventory</Button>
                        </Link>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Nav;