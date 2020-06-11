// @ts-check
import $ from "jquery";
import moment from "moment";
import money from "./money";
import modal from "./modal";
import { translateChangelog, validNumberInput, addRow } from "./helpers";
import { Dropdown } from "materialize-css";

const $modalBackground = $(".modal-background"),
	$responseMsg = $(".response-msg");
// money
const $gold = $(".gold"),
	$silver = $(".silver"),
	$copper = $(".copper"),
	$platinum = $(".platinum"),
	$electrum = $(".electrum");

/**
 * Adjust footer based on document body height
 */
function adjFooter() {
	if (window.innerHeight > $("body").height()) $("footer").attr("style", "position: fixed; bottom: 0");
	else $("footer").attr("style", "position: unset");
}
/**
 * Handles mapping the input from the whole body. Object type sanitation is handled on server side
 * @returns server response
 */
async function entireBodyInputHandler(potions, weapons, misc) {
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
	const inventory = {
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
	modal($modalBackground, $);
	money($, $gold, $silver, $copper, $electrum, $platinum);
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

// All action here
function main() {
	new Dropdown(document.querySelector(".dropdown-trigger"), {
		autoTrigger: true,
		alignment: "right",
		coverTrigger: false,
		closeOnClick: true
	});

	adjFooter();
	// Empty error message div
	$responseMsg.text("");
	// Format changelog
	translateChangelog($(".changelog-item"), moment);
	// Event listener for validation on inputs
	$("input.quantity").on("click", () => {
		validNumberInput(null, $gold.get()[0], $silver.get()[0], $copper.get()[0], $electrum.get()[0], $platinum.get()[0]);
		validNumberInput($("input.quantity").get());
	});
	// Click event on the submit button
	$(".submit").on("click", async (event) => {
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
		}
	});
	// Add rows
	$("addBtn").on("click", (event) => {
		event.preventDefault();
		addRow($(event.target));
	});
	// Handle single-item deletion
	removeItem();
}

main();
