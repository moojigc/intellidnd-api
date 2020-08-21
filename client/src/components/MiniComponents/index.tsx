import React from 'react';
import { Box, BoxProps } from '@material-ui/core';

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
