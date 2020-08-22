import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Button,
	Menu,
	MenuItem,
} from '@material-ui/core';
import { logout } from '../../store';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { AccountCircle } from '@material-ui/icons';

const ButtonLink = ({
	children,
	to,
	variant,
	onClick,
}: {
	children;
	to;
	variant?: 'text' | 'outlined';
	onClick?: (...args: any) => void;
}) => (
	<Link to={to}>
		<Button
			onClick={(e) => onClick && onClick(e)}
			color="primary"
			variant={variant ?? 'contained'}
		>
			{children}
		</Button>
	</Link>
);

const Nav = ({
	user,
	logout,
	pages,
}: {
	user;
	logout: () => Promise<any>;
	pages: { path; title }[];
}) => {
	const history = useHistory();
	const handleLogout = (e) => {
		e.preventDefault();
		logout().then((res) => {
			console.log(res);
			history.push('/guide', { ...res?.flash });
		});
	};
	return (
		<div className="navbar">
			<AppBar className="nav" position="sticky">
				<Toolbar className="toolbar">
					<div className="left">
						<Link to="/">
							<IconButton edge="start">
								<img
									className="logo"
									src="/assets/images/primary-icon.png"
									alt="IntelliDnD logo"
								/>
							</IconButton>
						</Link>
						<div className="brand">IntelliDnD</div>
					</div>
					<div className="right">
						{user?.auth ? (
							<React.Fragment>
								<ButtonLink to="/">Home</ButtonLink>
								<PopupState
									variant="popover"
									popupId="user-action-menu"
								>
									{(popupState) => (
										<React.Fragment>
											<Button
												style={{ fontSize: '1rem' }}
												color="primary"
												variant="outlined"
												{...bindTrigger(popupState)}
											>
												<AccountCircle />
											</Button>
											<Menu
												MenuListProps={{
													style: {
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
													},
												}}
												{...bindMenu(popupState)}
												anchorOrigin={{
													horizontal: 'center',
													vertical: 'bottom',
												}}
												transformOrigin={{
													horizontal: 'center',
													vertical: 'top',
												}}
											>
												<MenuItem
													component={() => (
														<ButtonLink
															to="/logout"
															onClick={
																handleLogout
															}
															variant="text"
														>
															Sign Out
														</ButtonLink>
													)}
												/>
												{pages.map(
													({ path, title }) => (
														<MenuItem
															component={() => (
																<ButtonLink
																	to={path}
																	variant="text"
																>
																	{title}
																</ButtonLink>
															)}
														/>
													)
												)}
											</Menu>
										</React.Fragment>
									)}
								</PopupState>
							</React.Fragment>
						) : (
							<ButtonLink to="/login">Sign In</ButtonLink>
						)}
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
});

const mapDispatch = (dispatch) => ({
	logout: () => dispatch(logout()),
});

export default connect(mapStateToProps, mapDispatch)(Nav);
