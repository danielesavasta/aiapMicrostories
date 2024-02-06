//console.log("May Node be with you");
const express = require('express');
const cors = require('cors');
// get MongoDB driver connection
const dbo = require('./db/conn');
const fs = require('fs');

const PORT = process.env.PORT || 10000;
const app = express();
const bodyParser = require('body-parser')


//app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({limit: '50mb'}));

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
app.use(require('./routes/record'));
app.use(express.json());

// Global error handling
app.use(function (err, _req, res) {
  console.log("ended up here");
  console.error(err.stack);
  //res.status(500).send('Something broke!');
});

// perform a database connection when the server starts
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});