const $preloaded = $(".preloaded"),
	$changelogItem = $(".changelog-item"),
	$responseMsg = $(".response-msg"),
	// Data DOM elements
	$potionRow = $(".potion-row"),
	$weaponRow = $(".weapon-row"),
	$miscRow = $(".misc-row");
// modal
const $modalBackground = $(".modal-background"),
	$modalBody = $(".modal-body");

// Takes jQuery object and returns mapped data
function itemMap(itemRow) {
	return itemRow
		.get()
		.filter((row) => !!row.querySelector("input.name").value)
		.map((row) => {
			return {
				name: row.querySelector("input.name").value.toString(),
				quantity: parseInt(row.querySelector("input.quantity").value)
			};
		});
}
// money
const $gold = $(".gold"),
	$silver = $(".silver"),
	$copper = $(".copper"),
	$platinum = $(".platinum"),
	$electrum = $(".electrum");
// Buttons
const $submitBtn = $(".submit"),
	$resetBtn = $(".reset");
// Player ID
const getPlayerID = () => {
	if (!localStorage.getItem("id")) {
		localStorage.setItem("id", $playerID);
		return $(".player-name-display").data("id");
	} else return localStorage.getItem("id");
};

function readOnlyOff() {
	$(this).attr("readonly", false);
	$(this).focus();
}

function readOnlyOn() {
	$(this).attr("readonly", true);
}

async function getRequest() {
	let url = `/api/user/${getPlayerID()}`;
	return await $.ajax({
		url: url,
		method: "GET"
	});
}

function translateChangelog() {
	// Iterate over each changelog list element and reformat it with readable timestamp
	$changelogItem.get().forEach((item) => {
		let rawTime = item.dataset.time;
		let text = item.innerText;
		let date = moment(rawTime).format("MMMM Do, YYYY");
		let time = moment(rawTime).format("hh:mm a");
		let formatted = `On ${date}, at <strong>${time}</strong>: <code>${text}</code>`;
		item.innerHTML = formatted;
	});
}

// Check the user input for non numbers
function numberValidation(arrayObject, ...elements) {
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
		$modalBackground.show("fast");
		$responseMsg.text("All # fields must have a number in them!");
	}
}

// Adjust footer based on document body height
function adjFooter() {
	if (window.innerHeight > $("body").height()) $("footer").attr("style", "position: fixed; bottom: 0");
	else $("footer").attr("style", "position: unset");
}
// Handles mapping the input from the whole body. Object type sanitation is handled on server side
async function entireBodyInputHandler(potions, weapons, misc) {
	inventory = {
		gold: $gold.val(),
		silver: $silver.val(),
		copper: $copper.val(),
		platinum: $platinum.val(),
		electrum: $electrum.val(),
		// Input elements
		// potions
		potions: itemMap($(document).find(potions)),
		// weapons
		weapons: itemMap($(document).find(weapons)),
		// misc
		misc: itemMap($(document).find(misc))
	};
	const data = {
		inventory: inventory,
		changelog: {
			on: moment().format(),
			command: "Updated on website."
		},
		lastUpdated: moment().format()
	};
	let response = await $.ajax({
		url: "/inventory",
		method: "PUT",
		data: data
	});
	return response;
}

function removeItem() {
	// Show delete button
	function delBtnShow() {
		$(this).hide();
		$(this).siblings(".del-btn").fadeIn("fast");
	}
	// Hide delete button
	function delBtnHide() {
		$(this).children(".del-btn").hide();
		$(this).children(".name-label").fadeIn("fast");
	}
	// Event listeners
	$(document).on("mouseenter", ".name-label", delBtnShow);
	$(document).on("mouseleave", ".input-field", delBtnHide);
	// delete button event
	$(document).on("click", ".del-btn", async (event) => {
		event.preventDefault();
		// Delete the parent .row element
		$(event.target).closest(".row").remove();
		// Send to server...
		let res = await entireBodyInputHandler(".potion-row", ".weapon-row", ".misc-row");
		if (res.status === 404 || res.status === 202) {
			$modalBackground.show("fast");
			$responseMsg.text(res.message);
		} else if (res.status === 500) {
			window.location.assign(res.redirectURL);
		}
	});
}

function addRowHandler() {
	const $addBtn = $(".add-btn");
	function addRow(target) {
		let parentCard = $(target).closest(".card");
		let findCategory = (parent) => {
			let htmlClass = parent
				.attr("class")
				.split(" ")
				.filter((word) => word !== "card")
				.join();
			switch (htmlClass) {
				case "potion-card":
					return "potion-row";
				case "weapon-card":
					return "weapon-row";
				case "misc-card":
					return "misc-row";
				default:
					return null;
			}
		};
		console.log($(target).closest(".card").children(".card-body"));
		$(target).closest(".card").children(".card-body").append(`
<div class="row ${findCategory(parentCard)}">
    <div class="col-sm-8">
        <div class="input-group">
            <div class="input-group-prepend name-label-div">
                <span class="input-group-text name-label-span">Name</span>
                <button class="btn btn-danger del-btn" style="display: none;">Delete</button>
            </div>
            <input type="text" maxlength="180" class="form-control name" placeholder="New..." value="">
        </div>
    </div>
    <div class="col-sm-4">
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text">#</span>
            </div>
            <input type="number" class="form-control quantity" placeholder="?" value="1">
        </div>
    </div>
</div>`);
	}
	$addBtn.on("click", (event) => {
		event.preventDefault();
		addRow(event.target);
	});
}

// All action here
function main() {
	adjFooter();
	// Empty error message div
	$responseMsg.text("");
	// Format changelog
	translateChangelog();
	// Event listener for validation on inputs
	$("input.quantity").on("click", () => {
		numberValidation(null, $gold.get()[0], $silver.get()[0], $copper.get()[0], $electrum.get()[0], $platinum.get()[0]);
		numberValidation($("input.quantity").get());
	});
	// Click event on the submit button
	$submitBtn.on("click", async (event) => {
		event.preventDefault();
		try {
			let response = await entireBodyInputHandler(".potion-row", ".weapon-row", ".misc-row");
			$modalBackground.fadeIn("fast");
			$responseMsg.text(response.message);
		} catch (error) {
			console.log(error);
			$modalBackground.fadeIn("fast");
			$responseMsg.text("Sorry, an error occurred. Please try again later.");
		}
	});
	// Cancel 'enter' key press
	$(document).on("keypress", (event) => {
		if (event.which === 13) {
			event.preventDefault();
			handleConversion();
		}
	});
	// Add rows
	addRowHandler();
	// Handle single-item deletion
	removeItem();
}

main();
