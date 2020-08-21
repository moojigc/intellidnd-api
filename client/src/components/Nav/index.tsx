import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Button,
} from '@material-ui/core';

const Nav = ({ user }) => {
	const history = useHistory();
	return (
		<div className="navbar">
			<AppBar className="nav" position="sticky">
				<Toolbar className="toolbar">
					<div className="left">
						<IconButton
							onClick={() => history.push('/')}
							edge="start"
						>
							<img
								className="logo"
								src="/assets/images/primary-icon.png"
								alt="IntelliDnD logo"
							/>
						</IconButton>
						<div className="brand">IntelliDnD</div>
					</div>
					<div className="right">
						<div>
							<Link to="/">
								<Button color="primary" variant="contained">
									Home
								</Button>
							</Link>
						</div>
						<div>
							{user?.auth ? (
								<Link to="/logout">
									<Button color="primary" variant="contained">
										Logout
									</Button>
								</Link>
							) : (
								<Link to="/login">
									<Button color="primary" variant="contained">
										Login
									</Button>
								</Link>
							)}
						</div>
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
});

export default connect(mapStateToProps)(Nav);
