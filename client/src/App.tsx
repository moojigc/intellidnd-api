import React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import Nav from './components/Nav'
import Guide from './pages/Guide';

import './App.scss';
import { theme } from './utils/theme';

function App() {
    const preferredTheme = theme('light')
    return (
        <Router>
            <ThemeProvider theme={preferredTheme}>
                <CssBaseline/>
                <Nav/>
                <Switch>
                    <Route exact path="/">
                        <Guide />
                    </Route>
                </Switch>
            </ThemeProvider>
        </Router>
    );
}

export default App;
