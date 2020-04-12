module.exports = {
    changelog: function(message, player) {
        let readableLog = [];
        player.changelog.forEach(change => {
            readableLog.push(`Ran \`${change.command}\` at ${change.on}.`)
        })
        console.log(readableLog);
        message.author.send(readableLog.join('\n\n'));
    }
}