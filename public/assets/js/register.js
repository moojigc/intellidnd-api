async function postNewUserRequest(data) {
	return await $.post({
		url: "/api/register",
		data: data
	});
}

async function registerMain() {
	$(".register-user").on("click", async (event) => {
		event.preventDefault();
		const clean = (element) => $(element).val().trim();
		const user = {
			email: clean(".email"),
			username: clean(".username"),
			password: clean(".password"),
			password2: clean(".password2"),
			characterName: clean(".characterName"),
			token: clean(".token")
		};
		const res = await postNewUserRequest(user);
		console.log(res);
		window.location.assign(res.redirectURL);
	});
}

registerMain();
