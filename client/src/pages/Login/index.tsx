import React from 'react';
import { TextField, Button, makeStyles, Typography } from '@material-ui/core';
import { Formik, Field, Form, FormikProps } from 'formik';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../store';
import Window from '../Window';

const params = (param: string) =>
	new URLSearchParams(window.location.search).get(param);

const useStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.secondary.contrastText,
	},
}));

const Login = ({
	login,
}: {
	login: (values) => Promise<{ redirect; flash; user }>;
}) => {
	const characterToken = params('token'),
		discordName = params('name'),
		discordGuild = params('guild');
	const history = useHistory();
	const classes = useStyles();
	const handleFormSubmit = async (values) => {
		let res = await login({ ...values, characterToken });
		console.log({ ...res.flash });
		history.push(res.redirect, { ...res.flash });
	};
	return (
		<Window>
			{discordName && (
				<Typography variant="h3" component="h2">
					Hello, {discordName}!
				</Typography>
			)}
			<Formik
				initialValues={{ user: '', password: '' }}
				onSubmit={handleFormSubmit}
			>
				<Form>
					<Field id="user" htmlFor="user" name="user">
						{({ field }) => (
							<TextField
								{...field}
								variant="filled"
								label="Username/Email"
								color="primary"
								fullWidth
								InputLabelProps={{ className: classes.root }}
								inputProps={{ className: classes.root }}
							/>
						)}
					</Field>
					<Field id="password" type="password" name="password">
						{({ field }) => (
							<TextField
								{...field}
								variant="filled"
								label="Password"
								color="primary"
								fullWidth
								InputLabelProps={{ className: classes.root }}
								inputProps={{ className: classes.root }}
							/>
						)}
					</Field>
					<Button type="submit" variant="contained" color="primary">
						Login
					</Button>
				</Form>
			</Formik>
		</Window>
	);
};

const mapDispatchToProps = (dispatch) => ({
	login: (values) => dispatch(login(values)),
});

export default connect(null, mapDispatchToProps)(Login);
