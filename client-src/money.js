/** Displays the money in a readable format
 * @param {$} $
 * @param {JQuery<HTMLElement>} $gold
 * @param {JQuery<HTMLElement>} $silver
 * @param {JQuery<HTMLElement>} $copper
 * @param {JQuery<HTMLElement>} $electrum
 * @param {JQuery<HTMLElement>} $platinum
 */
export default function money($, $gold, $silver, $copper, $electrum, $platinum) {
	const handleConversion = () => {
		const value = (element) => parseInt(element.val() || 0);
		const money = {
			gold: value($gold),
			silver: value($silver),
			copper: value($copper),
			electrum: value($electrum),
			platinum: value($platinum),
			convert: function () {
				let convertedValue = this.platinum * 10 + this.electrum * 5 + this.gold + this.silver / 10 + this.copper / 100;
				return convertedValue.toFixed(2);
			}
		};
		$(".money-total").html(`Total (as gold): 👛<code>${money.convert()}</code>.`);
	};
	const onBlurs = (...elements) => {
		for (let element of elements) {
			element.blur(handleConversion);
		}
	};
	onBlurs($gold, $silver, $copper, $electrum, $platinum);
	handleConversion();
	$(document).on("click", ".gold, .silver, .copper, .platinum, .electrum", handleConversion);
}
