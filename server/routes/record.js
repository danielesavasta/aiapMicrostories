const express = require("express");
const fs = require("fs");

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

async function save() {
  const dbConnect = dbo.getDb();
  let jsonContent = await dbConnect.collection(collection1).find({}).toArray();

  // console.log(jsonContent);

  const utcTimestamp = new Date().yyyyMMddHHmmss();
  const uri = "backup/output" + utcTimestamp + ".json";
  const j = JSON.stringify(jsonContent);

  fs.writeFile(uri, j, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
}

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");
const collection1 = "artifacts";

// This section will help you get a list of all the records.
recordRoutes.route("/listings").get(async function (_req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    //.collection(collection1)
    .find({})
    //.limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching listings!");
      } else {
        res.json(result);
      }
    });
});

// This section will help you create a new record.
recordRoutes.route("/add").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const matchDocument = {
    listing_id: req.body.id,
    last_modified: new Date(),
    session_id: req.body.session_id,
    direction: req.body.direction,
  };

  dbConnect
    .collection("matches")
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400).send("Error inserting matches!");
      } else {
        console.log(`Added a new match with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// This section will help you update a record by id.
recordRoutes.route("/update").post(function (req, res) {
  const dbConnect = dbo.getDb();
  save();
  const param = req.body;
  console.log("en route " + param._id);

  //var ObjectId = require('mongodb').ObjectId;
  //let id = ObjectId(param._id);
  let id = param._id;
  delete param["_id"];
  const listingQuery = { _id: id };
  const updates = { $set: param };
  console.log(param);

  dbConnect
    .collection(collection1)
    .updateOne(listingQuery, updates, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error updating likes on listing with id ${listingQuery.id}!`);
      } else {
        console.log("1 document updated");
      }
    });
});

recordRoutes.route("/updateMany").post(function (req, res) {
  const dbConnect = dbo.getDb();
  save();
  const param = req.body;
  console.log("en route ");

  let listingQuery = [];
  //let ObjectID = require('mongodb').ObjectID;
  let i = 0,
    len = param.length;
  while (i < len) {
    if (param[i]) {
      let id = param[i]._id;
      delete param[i]._id;
      listingQuery[i] = {
        updateOne: { filter: { _id: id }, update: { $set: param[i] } },
      };
    }
    i++;
  }

  //delete param['_id'];
  //const updates = {$set: param};
  console.log(listingQuery);
  try {
    dbConnect.collection(collection1).bulkWrite(listingQuery);
  } catch (error) {
    print(error);
  }
});

// This section will help you delete a record.
recordRoutes.route("/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.body.id };

  dbConnect
    .collection(collection1)
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log("1 document deleted");
      }
    });
});

recordRoutes.route("/search/:p").get((req, res) => {
  const dbConnect = dbo.getDb();
  const param = req.params.p;
  console.log(param);
  dbConnect
    //.collection(collection1)
    .createIndex({ "$**": "text" }, { name: "TextIndex" });

  dbConnect
    //.collection(collection1)
    .find({ $text: { $search: param } })
    .project({ _id: 1 })
    .toArray(async function (err, result) {
      if (err) {
        console.log(dbConnect.collection(collection1))
        res.status(400).send("Error fetching listings!");
      } else {
        console.log(result);
        res.json(result);
      }
    });
});

module.exports = recordRoutes;
