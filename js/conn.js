const ip="http://192.168.137.1"

async function load() {
  let db = await fetch(ip+":5000/listings", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => res.text())
 return db;
}

async function findIds(input) {
  let db = await fetch(ip+":5000/search/:"+input, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => res.text())
    console.log(db);
 return db;
}

async function update(input) {
  log(input);
  fetch(ip+":5000/update",  {
    headers: {
      'Content-Type': "application/json",
    },
    method: "POST",
    body: JSON.stringify(input)
  })
  .then((res) => res.text())
    //console.log(db);
 return db;
}

async function updateMany(input) {
  log(input);
  fetch(ip+":5000/updateMany",  {
    headers: {
      'Content-Type': "application/json",
    },
    method: "POST",
    body: JSON.stringify(input)
  })
  .then((res) => res.text())
    console.log(db);
 return db;
}