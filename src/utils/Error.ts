export default class ServerError extends Error {

	public message: string;

	constructor(
		public code = 'internal-01',
		public status = 500,
		private _message?: string,
		private _original?: any
	) {
		super();

		if (!this._message) {

			this.message = (() => {

				switch (this.status) {
					case 400: return 'bad request';
					case 401: return 'authentication error';
					case 403: return 'unauthorized';
					case 404: return 'not found';
					default: return 'unhandled exception';
				}
			})();
		}
		else {

			this.message = this._message;
		}

		if (this._original) {

			console.error(this._original);
		}
	}
}
