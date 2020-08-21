import React from 'react';
import { TextField } from '@material-ui/core';

interface CardProps {
	title: string;
	items?: {
		name: string;
		quantity: number;
	}[];
}

const Card = (props: CardProps) => {
	let { title, items } = props;
	return (
		<div className="card">
			<div className="title">{title}</div>
			{items?.map(({ name, quantity }) => (
				<TextField defaultValue={name} />
			))}
		</div>
	);
};

export default Card;
