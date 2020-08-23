export const devError = (error) => {
	if (process.env.NODE_ENV === 'development') console.error(error);
	return 'Unhandled error occurred.';
};
