export default class ServerError extends Error {

	constructor(
		public code = 'internal-01',
		public status = 500,
		public message = 'Unhandled exception',
		private _original?: any
	) {
		super();

		if (this._original) {

			console.error(this._original);
		}
	}
}
