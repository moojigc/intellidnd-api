import React, { useState, useLayoutEffect, HTMLProps } from 'react';
import Footer from '../../components/Footer';
import { Container, Fade } from '@material-ui/core';
import { Wrapper } from '../../components/MiniComponents';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

const Window = (props: HTMLProps<any> & any) => {
	const { children, state, custom } = props;
	const { pathname } = useLocation();
	const [position, setPosition] = useState('fixed');
	const count = React.useRef(0);
	useLayoutEffect(() => {
		console.log(state.character, `count ${++count.current}`);
		setPosition(
			document.body.scrollHeight > window.innerHeight ? 'static' : 'fixed'
		);
	}, [state, pathname, custom]);
	return (
		<React.Fragment>
			<Container>
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
