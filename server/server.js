const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 10000;
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
app.use(express.json());
app.set('view-engine', 'pug');

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

const { MongoClient } = require('mongodb');
let dbo;

async function main() {
    const uri = process.env.MONGOD_CONNECT_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    } finally {
        dbo=client.db("aiap").collection(collection1);
        // Make the appropriate DB calls
        //await listDatabases(client);
        //await listAll(client);
        app.listen(PORT, () => {
          console.log(`Server is running on port: ${PORT}`);
        });
    }
}

const collection1 = "artifacts";
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


// This section will help you get a list of all the records.
app.get('/listings', async (req, res) => {
  console.log("listing...");
  const collectionList = await dbo.find({}).toArray();
  
  console.log("loaded&sent...");
  res.render('index', { title:"listing", message: "welcome here"})
  //res.json(collectionList);
});