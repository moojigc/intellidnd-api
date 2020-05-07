const { MongoClient } = require("mongodb"),
    uri = process.env.MONGODB_URI ? process.env.MONGODB_URI : require('../private.json').production.MONGODB_URI,
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
        console.log(`cannot connect to ${uri}`)
        console.trace(error);
        return 404
    }
}

module.exports = dbConnect;