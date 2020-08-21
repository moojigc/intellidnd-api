import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import Hero from '../../components/Hero';
import {
	Typography,
	Container,
	TypographyVariant,
	TypographyStyle,
} from '@material-ui/core';
import { Wrapper } from '../../components/MiniComponents';
import Footer from '../../components/Footer';
import { useLocation } from 'react-router-dom';
import { connect, ConnectedComponent } from 'react-redux';
import { Character } from '../../store';

export interface PathProps {
	optOut?: boolean;
	Component: (() => JSX.Element) | ConnectedComponent<any, any>;
	title: string;
	HeroText?: () => JSX.Element;
	TypographyProps?: {
		component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		variant?: TypographyVariant;
		style: TypographyStyle;
	};
	character?: Character;
}

/**
 * Handles events and layout for every page on pathname change
 */
const Page = ({
	character,
	Component,
	title,
	HeroText,
	TypographyProps,
	optOut,
}: PathProps) => {
	const { pathname } = useLocation();

	const handleSetTitle = (title: string) => {
		document.title =
			pathname === '/' ? 'IntelliDnD' : `${title} | IntelliDnD`;
	};
	useEffect(() => {
		handleSetTitle(title);
	}, [pathname]);
	return optOut ? (
		<Component />
	) : (
		<React.Fragment>
			<Hero>
				<Typography
					variant={TypographyProps?.variant || 'h1'}
					component={TypographyProps?.component || 'h1'}
					{...TypographyProps}
				>
					{title}
				</Typography>
				{HeroText && <HeroText />}
			</Hero>
			<Component />
		</React.Fragment>
	);
};

const mapStateToProps = (state) => ({
	character: state.character,
});

export default connect(mapStateToProps)(Page);
