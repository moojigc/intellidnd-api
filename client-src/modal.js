/**
 *
 * @param {JQuery<HTMLElement>} modalBody
 * @param {$} $
 * @returns void
 */
export default function modal(modalBody, $) {
	$(document).on("click", ".back-btn, .modal-background", (event) => {
		console.log(event.target);
		if (event.target === modalBody.get()[0] || event.target === $(".back-btn").get()[0]) {
			modalBody.fadeOut("fast");
		}
	});
}
