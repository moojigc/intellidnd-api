const Table = require('./Table');

class Guild extends Table {
    constructor(params) {
        let { id, name, players } = params;
        super({
            collection: 'guilds',
            id: id
        })
        this.name = name;
        this.players = players;
    }
    async getPlayers() {
        const result = await this.dbRead();
        return result.players;
    }
}

module.exports = Guild;