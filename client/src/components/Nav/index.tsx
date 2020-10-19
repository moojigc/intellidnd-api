import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	AppBar,
	Toolbar,
	IconButton,
	Typography as T,
	Button,
	Menu,
	MenuItem,
	makeStyles,
} from '@material-ui/core';
import { logout } from '../../store';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { AccountCircle, MenuBook, MenuOpenSharp } from '@material-ui/icons';

const ButtonLink = ({
	children,
	to,
	variant,
	onClick,
}: {
	children: React.ReactChildren | string;
	to: string;
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

const useStyles = makeStyles((theme) => ({
	root: {
		background: theme.palette.secondary.light,
		color: theme.palette.secondary.contrastText,
	},
	account: {
		color: theme.palette.primary.light,
	},
}));

const Nav = ({
	user,
	logout,
	pages,
}: {
	user;
	logout: () => Promise<any>;
	pages: { path; title: string }[];
}) => {
	const classes = useStyles();
	const history = useHistory();
	const handleLogout = (e) => {
		e.preventDefault();
		logout().then((res) => {
			history.push('/guide', { ...res.flash });
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
												className={classes.account}
												style={{ fontSize: '1rem' }}
												color="primary"
												{...bindTrigger(popupState)}
											>
												<MenuBook />
											</Button>
											<Menu
												MenuListProps={{
													className: classes.root,
													style: {
														display: 'flex',
														flexDirection: 'column',
														alignItems: 'center',
													},
												}}
												{...bindMenu(popupState)}
												getContentAnchorEl={null}
												transformOrigin={{
													horizontal: 'left',
													vertical: -43,
												}}
											>
												<MenuItem
													onClick={handleLogout}
												>
													<T>SIGN OUT</T>
												</MenuItem>
												{pages.map(
													({ path, title }) => (
														<MenuItem
															key={path}
															onClick={() => {
																history.push(
																	path
																);
															}}
														>
															<T>
																{title.toUpperCase()}
															</T>
														</MenuItem>
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
