const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 10000;
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
// app.use(require('./routes/record'));
app.use(express.json());

Object.defineProperty(exports, "__esModule", { value: true });
Date.prototype.yyyyMMddHHmmss = function () {
  var date = this;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();
  return (
    "" +
    year +
    (month < 10 ? "0" + month : month) +
    (day < 10 ? "0" + day : day) +
    (hh < 10 ? "0" + hh : hh) +
    (mm < 10 ? "0" + mm : mm) +
    (ss < 10 ? "0" + ss : ss)
  );
};

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
let dbo;
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
        dbo=client.db("aiap").collection(collection1);
        // Make the appropriate DB calls
        //await listDatabases(client);
        //await listAll(client);
        app.listen(PORT, () => {
          console.log(`Server is running on port: ${PORT}`);
         // console.log(collection1);
        });

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

const collection1 = "artifacts";

// This section will help you get a list of all the records.
app.get('/listings', (req, res) => {
 // const dbConnect = dbo.getDb();
  
  collectionList = dbo.find({}).toArray();
  res.json(collectionList);
});

/**
 * Print all
 * @param {MongoClient} client A MongoClient that is connected to a cluster
 */
async function listAll(client) {
  console.log("List:");
  console.log(collectionList);
}

