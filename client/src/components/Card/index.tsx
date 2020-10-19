import React, { ReactNode, CSSProperties } from 'react';
import { TextField, makeStyles, useTheme, Grid } from '@material-ui/core';

interface CardProps {
	title?: string;
	items?: {
		name: string;
		quantity: number;
	}[];
	children?: ReactNode;
	className?: string;
	flexDirection?: React.CSSProperties['flexDirection'];
	noTitle?: boolean;
	icon?: string;
}

const Card = (props: CardProps) => {
	const {
		title,
		items,
		children,
		className,
		flexDirection,
		noTitle,
		icon,
	} = props;
	const theme = useTheme();

	return (
		<div className={className ? `card ${className}` : 'card'}>
			<div
				className="title"
				style={{
					// color: theme.palette.getContrastText(
					color: theme.palette.secondary.main,
					width: '100%',
					display: noTitle ? 'none' : 'flex',
					// ),
				}}
			>
				{title}
				<img src={icon} />
			</div>
			<div
				className="inputs"
				style={{
					display: !!flexDirection ? 'flex' : 'block',
					flexDirection: flexDirection,
				}}
			>
				<Grid
					container
					direction="row"
					alignItems="flex-end"
					style={{ fontWeight: 900 }}
				>
					<Grid item xs={8}>
						<div>name</div>
					</Grid>
					<Grid item xs={2}>
						<div>quantity</div>
					</Grid>
					<Grid item xs={2}>
						<div>value</div>
					</Grid>
				</Grid>
				{items?.map(({ name, quantity }, i) => (
					<Grid container direction="row" key={i}>
						<Grid item xs={8}>
							<TextField
								margin="normal"
								InputLabelProps={{ 'aria-label': 'item name' }}
								defaultValue={name}
								fullWidth
							/>
						</Grid>
						<Grid item xs={2}>
							<TextField
								margin="normal"
								InputLabelProps={{ 'aria-label': 'item name' }}
								defaultValue={quantity}
								fullWidth
							/>
						</Grid>
						<Grid item xs={2}>
							<TextField
								margin="normal"
								InputLabelProps={{ 'aria-label': 'item name' }}
							/>
						</Grid>
					</Grid>
				))}
				{children}
			</div>
		</div>
	);
};

export default Card;
