import axios from 'axios';

export default class Open5e {
	private static _base = async (target: string) => {
		const { data } = await axios({
			url: `https://api.open5e.com/${target}`,
		});
		return data;
	};
	public static search(query: string) {
		return this._base(`search/?slug=${query}`);
	}
	public static spells() {
		return this._base('spells');
	}
	public static monsters() {
		return this._base('monsters');
	}
	public static documents() {
		return this._base('documents');
	}
	public static backgrounds() {
		return this._base('backgrounds');
	}
	public static planes() {
		return this._base('planes');
	}
	public static sections() {
		return this._base('sections');
	}
	public static feats() {
		return this._base('feats');
	}
	public static races() {
		return this._base('races');
	}
	public static classes() {
		return this._base('classes');
	}
	public static magicItems() {
		return this._base('magicitems');
	}
	public static weapons() {
		return this._base('weapons');
	}
}
