import React, { useEffect, useState } from 'react';
import Login from '../pages/Login';
import Guide from '../pages/Guide';
import Dashboard from '../pages/Dashboard';
import Nav from '../components/Nav';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
} from 'react-router-dom';
import Page, { PathProps } from '../pages/Page';
import Window from '../pages/Window';
import AddCharacter from '../pages/AddCharacter';

interface RouteProps extends PathProps {
	path: string | string[];
	redirect?: string;
}

const ROUTES: { public: RouteProps[]; private: RouteProps[] } = {
	public: [
		{
			title: 'Login',
			path: '/login',
			Component: Login,
		},
		{
			title: 'Welcome to IntelliDnD',
			path: '/guide',
			Component: Guide,
			HeroText: () => (
				<div style={{ fontSize: window.innerWidth * 0.002 + 'rem' }}>
					<p style={{ fontSize: 'inherit' }}>
						manage your D&D character with ease
					</p>
					<p style={{ fontSize: 'inherit' }}>
						integrated with a Discord bot
					</p>
				</div>
			),
			TypographyProps: {
				style: {
					fontSize: `${window.innerWidth * 0.003}rem`,
					textTransform: 'unset',
				},
			},
		},
	],
	private: [
		{
			title: 'Add Character',
			path: '/add-character',
			Component: AddCharacter,
		},
		{
			optOut: true,
			title: 'Dashboard',
			path: ['/', '/dashboard'],
			Component: Dashboard,
			redirect: '/guide',
		},
	],
};

/**
 * Handles routing based on private and public routes
 */
const AppRouter = ({ user }: { user: { auth: boolean } }) => {
	return (
		<Router>
			<Nav
				pages={ROUTES.private
					.filter(({ title }) => title !== 'Dashboard')
					.map((r) => ({
						path: r.path,
						title: r.title,
					}))}
			/>
			<Switch>
				{ROUTES.private.map(
					(
						{
							Component,
							path,
							title,
							redirect,
							HeroText,
							TypographyProps,
							optOut,
						},
						i
					) => {
						return (
							<Route exact path={path} key={i}>
								{user?.auth ? (
									<Page
										optOut={optOut}
										title={title}
										Component={Component}
										HeroText={HeroText}
										TypographyProps={TypographyProps}
									/>
								) : (
									<Redirect to={redirect ?? '/login'} />
								)}
							</Route>
						);
					}
				)}
				{ROUTES.public.map(
					(
						{
							Component,
							path,
							title,
							HeroText,
							TypographyProps,
							optOut,
							redirect,
						},
						i
					) => (
						<Route exact path={path} key={i}>
							{redirect ? (
								<Redirect to={redirect} />
							) : (
								<Page
									optOut={optOut}
									title={title}
									Component={Component}
									HeroText={HeroText}
									TypographyProps={TypographyProps}
								/>
							)}
						</Route>
					)
				)}
			</Switch>
		</Router>
	);
};

export default AppRouter;
