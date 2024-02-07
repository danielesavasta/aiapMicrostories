const { MongoClient, ServerApiVersion } = require("mongodb");
// Replace the placeholder with your Atlas connection string
const connectionString = process.env.MONGOD_CONNECT_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(connectionString,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

let dbConnection;

  module.exports = {
    connectToServer: function (callback) {
      client.connect(function (err, db) {
        if (err || !db) {
          return callback(err);
        }
        dbConnection = db.db("aiap").collection("artifacts");
        console.log(dbConnection);
       /* dbConnection.listCollections().toArray(function(err, collInfos) {
          // collInfos is an array of collection info objects that look like:
          // { name: 'test', options: {} }
          console.log(collInfos);
      });*/
        
        console.log("Successfully connected to MongoDB.");
  
        return callback();
      });
    },
  
    getDb: function () {
      return dbConnection;
    },
    
  };