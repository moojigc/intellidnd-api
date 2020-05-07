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
    async deletePlayer() {
        const result = await this.dbRead();
        const remaining = result.players.filter(p => p === this._id);
        this.players = remaining;
        const update = await this.dbUpdate(players);
        return update.result.nModified;
    }
}

module.exports = Guild;