const dbConnect = require('../utils/connection');
const dnd = process.env.MONGODB_NAME ? process.env.MONGODB_NAME : 'dnd-inventory';

class Table {
    constructor(params) {
        let { collection, id } = params;
        this._id = id;
        this.collection = collection;
    }
    async dbAction(method) {
        try {
            return await method;
        } catch (error) {
            console.trace(error);
            results = 404;
        } 
    }

    async dbInsert() {
        let db = await dbConnect();
        return await this.dbAction(db.db(dnd).collection(this.collection).insertOne(this));
    }

    async dbUpdate(values) {
        let db = await dbConnect()
        return await this.dbAction(db.db(dnd).collection(this.collection).updateOne({ _id: this._id }, { $set: values }));
    }

    async dbReplace() {
        let db = await dbConnect();
        return await this.dbAction(db.db(dnd).collection(this.collection).replaceOne({ _id: this._id }, this));
    }

    async dbDelete() {
        let db = await dbConnect();
        return await this.dbAction(db.db(dnd).collection(this.collection).deleteOne({ _id: this._id }));
    }

    async dbRead(id) {
        let db = await dbConnect();
        if (!!id) 
            return await this.dbAction(db.db(dnd).collection(this.collection).findOne({ _id: id }));
        else 
            return await this.dbAction(db.db(dnd).collection(this.collection).findOne({ _id: this._id }));
    }
    async dbUpsert() {
        let db = await dbConnect();
        return await this.dbAction(db.db(dnd).collection(this.collection).updateOne(
            { _id: this._id },
            { $setOnInsert: this },
            { upsert: true }
        ));
    }
    async dbDisconnect() {
        let db = await dbConnect();
        return await db.close()
    }
}

module.exports = Table;
