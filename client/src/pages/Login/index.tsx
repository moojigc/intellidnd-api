import React, { useEffect } from 'react';
import {
	Container,
	Typography,
	Grid,
	TextField,
	Button,
	makeStyles,
} from '@material-ui/core';
import { Formik, Field, Form, FormikProps } from 'formik';
import Hero from '../../components/Hero';
import { Wrapper } from '../../components/MiniComponents';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../store';

const useStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.secondary.contrastText,
	},
}));

const Login = ({ login }) => {
	const { token } = useParams();
	const classes = useStyles();
	const handleFormSubmit = async (values) => {
		let res = await login(values);
		console.log(res);
	};
	return (
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
	);
};

const mapDispatchToProps = (dispatch) => ({
	login: (values) => dispatch(login(values)),
});

export default connect(null, mapDispatchToProps)(Login);
