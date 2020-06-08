const changelog = function (message, player, moment) {
	let readableLog = player.changelog.map(({ command, on }) => {
		return `Ran \`${command}\` at ${moment(on).format("hh:mm a, MMMM Do, YYYY")}.`;
	});
	message.author.send(readableLog.join("\n\n"));
};
module.exports = changelog;
