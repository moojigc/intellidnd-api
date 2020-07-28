import React from 'react';
import { Box, BoxProps } from '@material-ui/core';

export const Wrapper = (props: BoxProps) => {
    return (
        <Box className="wrapper" {...props}>
            {props.children}
        </Box>
    );
};
