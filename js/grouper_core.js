/*------------------------------------------------------------------------*/
var db,
  dbKeysList = [],
  snapshot,
  selectedCol;
var selector = [];

const path = "./archive/";
const metadataCategories = [];
let selectedItem = 0;
let indexcardIsOn = false;

const scope = document.querySelector("body");
let contextMenu;

/* ---------------------------------- load the database ---------------------------------- */
async function loadDB() {
  db = await load();
  db = JSON.parse(db);
  log(db);
}

function duplicateField() {
  log("hello!");
  let column = selectedCol.toString();
  let i = 0,
    len = db.length;
  let cindex = getMax(dbKeys[settings.collection1], "id") + 1;
  cindex = cindex.toString();

  log(cindex);
  createNewField(cindex);
  while (i < len) {
    db[i][cindex] = db[i][column];
    i++;
  }
  log("copied");
  log(db);
  saveColumn(cindex);
}

function createNewField(cindex) {
  dbKeys[settings.collection1].push({
    id: cindex,
    name: "newField",
    type: "text",
    display: true,
    editable: true,
  });
  log(dbKeys[settings.collection1]);
}

function splitStringToArray(separator = ",") {
  let column = selectedCol.toString();
  let i = 0,
    len = db.length;
  while (i < len) {
    log(db[i][column]);
    if (db[i][column] !== undefined && !Array.isArray(db[i][column])) {
      let n = db[i][column].split(separator);
      db[i][column] = n;
    }
    i++;
  }
  saveColumn(column);
}

function deleteElem(elemID) {
  let elem = document.getElementById(elemID);
  elem.remove();
}

/************************* TRUNCATE *************************** */
function truncateStringView() {
  let line = db[0][selectedCol.toString()];
  if (Array.isArray(line)) line = line[0];

  createEl(
    "div",
    "truncStringView",
    "greybox",
    '<div><div class="closeElem" onclick="deleteElem(\'truncStringView\')"><i class="fa fa-close" aria-hidden="true"></i></div><input type="text" id="tstart" name="tstart"><label for="tstart">Start</label><input type="text" id="tend" name="tend"><label for="tend">End</label><textarea id="preview" readonly>' +
      line +
      '</textarea><label for="preview">Preview</label><br><a class="but_confirm" onclick="truncateStringB()">Truncate</a></div>',
    scope
  );
}

function truncateStringB(extract = false) {
  let column = selectedCol.toString();
  let start = "",
    end = "";
  start = document.getElementById("tstart").value;
  end = document.getElementById("tend").value;
  console.log(start);
  console.log(end);
  if (extract) {
    let newcolumn = document.getElementById("textract").value;
    truncateString(column, start, end, newcolumn);
  } else truncateString(column, start, end);
}

function truncateString(column, start, end, newcolumn) {
  let i = 0,
    len = db.length;

  while (i < len) {
    if (db[i][column] !== undefined) {
      let el = db[i][column];
      if (Array.isArray(el)) {
        for (let j = 0; j < el.length; j++) {
          el[j] = truncate(el[j], start, end);
        }
      } else el = truncate(el, start, end);
      if (newcolumn == undefined) db[i][column] = el;
    }
    i++;
  }
  log(db);
  if (newcolumn) {
    let i = 0,
      len = dbKeys[settings.collection1].length;
    let cindex = -1;
    while (i < len) {
      if (dbKeys[settings.collection1][i].name == "newcolumn")
        cindex = dbKeys[settings.collection1][i].id;
      i++;
    }
    if (cindex == -1) {
      //add new field
      cindex = getMax(dbKeys[settings.collection1], "id") + 1;
    }
    saveColumn(cindex);
  } else saveColumn(column);
}

function cleanString() {
  let column = selectedCol.toString();
  let i = 0,
    len = db.length;

  while (i < len) {
    if (db[i][column] !== undefined) {
      let el = db[i][column];
      if (Array.isArray(el)) {
        for (let j = 0; j < el.length; j++) {
          el[j].replace(/(\r\n|\n|\r)/gm, "");
          db[i][column][j] = el[j].trim();
        }
      } else {
        el.replace(/(\r\n|\n|\r)/gm, "");
        db[i][column] = el.trim();
      }
    }
    i++;
  }
  log(db);
  saveColumn(column);
}

function getMax(arr, prop) {
  let max,
    i = 0,
    len = arr.length;
  while (i < len) {
    log(arr[i][prop]);
    if (max == null || parseInt(arr[i][prop]) > parseInt(max))
      max = parseInt(arr[i][prop]);
    i++;
  }
  return max;
}

function truncate(elem, start = "", end = "") {
  const indexOfFirst = elem.indexOf(start) + start.length;
  if (end != "") {
    const indexOfLast = elem.indexOf(end);
    if (indexOfLast == -1) el = elem.slice(indexOfFirst);
    else el = elem.slice(indexOfFirst, indexOfLast);
  } else el = elem.slice(indexOfFirst);
  log(el);
  return el;
}

/************************* END TRUNCATE *************************** */

/************************* EXTRACT *************************** */

function extractString() {
  let line = db[0][selectedCol.toString()];
  if (Array.isArray(line)) line = line[0];

  createEl(
    "div",
    "truncStringView",
    "greybox",
    '<div><div class="closeElem" onclick="deleteElem(\'truncStringView\')"><i class="fa fa-close" aria-hidden="true"></i></div><input type="text" id="tstart" name="tstart"><label for="tstart">Start</label><input type="text" id="tend" name="tend"><label for="tend">End</label><input type="text" id="textract" name="textract"><label for="textract">Extract to Field Name</label><textarea id="preview" readonly>' +
      line +
      '</textarea><label for="preview">Preview</label><br><a class="but_confirm" onclick="truncateStringB()">Extract</a></div>',
    scope
  );
}

/************************* END EXTRACT *************************** */
/*
addEventListener("keypress", (event) => {
  if (event.key == "s") {
    log("download!");

    downloadAsJson(db, "aiap_db.json");
  }
});
*/
function downloadAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}


function downloadAsCsv(exportObj, exportName) {
  /*var dataStr ="data:text/json;charset=utf-8," +
  encodeURIComponent(JSON.stringify(exportObj));*/
  let csv;
    let json = exportObj;
    console.log(json);
    let keys, content;
    for(item of dbKeys.objects) {
      if(item.name!=undefined)
      keys+=item.name+',';
    }
    keys+='\r\n';
    for(elem of json) {
      for(item of dbKeys.objects) {
        if(elem[item.id]!=undefined) {
          let o = elem[item.id];
          o = o.split('\n').join('<br>');
          content+=o;
          }
        content+',';
      }
      content+'\r\n';
    }
    csv=keys+content;
    /*
    var fields = Object.keys(json[0])
    var replacer = function(key, value) { return value === null ? '' : value } 
    var csv = json.map(function(row){
      return fields.map(function(fieldName){
      return JSON.stringify(row[fieldName], replacer)
      }).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    csv = csv.join('\r\n');*/
    console.log(csv);
var downloadAnchorNode = document.createElement("a");
downloadAnchorNode.setAttribute("href", csv);
downloadAnchorNode.setAttribute("download", exportName + ".csv");
document.body.appendChild(downloadAnchorNode); // required for firefox
downloadAnchorNode.click();
downloadAnchorNode.remove();
}

function downloadAsTxt(exportObj, exportName) {
  var dataStr =exportObj;
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));

  downloadAnchorNode.setAttribute("download", exportName + ".txt");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function downloadURLs(exportObj, exportName){
  let i=0, l=exportObj.length;
  while(i<l) {
    downloadImg(exportObj[i]);
    i++;
  }
}
function downloadImg(src) {
  console.log(src);
  var link = document.createElement("a");
  link.href = "http://danielesavasta.it/aiap_assets/full/"+src;
  link.download = true;
  link.style.display = "none";
  var evt = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": true
  });

  document.body.appendChild(link);
  link.dispatchEvent(evt);
  document.body.removeChild(link);
  console.log("Downloading...");
}

async function saveColumn(column) {
  let ob = [];
  let i = 0,
    len = db.length;
  while (i < len) {
    if (db[i][column] !== undefined || db[i][column] != "")
      ob[i] = {
        _id: db[i]._id,
        [dbKeys[settings.collection1][column].id]: db[i][column],
      };
    i++;
  }
  updateMany(ob);
}

const main = document.getElementsByTagName("main")[0];

/* ---------------------------------- loadInterface :: load the interface ---------------------------------- */
function loadInterface() {
  main.innerHTML =
    '<header><div id="datatableoptHeader" class="optHeader"><div id="searchForm"><input id="searchKey" class="searchInput" onkeyup="searchFor()"><i class="fa fa-search" aria-hidden="true"></i></div><div id="showHide"><a class="toggleShow" onclick="toggleShow(\'showViews\')"><i class="fa fa-eye" aria-hidden="true"></i></a><a class="toggleShow" onclick="toggleShow(\'showFields\')"><i class="fa fa-map" aria-hidden="true"></i></a></div><div id="showFields" class="chips slideInMenu"><span>Filters</span></div><div id="showViews" class="slideInMenu"><span>Visualizers</span><a class="but_confirm" onclick="datatableV();">datatable</a><a class="but_confirm" onclick="galleryV()">gallery</a></div></header>';
  showFieldVisibility();
  analysis(main);
}

function datatableV() {
  datatable(main, db, dbKeys[settings.collection1]);
  toggleShow("showViews");
}

function galleryV() {
  populateImages(main, db, settings.imageField);
  toggleShow("showViews");
}
function showFieldVisibility() {
  let keys = dbKeys[settings.collection1];
  let showFieldVisibility = document.getElementById("showFields");

  let k = 0,
    klen = keys.length;
  while (k < klen) {
    const checkField = createEl(
      "input",
      "k" + keys[k].id,
      "checkField",
      "",
      showFieldVisibility
    );
    checkField.setAttribute("type", "checkbox");
    checkField.setAttribute("name", keys[k].id);
    checkField.setAttribute("value", keys[k].name);
    if (keys[k].display) checkField.checked = true;

    const checkFieldL = createEl(
      "label",
      "",
      "",
      keys[k].name,
      showFieldVisibility
    );
    checkFieldL.setAttribute("for", "k" + keys[k].id);
    k++;
  }
  const applyFieldsFilter = createEl(
    "a",
    "",
    "but_confirm",
    "apply",
    showFieldVisibility
  );
  applyFieldsFilter.setAttribute("onclick", "setFieldVisibility()");
}
function populateContextMenu() {
  contextMenu = createEl(
    "div",
    "context-menu",
    "",
    '<a class="item" onclick="sortByTh()">Sort by</a> <a class="item" onclick="duplicateField()">Duplicate Field</a> <a class="item" onclick="splitStringToArray()">Convert to Array</a><a class="item" onclick="truncateStringView()">Truncate String</a><a class="item" onclick="extractString()">Extract Strings</a><a class="item" onclick="cleanString()">Clean Strings</a>',
    scope
  );
}
var dbLength, itemsCount;
/* ---------------------------------- analysis :: count lines of db, keys ---------------------------------- */
function analysis(container) {
  dbLength = db.length;
  itemsCount = db.length;

  let i = 0,
    len = dbKeys[settings.collection1].length;
  while (i < len) {
    dbKeysList.push(dbKeys[settings.collection1][i].name);
    i++;
  }

  let st =
    '<section id="analysis"><h3>Analysis</h3><div>Visualizing<br><b id="itemsCount">' +
    itemsCount +
    "</b>/" +
    dbLength +
    " items</div><div><h4>Unique keys</h4><ul><li>" +
    dbKeysList.join("</li><li>") +
    "</li></ul></div><div><h4>Count Collections</h4>" +
    countTags("5") +
    "</div><div><h4>Count Years</h4>" +
    countString("11") +
    '</div></section><section id="selector"><h3>Selector</h3><div id="dw_button" class="but_confirm" onclick="downloadSearch()">Download Search Artifacts</div><div id="ds_button" class="but_confirm" onclick="downloadSelect()">Download Selected Artifacts</div></section>';
  container.innerHTML += st;

  // generateID();
}

async function downloadSelect() {
  if (selector != "") {
    let exportObj = [];
    let imageList ="";
    let imageURLs = [];
    let ids=selector;
      //log(ids);
      //updateItemsCount(found.length);
      //log(db.length)
      let i = 0, len = db.length;
      while (i < len) {
        //log(db[i]._id);
        (j = 0), (jlen = ids.length);
        while (j < jlen) {
          if (db[i]._id == ids[j]) {
            exportObj.push(db[i]);

            let k = 0,
              klen = db[i]["6"].length;
            while (k < klen) {
              //log(db[i]["6"][k])
              //let n=db[i]["1"];
              //imageList+="http://192.168.137.1/assets/full/" + db[i]["6"][k] + "\n";
              imageURLs.push(db[i]["6"][k]);
              //downloadImage("assets/full/" + db[i]["6"][k], n.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, ' ').trim().substr(0, 25)+"_"+k);
              k++;
            }
          }
          j++;
        }
        i++;
      }
    
    downloadAsCsv(exportObj, "aiap_subset");
    //downloadAsTxt(imageList, "aiap_subset_images");
    //downloadURLs(imageURLs, "aiap_images");
    }
}

async function downloadSearch() {
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    let found = await findIds("*" + input + "*");
    let exportObj = [];
    let imageList ="";
    if (found !== "undefined") {
      found = JSON.parse(found);
      let i = 0,
        len = found.length,
        ids = [];
      while (i < len) {
        ids.push(found[i]._id);
        i++;
      }
      //log(ids);
      //updateItemsCount(found.length);
      //log(db.length)
      /*(i = 0), (len = db.length);
      while (i < len) {
        //log(db[i]._id);
        (j = 0), (jlen = ids.length);
        while (j < jlen) {
          if (db[i]._id == ids[j]) {
            exportObj.push(db[i]);

            let k = 0,
              klen = db[i]["6"].length;
            while (k < klen) {
              //log(db[i]["6"][k])
              //let n=db[i]["1"];
              imageList+="http://192.168.137.1/assets/full/" + db[i]["6"][k] + "\n";
              //downloadImage("assets/full/" + db[i]["6"][k], n.replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, ' ').trim().substr(0, 25)+"_"+k);
              k++;
            }
          }
          j++;
        }
        i++;
      }*/
    }
    //downloadAsJson(exportObj, "aiap_subset");
    downloadAsCsv(exportObj, "aiap_subset");
    downloadAsTxt(imageList, "aiap_subset_images");
  }
}

async function downloadImage(imageSrc,name) {
  const image = await fetch(imageSrc);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement("a");
  link.href = imageURL;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function countTags(field) {
  let i = 0,
    len = dbLength,
    tags = [],
    tagsCount = [];
  while (i < len) {
    if (db[i][field]) {
      let k = 0,
        lenk = db[i][field].length;
      while (k < lenk) {
        let j = 0,
          lenj = tags.length,
          f = false;
        while (j < lenj) {
          if (tags[j] == db[i][field][k]) {
            tagsCount[j]++;
            f = true;
          }
          j++;
        }
        if (!f) {
          tags.push(db[i][field][k]);
          tagsCount[j] = 1;
        }

        k++;
      }
    }
    i++;
  }
  //log(tags);
  //log(tagsCount);
  let returnTags = Array(tags.length);
  (i = 0), (len = tags.length);
  while (i < len) {
    returnTags[i] = new Array(2);
    returnTags[i][0] = tags[i];
    returnTags[i][1] = tagsCount[i];
    i++;
  }
  returnTags.sort(sortFunction);
  log(returnTags);

  (i = 0), (len = returnTags.length);
  let returnStringTags = "";
  while (i < len) {
    returnStringTags +=
      "<a onclick='filterByTag(\""+field+"\",\""+returnTags[i][0]+"\")'><b>" +
      returnTags[i][0] +
      "</b><span>" +
      returnTags[i][1] +
      "</span></a>";
    i++;
  }

  return returnStringTags;
}

/*--------------------------- filterByTag---------------------*/
 function filterByTag(field,tag){
  let i=0;len=db.length, found=[];
  while(i<len) {
    log(db[i][field])
    if(db[i][field]!== undefined) {
    let j=0,jlen=db[i][field].length;
    while(j<jlen) {
    if(db[i][field][j]==tag) {
      let newObj= '{"_id":"'+db[i]._id.toString()+'"}';
      found.push(newObj);
    }
    j++;
    }}
    i++;
  }
  log(found.toString());
  datatableFilter("["+found.toString()+"]");
}

function countString(field) {
  let i = 0,
    len = dbLength,
    tags = [],
    tagsCount = [];
  while (i < len) {
    if (db[i][field]) {
      let j = 0,
        lenj = tags.length,
        f = false;
      while (j < lenj) {
        if (tags[j] == db[i][field]) {
          tagsCount[j]++;
          f = true;
        }
        j++;
      }
      if (!f) {
        tags.push(db[i][field]);
        tagsCount[j] = 1;
      }
    }
    i++;
  }
  //log(tags);
  //log(tagsCount);
  let returnTags = Array(tags.length);
  (i = 0), (len = tags.length);
  while (i < len) {
    returnTags[i] = new Array(2);
    returnTags[i][0] = tags[i];
    returnTags[i][1] = tagsCount[i];
    i++;
  }
  returnTags.sort(sortFunction);
  log(returnTags);

  (i = 0), (len = returnTags.length);
  let returnStringTags = "";
  while (i < len) {
    returnStringTags +=
      "<div><b>" +
      returnTags[i][0] +
      "</b><span>" +
      returnTags[i][1] +
      "</span></div>";
    i++;
  }

  return returnStringTags;
}

function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] < b[0] ? -1 : 1;
  }
}

/* ---------------------------------- generateID :: assign ID based on row number ---------------------------------- */
function generateID() {
  for (let i = 0; i < db.length; i++) {
    db[i]["_id"] = i;
  }

  /*if (!dbKeys.includes("id")) {
    }
  }
  dbKeys.unshift("id");*/
  /*
  for (let i = 0; i < dbKeys.length; i++) {
    db = JSON.parse(
      JSON.stringify(db)
        .split('"' + dbKeys[i] + '":')
        .join('"' + i + '":')
    );
  }*/
}

/* ---------------------------------- rawJSON :: print of all json lines ---------------------------------- */
function rawJSON(what, where) {
  let lines = readItemsJson(what);
  where.innerHTML += "<section>";
  where.innerHTML += "<div>" + lines.join("</div><div>");
  where.innerHTML += "</div></section>";
}

/* ---------------------------------- readItemsJson :: list all items in json db ---------------------------------- */
function readItemsJson(objs) {
  let lines = [];
  let i = 0,
    len = objs.length;
  while (i < len) {
    let j = 0,
      jlen = objs[i].length;
    while (j < jlen) {
      let line = j + ": " + objs[i][j];
      lines.push(line);
    }

    return lines;
  }
}

/* ========================================================================================================================================================================================================================================
                                                        DATA TABLE
   ======================================================================================================================================================================================================================================== */

function datatable(container, database, keys) {
  populateContextMenu();
  removeotherviews();

  const datatableview = createEl("section", "datatableView", "view", "", ""); // Creating the view container
  const datatablebody = createEl(
    "div",
    "datatableBody",
    "viewBody",
    "",
    datatableview
  ); // Create the body

  // Create the data table
  const tbl = createEl("table", "datatable", "", "", datatablebody);

  // --- header
  const h_row = document.createElement("thead");
  tbl.appendChild(h_row);
  const trh_row = document.createElement("tr");
  h_row.appendChild(trh_row);

  let k = 0,
    klen = keys.length;
  while (k < klen) {
    let value = keys[k].name;
    if (keys[k].display) {
      const t_cell = createEl("th", "th_" + keys[k].id, "", value, trh_row);
      t_cell.setAttribute("onclick", 'selectCol("th_' + keys[k].id + '");');
      t_cell.setAttribute("oncontextmenu", "onRightClick(this,event);");
    }
    k++;
  }
  // --- body
  let tbody = createEl("tbody", "tblBody", "", "", tbl);

  let j = 0,
    rows = database.length;
  while (j < rows) {
    let elem = database[j];

    let t_row = document.createElement("tr");
    t_row.setAttribute("id", "tr" + elem._id);
    t_row.setAttribute("onclick", "selectID(" + elem._id + ")");
    t_row.setAttribute("oncontextmenu", "onRightClickRow(this,event);");
    tbody.appendChild(t_row);

    let i = 0,
      len = keys.length;
    while (i < len) {
      if (keys[i].display) {
        let keyvalue = keys[i].id;
        let td_cell = document.createElement("td");

        if (elem[keyvalue] != null) {
          switch (keys[i].type) {
            case "link":
              td_cell.innerHTML =
                "<a target='_blank' href='" +
                elem[keyvalue] +
                "'>" +
                decodeURI(/[^/]*$/.exec(elem[keyvalue])) +
                "</a>";
              break;
            case "tags":
              let j = 0,
                lenj = elem[keyvalue].length;
              while (j < lenj) {
                td_cell.innerHTML +=
                  "<div class='chipsVal'>" + elem[keyvalue][j] + "</div>";
                j++;
              }
              break;
            case "images":
              let h = 0,
                lenh = elem[keyvalue].length;
              while (h < lenh) {
                td_cell.innerHTML +=
                  "<img class='chipsVal' src='assets/s/" +
                  elem[keyvalue][h] +
                  "'/>";
                h++;
              }
              break;
            case "date":
              if (elem[keyvalue].length != 4) td_cell.classList.add("error");
            default:
              if (!isNumeric(elem[keyvalue]))
                td_cell.innerHTML = elem[keyvalue].replace(/\n/g, "<br />");
              else td_cell.innerHTML = elem[keyvalue];
          }
        }

        if (keys[i].editable) {
          console.log(keys[i].editable)
          td_cell.addEventListener("dblclick", modifyCellContent);
        }
        td_cell.setAttribute("k", keyvalue);
        td_cell.setAttribute("i", elem._id);
        t_row.appendChild(td_cell);
      }
      i++;
    }
    j++;
  }

  // --- footer
  let footer = createEl(
    "div",
    "datatableFooter",
    "viewFooter",
    "<div class='editProperty'></div>",
    datatableview
  );
  container.appendChild(datatableview);
}

function setFieldVisibility(keys = dbKeys[settings.collection1]) {
  const showFieldVisibility = document.getElementById("showFields");

  let checkboxes = showFieldVisibility.getElementsByTagName("input");

  let i = 0,
    len = checkboxes.length;
  while (i < len) {
    keys[i].display = checkboxes[i].checked;
    i++;
  }
  datatable(main, db, dbKeys[settings.collection1]);
}

/* ---------------------------------- selectCol :: select column from th in the datatable  ---------------------------------- */
function selectCol(th) {
  let rem = document.getElementsByTagName("th");
  for (let i = 0; i < rem.length; i++) {
    rem[i].classList.remove("selected");
  }

  selectedCol = th.substring(3);
  document.getElementById(th).classList.add("selected");
  log("selected column: " + selectedCol);
}

/* ---------------------------------- selectID :: select item and highlight in the datatable  ---------------------------------- */
function selectID(id) {
  let tb = document.getElementById("tblBody").children;
  for (let i = 0; i < tb.length; i++) {
    tb[i].classList.remove("selectedID");
  }
  selectedIDvalue = id;
  selectedItem = db.findIndex((item) => item.id == id);

  document.getElementById("tr" + id).classList.add("selectedID");
  if (indexcardIsOn) indexcard();
}
/* ---------------------------------- sortByTh :: sort table view by column header ---------------------------------- */
function sortByTh() {
  contextMenu.classList.remove("visible");
  log("sorting " + selectedCol);
  let e = document.getElementById("th_" + selectedCol).cellIndex;
  sortGrid(e);
}

/* ---------------------------------- modifyCellContent :: Function triggered when double click on a cell ---------------------------------- */
var modifyCellContent = function () {
  let originalContent = this.innerHTML;
  this.setAttribute("class", "cellEditing");
  this.setAttribute("height", this.offsetHeight + "px");
  this.innerHTML = "<textarea>" + originalContent + "</textarea>";
  this.firstChild.focus();
  this.firstChild.setAttribute(
    "onkeydown",
    'keyOut(event,"' + originalContent + '")'
  );
  this.firstChild.addEventListener("focusout", focusOut, true);
};
/* ---------------------------------- focusOut :: Function triggered when unfocused from cell editing ---------------------------------- */
function focusOut(event) {
  updateCell(event.target.value);
}
/* ---------------------------------- keyOut :: Function triggered when key released while cell editing (esc for revert to original, enter to confirm editing) ---------------------------------- */
function keyOut(event, originalContent) {
  let x = event.keyCode;
  if (x == 27) {
    updateCell(event.target.value);
  }
  if (x == 13) {
    updateCell(event.target.value);
  }
}
/* ---------------------------------- updateCell :: Save the content of a cell editing and revert to simple cell content ---------------------------------- */
function updateCell(newContent) {
  let td = event.target.parentElement;
  let iOfthis = td.getAttribute("i");
  let kOfthis = td.getAttribute("k");
  log("unfocused, new value:" + event.target.value + " id:" + iOfthis);
  td.classList.remove("cellEditing");
  td.classList.add("table_cell");
  td.innerHTML = newContent;
  console.log(kOfthis);
  fieldSave(iOfthis, kOfthis, event.target.value);
}
/* ---------------------------------- fieldSave :: Save the content of the new input ---------------------------------- */
async function fieldSave(id, column, newContent) {
  column = column.toString();
  selectedItem = db.findIndex((item) => item._id == id);
  log("updating " + id + " : " + selectedItem + " with " + newContent);
  db[selectedItem][column] = newContent;
  log(db[selectedItem]);
  update(db[selectedItem]);
}

/* ---------------------------------- populate images ---------------------------------- */
/* ---------------------------------- populate images ---------------------------------- */
/* ---------------------------------- populate images ---------------------------------- */
/*
var elements;
function mouseoverImage(element){
  log("overhere");
}*/

var galleryOverUnlocked = true;
function lockClick() {
  galleryOverUnlocked = true;
  log("yes");
}

function imgClick(event) {
  galleryOverUnlocked = false;
  document.getElementById("galleryOverUnlocked").checked = true;
}

function imgOver(event) {
  if (galleryOverUnlocked) {
    let idv = event.target.id;
    if (idv != "imagesContainer") {
      imKey = settings.imageField;
      imKey = imKey.toString();
      log(idv);
      let container = document.getElementById("imgPreview");

      selectedItem = db.findIndex((item) => item._id == idv);
      log(selectedItem);

      let carousel =
        '<div id="addToSelector" onclick="addToSelector()">+</div><div class="slider">';
      let i = 0,
        len = db[selectedItem][imKey].length;
      carousel += '<div class="slides">';
      while (i < len) {
        carousel +=
          '<div id="slide-' +
          i +
          '"><img src="' +
          "assets/full/" +
          db[selectedItem][imKey][i] +
          '"></div>';
        i++;
      }
      carousel += "</div></div>";
      let j = 0,
        lenj = dbKeys[settings.collection1].length,
        metadata = "<table>";
      while (j < lenj) {
        if (dbKeys[settings.collection1][j].id == "1")
          metadata += `<tr><td>${
            dbKeys[settings.collection1][j].name
          }</td><td><b>${
            db[selectedItem][dbKeys[settings.collection1][j].id]
          }</b></td></tr>`;
        else
          metadata += `<tr><td>${
            dbKeys[settings.collection1][j].name
          }</td><td>${
            db[selectedItem][dbKeys[settings.collection1][j].id]
          }</td></tr>`;
        j++;
      }
      metadata += `</table>`;
      container.innerHTML = carousel + metadata;
    }
  }
}

function zoom(event) {
  event.preventDefault();
  scale += event.deltaY * -0.001;
  // Restrict scale
  scale = Math.min(Math.max(0.165, scale), 10);
  // Apply scale transform
  event.target.parentElement.style.fontSize = scale + "em";
  if (scale < 0.5) root.style.setProperty("--imgThumbScale", "20");
  else if (scale < 1) root.style.setProperty("--imgThumbScale", "10");
  else root.style.setProperty("--imgThumbScale", "5");
}

function populateImages(container, database, imKey) {
  removeotherviews();
  const galleryView = createEl(
    "section",
    "galleryView",
    "view",
    "<legend id='ina'>Images not associated<legend>",
    container
  ); // Creating the view container

  let images = "";
  log(database.length);
  let i = 0,
    len = database.length;
  while (i < len) {
    let j = 0,
      lenj = database[i][imKey].length;
    while (j < lenj) {
      images += prepareIMG(
        database[i]._id,
        "imageThumb",
        database[i][imKey][j]
      );
      j++;
    }
    i++;
  }
  galleryView.innerHTML =
    '<div id="imgPreview"></div><div id="imagesSupContainer"><input onclick="lockClick()" type="checkbox" id="galleryOverUnlocked" name="galleryOverUnlocked"><label for="galleryOverUnlocked">lock item</label> <input type="range" min="5" max="100" value="50" class="linear_slider" id="imgSize"></input><div id="imagesContainer" >' +
    images +
    "</div></div>";

  const imagesContainer = document.getElementById("imagesContainer");
  imagesContainer.onmouseover = imgOver;
  imagesContainer.onclick = imgClick;
  imagesContainer.oncontextmenu = imgRightClick;

  let slider = document.getElementById("imgSize");

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function () {
    scale = this.value * 0.015;
    imagesContainer.style.fontSize = scale + "em";
  };
}

function imgRightClick(e){
  e.preventDefault();
  imgClick();
  lockClick();
  addToSelector();
}

var root = document.querySelector(":root");
let scale = 2;

function removeotherviews() {
  if (document.getElementById("datatableView")) {
    document.getElementById("datatableView").remove();
  }
  if (document.getElementById("galleryView")) {
    document.getElementById("galleryView").remove();
  }
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function prepareIMG(id, classes, src) {
  return (s =
    '<img src="assets/s/' +
    src +
    '" id="' +
    id +
    '" class="' +
    classes +
    '" loading="lazy" />');
}

/* ---------------------------------- createEl :: facilitate the creation of HTML elements adding type, id, class, html ---------------------------------- */
function createEl(type, id, classes, html, par) {
  let el = document.createElement(type);
  if (id) el.id = id;
  if (classes) {
    let c = classes.split(" ");
    for (let i = 0; i < c.length; i++) el.classList.add(c[i]);
  }
  if (html) el.innerHTML = html;
  if (par) par.appendChild(el);
  return el;
}

/* ---------------------------------- dragEl :: Make the selected element draggable ---------------------------------- */
function dragEl(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "Header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    // elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/* ----------------- normalizePosition:: mouse pos to show the contextmenu -- */

const normalizePosition = (mouseX, mouseY, elem) => {
  // ? compute what is the mouse position relative to the container element (scope)
  const { left: scopeOffsetX, top: scopeOffsetY } =
    elem.getBoundingClientRect();

  const scopeX = mouseX - scopeOffsetX;
  const scopeY = mouseY - scopeOffsetY;

  // ? check if the element will go out of bounds
  const outOfBoundsOnX = scopeX + contextMenu.clientWidth > scope.clientWidth;
  const outOfBoundsOnY = scopeY + contextMenu.clientHeight > scope.clientHeight;

  let normalizedX = mouseX;
  let normalizedY = mouseY;

  // ? normalzie on X
  if (outOfBoundsOnX) {
    normalizedX = scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
  }

  // ? normalize on Y
  if (outOfBoundsOnY) {
    normalizedY = scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
  }

  return { normalizedX, normalizedY };
};
/* ---------------------------------- onRightClick :: show contextmenu ---------------------------------- */
function onRightClick(elem, e) {
  e.preventDefault();
  selectCol(elem.id);
  //  alert(elem);
  const { offsetX: mouseX, offsetY: mouseY } = elem;
  const { normalizedX, normalizedY } = normalizePosition(
    event.clientX,
    event.clientY,
    elem
  );

  contextMenu.style.top = `${normalizedY}px`;
  contextMenu.style.left = `${normalizedX}px`;
  //log(event.clientX + " : " + event.clientY);
  contextMenu.classList.remove("visible");

  setTimeout(() => {
    contextMenu.classList.add("visible");
  });
}

scope.addEventListener("click", (e) => {
  if (contextMenu !== undefined) contextMenu.classList.remove("visible");
});

function onRightClickRow(elem, e) {
  e.preventDefault();
  let thatsid = elem.id;
  thatsid = thatsid.slice(2);
  log(thatsid);
  addToSelector(thatsid);
}

function addToSelector(newId) {
  //log("yo!")
  if (newId == undefined) {
    newId = db[selectedItem]._id;
  }

  //log("selected "+selectedItem);
  log("selected " + newId);

  if (!selector.includes(newId)) {
    selector.push(newId);
  }

  updateSelector();
}

function updateSelector() {
  let imKey = settings.imageField;
  let sContainer = document.getElementById("selector");
  if (document.getElementById("selectorList"))
    document.getElementById("selectorList").remove();
  let i = 0,
    len = selector.length;
  let s = "";
  while (i < len) {
    let id = selector[i].toString();
    log("toShow:" + id);
    let index = db.findIndex((item) => item._id == id);
    log(index);
    s +=
      "<div>" +
      prepareIMG(id, "imageThumb", db[index][imKey][0]) +
      "<span>" +
      db[index]["1"] +
      "</span></div>";

    i++;
  }
  let sL = createEl("div", "selectorList", "", s, sContainer);
  sL.style.width = len * 120 + "px";

  //sLsContainer.innerHTML+=s;
}
/* ---------------------------------- searchFor :: sort table view by column header ---------------------------------- */
async function searchFor() {
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    let found = await findIds("*" + input + "*");
    if (found !== "undefined") {
      datatableFilter(found);
      document.getElementById("dw_button").classList.add("show");
    }
  } else {
    let tb = document.getElementById("tblBody").children;
    for (let i = 0; i < tb.length; i++) {
      tb[i].classList.remove("hide");
    }
    document.getElementById("dw_button").classList.remove("show");
  }
}

function updateItemsCount(titemsCount) {
  itemsCount = titemsCount;
  document.getElementById("itemsCount").innerHTML = itemsCount;
}

/* ---------------------------------- datatableFilter :: hide entries not responding to the filter ---------------------------------- */
function datatableFilter(found) {
  let tb;
  if (document.getElementById("tblBody")) {
    tb = document.getElementById("tblBody").children;
  } else {
    log("thats a gallery");
    tb = document.getElementById("imagesContainer").children;
  }

  for (let i = 0; i < tb.length; i++) {
    tb[i].classList.add("hide");
  }
  found = JSON.parse(found);
  log(found[0]);
  updateItemsCount(found.length);
  for (const elem of found) {
    log("found this " + elem);

    if (document.getElementById("tr" + elem._id))
      document.getElementById("tr" + elem._id).classList.remove("hide");
    else document.getElementById(elem._id).classList.remove("hide");
  }
}

///////////////////// SUPPORT FUNCTIONS /////////////////////

// de-duplicate an array
// source: https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items

Array.prototype.unique = function () {
  var a = this.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
};

/* ---------------------------------- sortGrid :: sort table according to selected column key ---------------------------------- */
/* weird results are given if a column contains a mix of numbers and strings */
function sortGrid(colNum) {
  let tbody = document.querySelector("#tblBody");
  let rowsArray = Array.from(tbody.rows);
  let compare;
  compare = function (rowA, rowB) {
    if (isNumeric(rowA.cells[colNum].innerHTML))
      return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
    else
      return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML
        ? 1
        : -1;
  };
  // sort
  rowsArray.sort(compare);
  tbody.append(...rowsArray);
}

/* ---------------------------------- isNumeric :: verify if string contains a number ---------------------------------- */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/* ---------------------------------- toggleShow :: toggle a show class ---------------------------------- */
function toggleShow(elem) {
  document.getElementById(elem).classList.toggle("show");
}

/* ---------------------------------- log :: lazy console.log ---------------------------------- */
function log(val) {
  if (settings.verbose) console.log(val);
}


/********************************** RADIAL TREE *************************/
function radialTree(artifacts,p1,p2){
  let internalCircle=400;
  let externalCricle=800;

  //sort by p1
  //DRAW
  
  let i=0, len=artifacts.length;
  while(i<len){

  }



}