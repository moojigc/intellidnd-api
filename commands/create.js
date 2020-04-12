module.exports = function(message) {
    function create(name, arguments) { 
        const build = require('../player')(message);
        const newPlayer = new build.Player(name);
        const [ prepack, addGold, addSilver, DMsetting ] = arguments;

        if (prepack === 'prepack') {
            newPlayer.createInventory('prepack', addGold, addSilver);
            if (DMsetting === 'DM') {
                newPlayer.notificationsToDM = true;
            }
        } else {
            newPlayer.createInventory();
        };
        return newPlayer;
    }
    return {
        create: create
    }
}