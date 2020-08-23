import React, { ReactNode } from 'react';
import { TextField, makeStyles, useTheme } from '@material-ui/core';

interface CardProps {
	title: string;
	items?: {
		name: string;
		quantity: number;
	}[];
	children?: ReactNode;
	className?: string;
}

const Card = (props: CardProps) => {
	const { title, items, children, className } = props;
	const theme = useTheme();

	return (
		<div className={className ? `card ${className}` : 'card'}>
			<div
				className="title"
				style={{
					// color: theme.palette.getContrastText(
					color: theme.palette.secondary.main,
					width: '100%',
					// ),
				}}
			>
				{title}
			</div>
			<div className="inputs">
				{items?.map(({ name, quantity }, i) => (
					<TextField key={i} label="item" defaultValue={name} />
				))}
				{children}
			</div>
		</div>
	);
};

export default Card;
