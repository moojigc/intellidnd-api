/** Iterate over each changelog list element and reformat it with readable timestamp
 * @param {JQuery<HTMLElement>} $changelogItem
 * @param {import("moment")} moment
 */
export function translateChangelog($changelogItem, moment) {
	$changelogItem.get().forEach((item) => {
		let rawTime = item.dataset.time.split("").length > 13 ? item.dataset.time : parseInt(item.dataset.time);
		let text = item.innerText;
		let date = moment(rawTime).format("MMMM Do, YYYY");
		let time = moment(rawTime).format("hh:mm a");
		let formatted = `On ${date}, at <strong>${time}</strong>: <code>${text}</code>`;
		item.innerHTML = formatted;
	});
}
/** Check the user input for non numbers
 *
 * @param {HTMLElement[] | null} arrayObject
 * @param  {...HTMLElement} elements
 * @returns boolean
 */
export function validNumberInput(arrayObject, ...elements) {
	let elemArray = arrayObject ? arrayObject : elements;
	// Map all objects to booleans
	let bools = elemArray.map((e) => {
		if (e.value === "") {
			e.classList.add("invalid");
			return false;
		} else {
			e.classList.remove("invalid");
			return true;
		}
	});
	// Case that any come back false
	if (bools.filter((b) => !b).length > 0) {
		return false;
	} else {
		return true;
	}
}

/**
 * Adds additional input row
 * @param {JQuery<HTMLElement>} target
 */
export function addRow(target) {
	let parentCard = target.closest(".card");
	let findCategory = (parent) => {
		let htmlClass = parent
			.attr("class")
			.split(" ")
			.filter((word) => word !== "card")
			.join();
		return htmlClass.split("-")[0] + "-row";
	};
	target.closest(".card").children(".card-content").append(`
<div class="row ${findCategory(parentCard)}">
	<div class="col s8">
		<div class="input-field">
			<label class="prefixed-label name-label">Name</label>
			<button class="btn red lighten-1 del-btn" style="display: none;">Delete</button>
			<input type="text" maxlength="90" class="name" placeholder="New..." value="">
		</div>
	</div>
	<div class="col s4">
		<div class="input-field">
			<label for="quantity" class="prefixed-label">#</label>
			<input type="number" class="quantity" placeholder="?" value="1">
		</div>
	</div>
</div>`);
}
