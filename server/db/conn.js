const MongoClient = require("mongodb").MongoClient;
const connectionString = process.env.MONGOD_CONNECT_URI; //?directConnection=true

const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  let dbConnection;

  module.exports = {
    connectToServer: function (callback) {
      client.connect(function (err, db) {
        if (err || !db) {
          return callback(err);
        }
  
        dbConnection = db.db("aiap");
        console.log("Successfully connected to MongoDB.");
  
        return callback();
      });
    },
  
    getDb: function () {
      return dbConnection;
    },
  };