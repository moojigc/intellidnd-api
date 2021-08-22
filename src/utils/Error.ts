export default function serverError(
	code = 'internal-01',
	status = 500,
	message?: string,
	_original?: any
) {

	if (!message) {

		message = (() => {

			switch (status) {
				case 400: return 'bad request';
				case 401: return 'authentication error';
				case 403: return 'unauthorized';
				case 404: return 'not found';
				default: return 'unhandled exception';
			}
		})();
	}

	if (_original) {

		console.error(_original);
	}

	const error = new Error(message);
	error.name = 'Server Error';

	return {
		code,
		status,
		message,
		stack: error.stack
	};
}
