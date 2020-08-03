import React from 'react';
import { Container, Typography, Grid, TextField, Button, makeStyles } from '@material-ui/core';
import { Formik, Field, Form, FormikProps } from 'formik'
import Hero from '../../components/Hero';
import { Wrapper } from '../../components/MiniComponents';

const useStyles = makeStyles(theme => ({
    root: {
        color: theme.palette.secondary.contrastText
    }
}))

const Login = () => {
    const classes = useStyles()
    const handleFormSubmit = (values) => {
        console.log(values)
    }
    return (
        <Container maxWidth="md">
            <Hero>
                <Typography variant="h1" component="h1">Login</Typography>
            </Hero>
            <Wrapper>
                <Formik initialValues={{user: "", password: ""}} onSubmit={(values) => handleFormSubmit(values)}>
                    <Form>
                        <Field id="user" htmlFor="user" name="user">
                            {({field}) => (
                                <TextField {...field} variant="filled" label="Username/Email" color="primary" fullWidth InputLabelProps={{className: classes.root}} inputProps={{className: classes.root}}/>
                            )}                                
                        </Field>
                        <Field id="password" type="password" name="password">
                            {({field}) => (
                                <TextField {...field} variant="filled" label="Password" color="primary" fullWidth InputLabelProps={{className: classes.root}} inputProps={{className: classes.root}} />
                            )}
                        </Field>
                        <Button type="submit" variant="contained" color="primary">Login</Button>
                    </Form>
                </Formik>
            </Wrapper>
        </Container>
    )
}

export default Login;