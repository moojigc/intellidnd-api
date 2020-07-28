import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { connect } from 'react-redux';
import './App.scss';
import Guide from './pages/Guide/Guide';

function App() {
    return (
        <Router>
			<CssBaseline/>
            <Switch>
                <Route exact path="/">
                    <Guide />
                </Route>
            </Switch>
        </Router>
    );
}

// const mapStateToProps = (state: any) => ({
// 	user: {
// 		id: state.id,
// 		username: state.username,
// 		auth: state.auth
// 	}
// })

export default App;
