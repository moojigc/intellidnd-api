export default function registerSW() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("service-worker.js")
				.then((reg) => {
					console.log("We found your service worker file!", reg);
				})
				.catch(console.error);
		});
	}
}
