import React, { useState, useEffect } from 'react';
import { Box, BoxProps, Button, Slide } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { History } from 'history';

export const Wrapper = (props: BoxProps) => {
	return (
		<Box
			{...props}
			className={
				props.className ? `wrapper ${props.className}` : 'wrapper'
			}
		>
			{props.children}
		</Box>
	);
};

/**
 * Listens to history state and displays any message passed to history state
 */
export const AlertMessage = () => {
	const [display, setDisplay] = useState(false);
	const history = useHistory() as History<{
		message: string;
		type: 'success' | 'error';
	}>;
	useEffect(() => {
		history.listen((location) => {
			console.log(
				`this should be displaying: ${location.state !== null}`
			);
			setDisplay(
				location.state?.message !== '' ||
					location.state?.message! == null
					? true
					: false
			);
		});
		return () => {};
	}, [history.location.state]);
	return (
		<Slide direction="right" in={display} mountOnEnter timeout={400}>
			<div className={`alert ${history.location.state?.type || ''}`}>
				<Check fontSize="inherit" />
				<span
					className={history.location.state?.type || ''}
					style={{ marginLeft: '0.5rem' }}
				>
					{history.location.state?.message}
				</span>
				<Button className="x" onClick={() => setDisplay(false)}>
					<Close fontSize="inherit" />
				</Button>
			</div>
		</Slide>
	);
};
