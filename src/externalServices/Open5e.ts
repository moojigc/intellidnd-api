import axios from 'axios';

export default class Open5e {
	private static _ = async (target: string) => {
		const { data } = await axios({
			url: `https://api.open5e.com/${target}`,
		});
		return data;
	};
	public static search(query: string) {
		return this._(`search/?slug=${query}`);
	}
	public static spells() {
		return this._('spells');
	}
	public static monsters() {
		return this._('monsters');
	}
	public static documents() {
		return this._('documents');
	}
	public static backgrounds() {
		return this._('backgrounds');
	}
	public static planes() {
		return this._('planes');
	}
	public static sections() {
		return this._('sections');
	}
	public static feats() {
		return this._('feats');
	}
	public static races() {
		return this._('races');
	}
	public static classes() {
		return this._('classes');
	}
	public static magicItems() {
		return this._('magicitems');
	}
	public static weapons() {
		return this._('weapons');
	}
}
