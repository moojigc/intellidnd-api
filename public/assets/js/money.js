// Secondary to "main" function
function secondary() {
	let handleConversion = () => {
		let value = (element) => parseInt(element.val());
		let money = {
			gold: value($gold),
			silver: value($silver),
			copper: value($copper),
			electrum: value($electrum),
			platinum: value($platinum),
			convert: function () {
				return this.platinum * 10 + this.electrum * 5 + this.gold + this.silver / 10 + this.copper / 100;
			}
		};
		$(".money-total").html(`Total (as gold): 👛<code>${money.convert()}</code>.`);
	};
	function onBlurs(...elements) {
		for (let element of elements) {
			element.blur(handleConversion);
		}
	}
	onBlurs($gold, $silver, $copper, $electrum, $platinum);
	handleConversion();
	$(document).on("click", ".gold, .silver, .copper, .platinum, .electrum", handleConversion);
}

secondary();
