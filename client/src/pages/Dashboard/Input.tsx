import React from 'react';
import { TextField } from '@material-ui/core';

const Input = ({ fields }) => (
	<React.Fragment>
		{Object.entries(fields).map(([key, value]) => {
			console.log(key, value);
			return (
				<TextField
					defaultValue={value}
					label={key}
					variant="filled"
					key={key}
				/>
			);
		})}
	</React.Fragment>
);

export default Input;
