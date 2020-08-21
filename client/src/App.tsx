import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { connect, Provider } from 'react-redux';

import './App.scss';
import { theme } from './utils/theme';
import AppRouter from './Routes';
import { getStatus, getAllCharacters } from './store';

function App({ user, getStatus, getAllCharacters }) {
	const preferredTheme = theme('light');
	const [isMounted, setMounted] = useState(false);
	// const [user, setUser] = useState({})

	useEffect(() => {
		getStatus().then((_res) => setMounted(true));
	}, []);

	return (
		<ThemeProvider theme={preferredTheme}>
			<CssBaseline />
			{isMounted && <AppRouter user={user} />}
		</ThemeProvider>
	);
}

const mapStateToProps = (state) => ({
	user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
	getStatus: () => dispatch(getStatus()),
	getAllCharacters: () => dispatch(getAllCharacters()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
