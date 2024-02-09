//console.log("May Node be with you");
const express = require('express');
const cors = require('cors');
// get MongoDB driver connection
//const dbo = require('./db/conn');

const PORT = process.env.PORT || 10000;
const app = express();
const bodyParser = require('body-parser')

//app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({limit: '50mb'}));

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
// app.use(require('./routes/record'));
app.use(express.json());

// Global error handling
/*
app.use(function (err, _req, res) {
  console.log("ended up here");
  console.error(err.stack);
  res.status(500).send('Something broke!');
});*/

// perform a database connection when the server starts
/*
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
   // console.log(collection1);
  });
});
*/
const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = process.env.MONGOD_CONNECT_URI;

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        //await listDatabases(client);
        await listAll(client);


    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

/**
 * Print the names of all available databases
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

/**
 * Print all
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listAll(client) {
  collectionList = await client.db("aiap").collection("artifacts").find({})
  //.limit(50)
  .toArray(function (err, result) {
    if (err) {
      //res.status(400).send("Error fetching listings!");
      console.log(err);
    } else {
      //res.json(result);
      console.log(result);
    }
  });

}
