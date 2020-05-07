const { MongoClient } = require("mongodb"),
    uri = process.env.MONGO_URI ? process.env.MONGO_URI : require('../private.json').dev.MONGO_URI,
    client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
});
let db;

async function dbConnect() {
    try {
        if (!db) {
            console.log(`Connecting to client...`)
            db = (await client.connect());
            console.log(`Started connection to ${uri}.`)
            return db;
        }
        else {
            console.log(`Already connected to ${uri}.`)
            db = client;
            return db
        }
    } catch (error) {
        console.trace(error);
        return 404
    }
}

module.exports = dbConnect;