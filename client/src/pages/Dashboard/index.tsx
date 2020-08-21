import React, { useEffect, useState, useLayoutEffect } from 'react';
import Card from '../../components/Card';
import { connect } from 'react-redux';
import { Character, getCharacters } from '../../store';
import { CircularProgress } from '@material-ui/core';
import Window from '../Window';

const Dashboard = ({
	character,
	getCharacters,
}: {
	character: Character;
	getCharacters: () => Promise<{ default: Character; all: Character[] }>;
}) => {
	const [isMounted, setMounted] = useState(false);
	useEffect(() => {
		getCharacters().then((_) => setMounted(true));
	}, []);

	return (
		<Window custom={isMounted}>
			{isMounted ? (
				<React.Fragment>
					<pre>{JSON.stringify(character, null, 2)}</pre>
					{['Weapons', 'Potions', 'Money', 'Misc'].map((c) => (
						<Card title={c} key={c} />
					))}
				</React.Fragment>
			) : (
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<CircularProgress size="5rem" />
				</div>
			)}
		</Window>
	);
};

const mapStateToProps = (state) => ({
	character: state.character,
});
const mapDispatchToProps = (dispatch) => ({
	getCharacters: () => dispatch(getCharacters()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
