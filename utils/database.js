const { MongoClient } = require('mongodb');
const { mongodbPassword } = require('./config.json');
const uri = `mongodb+srv://moojigc:${mongodbPassword}@dnd-inventory-dzwpy.mongodb.net/test?retryWrites=true&w=majority`;
const DnD = 'DnD-inventory'; // bc i'm too lazy to keep typing this out

async function add(client, newItem) {
    try {
        const result = await client.db(DnD).collection('posts').insertOne(newItem);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    } catch (err) {
        console.error(err);
    }
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();
    
    console.log("databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function getData() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await client.connect();
        await listDatabases(client);
        const collection = client.db(DnD).collection("posts");
        // perform actions on the collection object
        console.log(collection);

        await add(client, {
            name: 'Moojig',
            weapons: 'None, sadly'
        });

    } catch(err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

getData();