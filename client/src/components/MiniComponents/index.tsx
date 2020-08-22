import React, { useState, useEffect } from 'react';
import { Box, BoxProps, Button } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

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
	const [display, setDisplay] = useState(true);
	const history = useHistory();
	const [histState, setHistState] = useState({
		message: null,
		type: null,
	});
	useEffect(() => {
		history.listen(() => {
			if (history.action === 'PUSH') {
				console.log(
					'message is ' + (history.location.state as any)?.message
				);
				setHistState(history.location.state as any);
			}
		});
	}, [history.location.state]);
	return (
		<div
			className={`alert ${histState?.type || ''}`}
			style={{ display: histState?.message && display ? 'flex' : 'none' }}
		>
			<Check fontSize="inherit" />
			<span
				className={histState?.type || ''}
				style={{ marginLeft: '0.5rem' }}
			>
				{histState?.message}
			</span>
			<Button className="x" onClick={() => setDisplay(false)}>
				<Close fontSize="inherit" />
			</Button>
		</div>
	);
};
