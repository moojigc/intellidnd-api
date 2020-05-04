const { MongoClient } = require("mongodb"),
    password = process.env.MONGO_PASS || require("../private.json").mongodbPassword,
    uri = `mongodb+srv://moojigc:${password}@dnd-inventory-dzwpy.mongodb.net/test?retryWrites=true&w=majority`,
    client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
});

class Table {
    constructor(params) {
        let { collection, id } = params;
        this._id = id;
        this.collection = collection;
    }
    // Handles errors and returns db response
    async dbConnect() {
        try {
            if (!client.isConnected()) {
                console.log(`Connecting to client...`)
                return (await client.connect()).db('dnd-inventory').collection(this.collection);
            }
            else {
                console.log(`Connected to ${uri}.`)
                return client.db('dnd-inventory').collection(this.collection);
            }
        } catch (error) {
            console.trace(error);
            return 404
        }
    }
    async dbAction(method) {
        // coll = collection
        // method = method to call on collection
        // let results;
        try {
            return await method;
        } catch (error) {
            console.trace(error);
            results = 404;
        }
        // return results;
    }
    async dbDisconnect() {
        await client.close({ force: false });
        if (!client.isConnected()) console.log(`Successfully disconnected.`)
    }

    async dbInsert() {
        let db = await this.dbConnect();
        return await this.dbAction(db.insertOne(this));
    }

    async dbUpdate(values) {
        let db = await this.dbConnect();
        return await this.dbAction(db.updateOne({ _id: this._id }, { $set: values }));
    }

    async dbReplace() {
        let db = await this.dbConnect();
        return await this.dbAction(db.replaceOne({ _id: this._id }, this));
    }

    async dbDelete() {
        let db = await this.dbConnect();
        return await this.dbAction(db.deleteOne({ _id: id }));
    }

    async dbRead(id) {
        let db = await this.dbConnect();
        if (!!id) 
            return await this.dbAction(db.findOne({ _id: id }));
        else 
            return await this.dbAction(db.findOne({ _id: this._id }));
    }
    async dbUpsert() {
        let db = await this.dbConnect();
        return await this.dbAction(db.updateOne(
            { _id: this._id },
            { $set: this },
            { upsert: true }
        ));
    }
}

module.exports = Table;
