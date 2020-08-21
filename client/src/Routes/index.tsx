import React from 'react';
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
			title: 'welcome to intellidnd',
			path: '/guide',
			Component: Guide,
			HeroText: () => (
				<React.Fragment>
					<p>manage your D&D character with ease</p>
					<p>integrated with a Discord bot</p>
				</React.Fragment>
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
			<Nav />
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
						},
						i
					) => (
						<Route exact path={path} key={i}>
							<Page
								optOut={optOut}
								title={title}
								Component={Component}
								HeroText={HeroText}
								TypographyProps={TypographyProps}
							/>
						</Route>
					)
				)}
			</Switch>
		</Router>
	);
};

export default AppRouter;
