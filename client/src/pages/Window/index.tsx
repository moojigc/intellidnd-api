import React, { useState, useLayoutEffect, HTMLProps, useEffect } from 'react';
import Footer from '../../components/Footer';
import { Container, Fade, ContainerProps } from '@material-ui/core';
import { Wrapper, AlertMessage } from '../../components/MiniComponents';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useCheckMobile } from '../../utils';

/**
 * @param props
 * @param props.custom - pass any state here that may cause `<Footer/>` to require resize
 */
const Window = (
	props: HTMLProps<any> & {
		custom?: any;
		state?: never;
		ContainerProps?: any;
	}
) => {
	const isMobile = useCheckMobile();
	const { children, state, custom, ContainerProps } = props;
	const { pathname } = useLocation();
	const [position, setPosition] = useState('fixed');
	useLayoutEffect(() => {
		setPosition(
			document.body.scrollHeight > window.innerHeight ? 'static' : 'fixed'
		);
	}, [pathname, custom]);
	return (
		<React.Fragment>
			<AlertMessage />
			<Container disableGutters={isMobile} {...ContainerProps}>
				<Fade in={true} timeout={400}>
					<Wrapper className={props.className}>{children}</Wrapper>
				</Fade>
			</Container>
			<Footer position={position} />
		</React.Fragment>
	);
};

const mapStateToProps = (state) => ({
	state: state,
});

export default connect(mapStateToProps)(Window);
