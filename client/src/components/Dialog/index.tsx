import React from 'react';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		background: theme.palette.primary.light,
	},
}));

const Dialog = ({
	title,
	children,
	buttons,
	open,
	setOpen,
	DialogProps,
}: {
	title?: string | JSX.Element;
	children?: any;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	buttons: Array<JSX.Element>;
	DialogProps?: DialogProps;
}) => {
	const classes = useStyles();
	return (
		<MuiDialog
			{...DialogProps}
			PaperProps={{
				className: classes.root,
			}}
			open={open}
			onClose={() => setOpen(false)}
		>
			{title && (
				<DialogTitle id="alert-dialog-title">{title}</DialogTitle>
			)}
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{children}
				</DialogContentText>
			</DialogContent>
			<DialogActions>{buttons.map((b) => b)}</DialogActions>
		</MuiDialog>
	);
};

export default Dialog;
