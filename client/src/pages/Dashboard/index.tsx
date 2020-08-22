import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { connect } from 'react-redux';
import {
	Character,
	getCharacters,
	User,
	CharacterDetails,
	setDefaultCharacter,
} from '../../store';
import {
	CircularProgress,
	Grid,
	Typography,
	Button,
	ButtonBase,
	MenuItem,
	Menu,
} from '@material-ui/core';
import Window from '../Window';
import { capitalize } from '../../utils';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Hero from '../../components/Hero';

const Dashboard = ({
	user,
	character,
	getCharacters,
}: {
	user: User;
	character: Character;
	getCharacters: () => Promise<{
		characters: Character;
	}>;
}) => {
	const handleChangeChar = (char) => {
		setDefaultCharacter(char);
	};
	const [isMounted, setMounted] = useState(false);
	useEffect(() => {
		getCharacters()
			.then((_res) => {
				setMounted(true);
			})
			.catch(() => {});
	}, []);
	return (
		<React.Fragment>
			<Hero>
				<Typography variant="h2" component="h1">
					{user.username}'s dashboard
				</Typography>
			</Hero>
			<Window custom={isMounted}>
				<Typography variant="h3" component="h2">
					<Grid container justify="space-between">
						{character.default?.name}
						{character.all && character.all.length > 1 && (
							<PopupState
								variant="popover"
								popupId="all-characters-menu"
							>
								{(popupState) => (
									<React.Fragment>
										<Button
											color="primary"
											variant="outlined"
											size="small"
											{...bindTrigger(popupState)}
										>
											all characters
										</Button>
										<Menu
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
											{character.all?.map((c) => (
												<MenuItem
													key={c._id}
													onClick={() =>
														handleChangeChar(c)
													}
												>
													{c.name}
												</MenuItem>
											))}
										</Menu>
									</React.Fragment>
								)}
							</PopupState>
						)}
					</Grid>
				</Typography>
				{isMounted ? (
					<Grid container>
						{character.default?.inventory.map((cat, i) => {
							return (
								<Card
									title={capitalize(Object.keys(cat)[0])}
									items={Object.values(cat)[0]}
									key={i}
								>
									hi
								</Card>
							);
						})}
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
