import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { connect } from 'react-redux';
import {
	Character,
	getCharacters,
	User,
	CharacterDetails,
	setDefaultCharacter,
	updateUserDefaultCharacter,
} from '../../store';
import {
	CircularProgress,
	Grid,
	Typography,
	Button,
	MenuItem,
	Menu,
	TextField,
} from '@material-ui/core';
import Window from '../Window';
import { capitalize, useCheckMobile } from '../../utils';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Hero from '../../components/Hero';
import Dialog from '../../components/Dialog';
import { AlertMessage } from '../../components/MiniComponents';
import { keys } from 'lodash';

const Dashboard = ({
	user,
	character,
	getCharacters,
	setDefaultCharacter,
	updateUserDefaultCharacter,
}: {
	user: User;
	character: Character;
	getCharacters: () => Promise<Character>;
	setDefaultCharacter: (
		c: CharacterDetails,
		put?: boolean
	) => CharacterDetails | Promise<CharacterDetails>;
	updateUserDefaultCharacter: (id: string) => void;
}) => {
	const isMobile = useCheckMobile();
	const [isMounted, setMounted] = useState(false),
		[dialogOpen, setDialogOpen] = useState(false);

	/** Set the default character to `c`. passing `true` to `put` will send a PUT request to the server
	 * and permanently update new default character
	 */
	const handleUpdateCharacter = (c: CharacterDetails, put?: boolean) => {
		setDefaultCharacter(c, put);
		put && updateUserDefaultCharacter(c._id);
	};
	/** used by the modal to confirm if user really wants to set new default character */
	const handleConfirmNewDefault = (confirm: boolean) => {
		if (confirm) {
			handleUpdateCharacter(character.default as CharacterDetails, true);
		}
		setDialogOpen(false);
	};
	useEffect(() => {
		getCharacters().then((res) => {
			setMounted(true);
		});
	}, []);
	return (
		<React.Fragment>
			<Dialog
				title={`Make ${character.default?.name} your default character?`}
				open={dialogOpen}
				setOpen={setDialogOpen}
				buttons={[
					{
						onClick: () => handleConfirmNewDefault(false),
						text: 'Cancel',
						color: 'default',
					},
					{
						onClick: () => handleConfirmNewDefault(true),
						text: 'Confirm',
						variant: 'contained',
						color: 'secondary',
					},
				].map(({ onClick, text, variant, color }, i) => (
					<Button
						variant={(variant as any) || 'text'}
						onClick={onClick}
						key={i}
						color={color as any}
					>
						{text}
					</Button>
				))}
			/>
			<Hero>
				<Typography variant="h2" component="h1">
					{user.username}'s dashboard
				</Typography>
			</Hero>
			<Window
				custom={isMounted}
				className="dashboard"
				ContainerProps={{ maxWidth: 'xl' }}
			>
				<Grid
					container
					justify={isMobile ? 'center' : 'space-between'}
					alignItems="center"
				>
					<Typography
						variant={isMobile ? 'h4' : 'h3'}
						component="h2"
						style={{ marginBottom: '0.5rem' }}
					>
						{character.default?.name}
					</Typography>
					{character.all && character.all.length > 1 && (
						<div
							style={{
								color: 'var(--purple-light)',
								display: 'grid',
								gap: '0.25rem',
								gridTemplateColumns:
									character.default?._id !==
									user.defaultPlayer
										? '1fr 1fr'
										: '1fr',
							}}
						>
							{character.default?._id !== user.defaultPlayer && (
								<Button
									size="large"
									color="primary"
									variant="contained"
									onClick={() => setDialogOpen(true)}
								>
									set default
								</Button>
							)}
							<PopupState
								variant="popover"
								popupId="all-characters-menu"
							>
								{(popupState) => (
									<div>
										<Button
											color="inherit"
											variant="outlined"
											size="large"
											{...bindTrigger(popupState)}
										>
											all characters
										</Button>
										<Menu
											{...bindMenu(popupState)}
											getContentAnchorEl={null}
											transformOrigin={{
												horizontal: 'left',
												vertical: -50,
											}}
										>
											{character.all?.map((c) => (
												<MenuItem
													key={c._id}
													onClick={() =>
														handleUpdateCharacter(c)
													}
												>
													{c.name}
												</MenuItem>
											))}
										</Menu>
									</div>
								)}
							</PopupState>
						</div>
					)}
				</Grid>
				{isMounted ? (
					<Grid container>
						<Grid item lg={2}>
							<Card
								noTitle
								className="stats"
								flexDirection="column"
							>
								{character.default?.stats.map((stat) => {
									let [key] = Object.keys(stat);
									let [value] = Object.values(stat);
									return (
										<TextField
											fullWidth
											defaultValue={value}
											label={key}
											variant="filled"
											key={key}
										/>
									);
								})}
							</Card>
						</Grid>
						<Grid item lg={10}>
							<Grid container className="grid">
								{character.default?.inventory.map((cat, i) => {
									let key = Object.keys(cat)[0];
									let values = Object.values(cat)[0];
									return key === 'money' ? (
										<Card title="Money" key={key}>
											<Grid container direction="column">
												{cat['money'].map((m, i) => (
													<TextField
														fullWidth
														variant="filled"
														color="primary"
														label={
															Object.keys(m)[0]
														}
														defaultValue={
															Object.values(m)[0]
														}
														key={i}
													/>
												))}
											</Grid>
										</Card>
									) : (
										<Card
											title={capitalize(
												Object.keys(cat)[0]
											)}
											items={
												(values.length && values) || [
													{
														name: 'None',
														quantity: 0,
													},
												]
											}
											key={i}
										/>
									);
								})}
							</Grid>
						</Grid>
					</Grid>
				) : (
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<CircularProgress size="5rem" />
					</div>
				)}
			</Window>
		</React.Fragment>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
	character: state.character,
});
const mapDispatchToProps = (dispatch) => ({
	getCharacters: () => dispatch(getCharacters()),
	setDefaultCharacter: (c, put) => dispatch(setDefaultCharacter(c, put)),
	updateUserDefaultCharacter: (id) =>
		dispatch(updateUserDefaultCharacter(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
