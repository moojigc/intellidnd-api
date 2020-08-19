export default class Item {
	constructor(public name: string, public quantity: number) {
		this.name = name;
		this.quantity = quantity;
	}
	public removeQuantity(quantity: number) {
		this.quantity -= quantity;
		return this;
	}
	get toString() {
		return `${this.quantity} ${this.name}${this.quantity > 1 ? 's' : ''}`;
	}
}