/*------------------------------------------------------------------------*/
var db,
  dbKeysList=[],
  snapshot,
  selectedCol;

const path = "./archive/";
const metadataCategories = [];
let selectedItem = 0;
let indexcardIsOn = false;

const scope = document.querySelector("body");
let contextMenu;

/* ---------------------------------- load the database ---------------------------------- */
async function loadDB(){
  db = await load();
  db =JSON.parse(db)
  //log(db);
}


/* ---------------------------------- saveAll :: Function triggered when unfocused from cell editing ---------------------------------- */
/*function saveAll(content) {
  let data = new FormData();
  data.append("dab", JSON.stringify(content));
  let xhr = new XMLHttpRequest();
  xhr.open('post', path +'saveJson.php', true);
  xhr.send(data);
}*/

function duplicateField() {
  console.log("hello!");
  let column = selectedCol.toString();
  let i = 0,len=db.length;
  let cindex = getMax(dbKeys[settings.collection1], "id")+1;
  cindex=cindex.toString();

  log(cindex);
  createNewField(cindex);
  //log(column);
  while(i<len) {
    db[i][cindex] = db[i][column];
    i++;
  }
  log("copied");
  log(db);
  saveColumn(cindex);
}

function createNewField(cindex) {
  dbKeys[settings.collection1].push({"id": cindex,"name":"newField","type": "text", "display": true, "editable": true });
  log(dbKeys[settings.collection1]);
}

function splitStringToArray(separator = ",") {
  let column = selectedCol.toString();
  let i = 0,len=db.length;
  //log(column);
  while(i<len) {
    log(db[i][column]);
      if((db[i][column] !== undefined)&&(!Array.isArray(db[i][column]))) {
    let n = db[i][column].split(separator);
    db[i][column] = n;
    } i++;
  }
  saveColumn(column);
}

function deleteElem(elemID){
  let elem = document.getElementById(elemID);
  elem.remove();
}

/************************* TRUNCATE *************************** */
function truncateStringView() {
  let line=db[0][selectedCol.toString()]
  if(Array.isArray(line))line=line[0];
  
  createEl("div","truncStringView","greybox",'<div><div class="closeElem" onclick="deleteElem(\'truncStringView\')"><i class="fa fa-close" aria-hidden="true"></i></div><input type="text" id="tstart" name="tstart"><label for="tstart">Start</label><input type="text" id="tend" name="tend"><label for="tend">End</label><textarea id="preview" readonly>'+line+'</textarea><label for="preview">Preview</label><br><a class="but_confirm" onclick="truncateStringB()">Truncate</a></div>',scope);
}

function truncateStringB(extract=false){
  let column = selectedCol.toString();
  let start="",end=""
  start=document.getElementById("tstart").value;
  end=document.getElementById("tend").value;
  console.log(start);
  console.log(end);
  if(extract) {
    let newcolumn=document.getElementById("textract").value;
    truncateString(column, start, end, newcolumn)
  }
  else truncateString(column, start, end)
}

function truncateString(column, start, end, newcolumn) {
  let i = 0,len=db.length;
  
  while(i<len) {
    if( db[i][column] !== undefined) {
        let el=db[i][column];
        if(Array.isArray(el)) {
          for(let j=0;j<el.length;j++) {
            el[j]=truncate(el[j],start,end);
          }        
        }
        else el=truncate(el,start,end);
        if(newcolumn == undefined) db[i][column] = el;
    } i++;
  }
  log(db)
  if(newcolumn) {
    let i=0,len=dbKeys[settings.collection1].length;
    let cindex=-1;
    while(i<len) {
      if(dbKeys[settings.collection1][i].name=="newcolumn")
        cindex=dbKeys[settings.collection1][i].id;
      i++;
    }
    if(cindex==-1) {
      //add new field
      cindex = getMax(dbKeys[settings.collection1], "id") + 1;
    }
    saveColumn(cindex);
  }
  else
    saveColumn(column);
}

function cleanString() {
  let column = selectedCol.toString();
  let i = 0,len=db.length;
  
  while(i<len) {
    if( db[i][column] !== undefined) {
        let el=db[i][column];
        if(Array.isArray(el)) {
          for(let j=0;j<el.length;j++) {
            el[j].replace(/(\r\n|\n|\r)/gm, "");
          }        
        }
        else el.replace(/(\r\n|\n|\r)/gm, "");
        db[i][column] = el.trim();
    } i++;
  }
  log(db)
  saveColumn(column);
}

function getMax(arr, prop) {
  let max, i=0, len=arr.length;
  while(i<len) {
      log(arr[i][prop])
      if (max == null || parseInt(arr[i][prop]) > parseInt(max)) max = parseInt(arr[i][prop]);
      i++;
  }
  //log(max)
  return max;
}

function truncate(elem,start="",end=""){
  const indexOfFirst = elem.indexOf(start)+start.length;
  if(end!="") {
    const indexOfLast = elem.indexOf(end);
    if(indexOfLast== -1)el=elem.slice(indexOfFirst);
    else el=elem.slice(indexOfFirst,indexOfLast);
  } else el=elem.slice(indexOfFirst);
  log(el)
  return el;
}

/************************* END TRUNCATE *************************** */

/************************* EXTRACT *************************** */

function extractString() {
  let line=db[0][selectedCol.toString()]
  if(Array.isArray(line))line=line[0];
  
  createEl("div","truncStringView","greybox",'<div><div class="closeElem" onclick="deleteElem(\'truncStringView\')"><i class="fa fa-close" aria-hidden="true"></i></div><input type="text" id="tstart" name="tstart"><label for="tstart">Start</label><input type="text" id="tend" name="tend"><label for="tend">End</label><input type="text" id="textract" name="textract"><label for="textract">Extract to Field Name</label><textarea id="preview" readonly>'+line+'</textarea><label for="preview">Preview</label><br><a class="but_confirm" onclick="truncateStringB()">Extract</a></div>',scope);
}

/************************* END EXTRACT *************************** */

addEventListener("keypress", (event) => {
  if (event.key == "s") {
    log("download!");

    downloadOAsJson(db, "aiap_db.json");
  }
});

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

async function saveColumn(column) {
  let ob = [];
  let i=0, len=db.length;
  while(i<len){
    if((db[i][column] !== undefined)||(db[i][column] != ""))
      ob[i] = { _id: db[i]._id, [dbKeys[settings.collection1][column].id]: db[i][column] };
    i++;
  }
  //console.log(ob)
  updateMany(ob);
  //const { data, error } = await _supabase.from("artifacts").upsert(ob).select();
}
const main = document.getElementsByTagName("main")[0];
/* ---------------------------------- loadInterface :: load the interface ---------------------------------- */
function loadInterface() { 
  main.innerHTML = '<header><div id="datatableoptHeader" class="optHeader"><div id="searchForm"><input id="searchKey" class="searchInput" onkeyup="searchFor()"><i class="fa fa-search" aria-hidden="true"></i></div><div id="showHide"><a class="toggleShow" onclick="toggleShow(\'showFields\')"><i class="fa fa-eye" aria-hidden="true"></i></a><a class="toggleShow" onclick="toggleShow(\'showViews\')"><i class="fa fa-map" aria-hidden="true"></i></a></div><div id="showFields" class="chips slideInMenu"><span>Filters</span></div><div id="showViews" class="slideInMenu"><span>Visualizers</span><a class="but_confirm" onclick="datatableV();">datatable</a><a class="but_confirm" onclick="galleryV()">gallery</a></div></header>';
  showFieldVisibility();
  analysis(main);
  //generateID();
  //log(dbKeys);
  //datatable(main,db,dbKeys[settings.collection1]);
  //populateImages(main,db,dbKeys[settings.imageField])
  //saveAll(db);

  /*const optHeader = createEl("div","datatableoptHeader","optHeader","",datatableview); // Creating a header
  const searchF = createEl("div","searchForm","","",optHeader);
  const showF = createEl("div","showHide","","<a class='toggleShow' onclick='toggleShow(\"showFields\")'><i class='fa fa-eye' aria-hidden='true'></i></a>",optHeader);
  const showFieldVisibility= createEl("div","showFields","chips","",datatableview);

  const viewF = createEl("div","showHideView","","<a class='toggleShow' onclick='toggleShow(\"showViews\")'><i class='fa fa-map' aria-hidden='true'></i></a>",optHeader);
  const showViews= createEl("div","showViews","","",datatableview);*/
}

function datatableV(){
  datatable(main,db,dbKeys[settings.collection1])
}

function galleryV(){
  populateImages(main,db,settings.imageField)
}
function showFieldVisibility(){
  let keys=dbKeys[settings.collection1];
  let showFieldVisibility=document.getElementById("showFields");

let k=0, klen=keys.length;
  while (k<klen) {
    const checkField= createEl("input","k"+keys[k].id,"checkField","",showFieldVisibility);
    checkField.setAttribute("type","checkbox");
    checkField.setAttribute("name",keys[k].id);
    checkField.setAttribute("value",keys[k].name);
    if(keys[k].display) checkField.checked=true;

    const checkFieldL= createEl("label","","",keys[k].name,showFieldVisibility);
    checkFieldL.setAttribute("for","k"+keys[k].id);
    k++;
  };
  const applyFieldsFilter= createEl("a","","but_confirm","apply",showFieldVisibility);
  applyFieldsFilter.setAttribute("onclick","setFieldVisibility()")
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

/* ---------------------------------- analysis :: count lines of db, keys ---------------------------------- */
function analysis(container) {
  for (let i = 0; i < dbKeys[settings.collection1].length; i++) {
    //let newArr = Object.keys(db[i]);
    dbKeysList.push(dbKeys[settings.collection1][i].name);// = dbKeys.concat(newArr).unique();
  }
  //console.log(dbKeys);
  //snapshot = defiant.getSnapshot(db);
  let st='<section id="analysis"><h3>Analysis</h3><div>Visualizing<br><b>' + db.length + '</b>/'+db.length+' items</div><div><h4>Unique keys</h4><ul><li>' + dbKeysList.join("</li><li>") + '</li></ul></div></section><section id="selector"><h3>Selector</h3></section>';
  
  container.innerHTML += st;
}



/* ---------------------------------- generateID :: assign ID based on row number ---------------------------------- */
function generateID() {
  /*if (!dbKeys.includes("id")) {
    for (let i = 0; i < db.length; i++) {
      db[i]["id"] = i;
    }
  }
  dbKeys.unshift("id");*/

  // fulldb.keys = dbKeys;
  //log(dbKeys);
  for (let i = 0; i < dbKeys.length; i++) {
    db = JSON.parse(
      JSON.stringify(db)
        .split('"' + dbKeys[i] + '":')
        .join('"' + i + '":')
    );
  }
  //log(db);
}

/* ---------------------------------- rawJSON :: print of all json lines ---------------------------------- */
function rawJSON(what,where) {
  let lines = readItemsJson(what);
  where.innerHTML += "<section>";
  where.innerHTML += "<div>" + lines.join("</div><div>");
  where.innerHTML += "</div></section>";
}

/* ---------------------------------- readItemsJson :: list all items in json db ---------------------------------- */
function readItemsJson(objs) {
  let lines = [];
  let i=0, len=objs.length;
  while(i<len) {
  //for (let i = 0; i < objs.length; i++)
    let j=0, jlen = objs[i].length;
    while(j<jlen) {
    //Object.keys(objs[i]).forEach(function (k) {
      let line = j + ": " + objs[i][j];
      lines.push(line);
    };

  return lines;}
}
/* -- deprecated
function saveJson(title, content) {
  let data = new FormData();
  data.append(title, JSON.stringify(content));
  let xhr = new XMLHttpRequest();

  xhr.open("post", "saveJson.php", true);
  xhr.send(data);

  if (title == "db") {
    snapshot = defiant.getSnapshot(db);
    if (document.getElementById("obj_menu_toggle").checked) populateTable();
  }
}
*---/
/* ========================================================================================================================================================================================================================================
                                                        DATA TABLE
   ======================================================================================================================================================================================================================================== */

function datatable(container,database,keys) {
  populateContextMenu();
  removeotherviews();

  const datatableview = createEl("section", "datatableView", "view", "", ""); // Creating the view container
  //const header = createEl("div","datatableViewHeader","viewHeader","",datatableview); // Creating a header

  //closeEl(datatableview.id, header); // Closing view
  const datatablebody = createEl("div","datatableBody","viewBody","",datatableview); // Create the body

  // Create the data table
  const tbl = createEl("table", "datatable", "", "", datatablebody);

  // --- header
  const h_row = document.createElement("thead");
  tbl.appendChild(h_row);
  const trh_row = document.createElement("tr");
  h_row.appendChild(trh_row);

  let k=0, klen=keys.length;
  while (k<klen) {
    let value = keys[k].name;
    if(keys[k].display) {
      const t_cell = createEl("th", "th_" + k, "", value, trh_row);
      t_cell.setAttribute("onclick", 'selectCol("th_' + k + '");');
      t_cell.setAttribute("oncontextmenu", "onRightClick(this,event);");
    }
    k++;
  };
  // --- body
  let tbody = createEl("tbody", "tblBody", "", "", tbl);
  
  let j=0,rows=database.length;
  while(j<rows) {
    let elem=database[j];

    let t_row = document.createElement("tr");
    t_row.setAttribute("id", "tr" + elem._id);
    t_row.setAttribute("onclick", "selectID(" + elem._id + ")");
    tbody.appendChild(t_row);

    let i=0,len=keys.length;
    while(i<len){
      if(keys[i].display){
      let keyvalue = keys[i].id;
      let td_cell = document.createElement("td");

      if (elem[keyvalue] != null) {
        switch(keys[i].type){
          case "link": td_cell.innerHTML ="<a href='" +elem[keyvalue] +"'>" + decodeURI(/[^/]*$/.exec(elem[keyvalue])) +"</a>"; break;
          case "tags": let j=0,lenj=elem[keyvalue].length;
                       while(j<lenj) {
                        td_cell.innerHTML+="<div class='chipsVal'>"+elem[keyvalue][j]+"</div>";
                        j++;
                        }
                        break;
          case "images": let h=0,lenh=elem[keyvalue].length;
                         while(h<lenh) {
                           td_cell.innerHTML+="<img class='chipsVal' src='assets/s/"+elem[keyvalue][h]+"'/>";
                        h++;
                        }
                        break;
          case "date": if(elem[keyvalue].length!=4) td_cell.classList.add("error");
          default: td_cell.innerHTML = elem[keyvalue].replace(/\n/g, "<br />");

          ;
        }
      }

      if (keys[i].editable)
        td_cell.addEventListener("dblclick", modifyCellContent);
        td_cell.setAttribute("k", keyvalue);
        td_cell.setAttribute("i", elem._id);
      t_row.appendChild(td_cell);
      }i++;
    }
    j++;
  }

  // --- footer
  let footer = createEl("div","datatableFooter","viewFooter","<div class='editProperty'></div>",datatableview);
  container.appendChild(datatableview);
}

function setFieldVisibility(keys=dbKeys[settings.collection1]){
  const showFieldVisibility=document.getElementById("showFields");

  let checkboxes =showFieldVisibility.getElementsByTagName("input");

  let i=0,len=checkboxes.length;
  while(i<len){
    keys[i].display=checkboxes[i].checked;
    i++;
  }
  datatable(main,db,dbKeys[settings.collection1]);
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
  /*let rem = document.getElementsByTagName("th");
  for (let i = 0; i < rem.length; i++) {
    rem[i].classList.remove("selected");
  }
  document.getElementById(th).classList.add("selected");
  selectedCol = th.substring(3);*/
  sortGrid(e);
}

/* ---------------------------------- modifyCellContent :: Function triggered when double click on a cell ---------------------------------- */
var modifyCellContent = function () {
  let originalContent = this.innerHTML;
  this.setAttribute("class", "cellEditing");
  this.setAttribute("height", this.offsetHeight+"px");
  this.innerHTML = '<textarea>' + originalContent + '</textarea>';
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

  //let data=saveAll(fulldb);
  //console.log(data);
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
  console.log(kOfthis)
  fieldSave(iOfthis, kOfthis, event.target.value);
}
/* ---------------------------------- fieldSave :: Save the content of the new input ---------------------------------- */
async function fieldSave(id, column, newContent) {
  column=column.toString();
  //log(id)
  let selectedItem = db.findIndex(item => item._id == id);
  log("updating:"+selectedItem+" with "+newContent)
  db[selectedItem][column] = newContent;
  //log(row);
  log(db[selectedItem])
  update(db[selectedItem])
  /*
  const { data, error } = await _supabase
    .from("artifacts")
    .update({ json: db[row] })
    .eq("id", row);
*/
  //saveAll(db[i][k]);
}

/* ---------------------------------- populate images ---------------------------------- */
/* ---------------------------------- populate images ---------------------------------- */
/* ---------------------------------- populate images ---------------------------------- */
var elements;

function mouseoverImage(element){
  log("overhere");
  
}

function over(event) {
  let idv=event.target.id;
  if(idv != "imagesContainer") {
    imKey=settings.imageField;
    imKey=imKey.toString();
    log(idv);
    let container = document.getElementById("imgPreview");
    selectedItem = db.findIndex((item) => item._id == idv);
    log(selectedItem);
    container.getElementsByTagName("img")[0].src = "assets/full/"+db[selectedItem][imKey][0];
  }
 };

 function zoom(event) {
  event.preventDefault();
  scale += event.deltaY * -0.001;
  // Restrict scale
  scale = Math.min(Math.max(.165, scale), 10);
  // Apply scale transform
  event.target.parentElement.style.fontSize = scale+"em";
  if(scale<0.5)
    root.style.setProperty('--imgThumbScale', '20');
  else if(scale<1)
    root.style.setProperty('--imgThumbScale', '10');
  else root.style.setProperty('--imgThumbScale', '5');
  //log(scale)
}

function populateImages(container,database,imKey) {
  removeotherviews();
  const galleryView = createEl("div", "galleryView", "view", "<legend id='ina'>Images not associated<legend>", container); // Creating the view container
  
  let images="";
  log(database.length)
  let i=0,len=database.length;
  while(i<len){
    let j=0,lenj=database[i][imKey].length;
    while(j<lenj){
      images+=prepareIMG(database[i]._id, "imageThumb", database[i][imKey][j])
      j++;}
    i++;
  }
  galleryView.innerHTML = '<div id="imgPreview"><img src="assets/_blank.png" /></div><div id="imagesSupContainer"><input type="range" min="5" max="100" value="50" class="slider" id="imgSize"></input><div id="imagesContainer" >'+images+"</div></div>";
  
  const imagesContainer = document.getElementById("imagesContainer");

  //imagesContainer.onwheel = zoom;
  imagesContainer.onmouseover = over;

  let slider = document.getElementById("imgSize");
/*
  var output = document.getElementById("demo");
  output.innerHTML = slider.value; // Display the default slider value
  */
  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    scale = this.value*0.015;
    imagesContainer.style.fontSize = scale+"em";
  }

  //elements=document.getElementsByClassName("imageThumb");
}

var root = document.querySelector(':root');
let scale = 2;

function removeotherviews(){
  if (document.getElementById("datatableView")) {
    document.getElementById("datatableView").remove();
  }
  if (document.getElementById("galleryView")) {
    document.getElementById("galleryView").remove();
  }
}

/*
function calculateDistance(elem, mouseX, mouseY) {
  return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.getBoundingClientRect().left+(elem.offsetWidth/2)), 2) - elem.offsetWidth/2 + Math.pow(mouseY - (elem.getBoundingClientRect().top+(elem.offsetHeight/2)), 2) ) -elem.offsetHeight/2);
} 

var t=setInterval(lens,1000);

//onmousemove = (event) =>
function lens() {
  onmousemove = (event) => {
  let mX = event.pageX;
  let mY = event.pageY;
  distanceToAll(mX, mY);
  }
  //log(distance) 1000 0
};

function distanceToAll(mX, mY){
  let i=0,len=elements.length;
  while(i<len){
    let distance = calculateDistance(elements[i], mX, mY);
    elements[i].style.fontSize=map_range(distance,1000,0,0,3)+"em";
  }
}
*/
function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function prepareIMG(id, classes, src) {
  return s='<img src="assets/s/'+src+'" id="'+id+'" class="'+classes+ '" loading="lazy" />'; 
  // srcset="assets/full/'+src+'" sizes="container(min-width: 400px) 90vw" 
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

/* ---------------------------------- closeEl :: create the closing view element ---------------------------------- */
/*
  deprecated
function closeEl(id, par) {
  let el = document.createElement("a");
  el.innerHTML = "x";
  el.classList.add("viewClose");
  el.setAttribute("onClick", 'deleteEl("' + id + '");');
  par.appendChild(el);
  //return el;
}
*/
/* ---------------------------------- deleteEl :: destroy the selected element ---------------------------------- */
/* 
  deprecated
function deleteEl(idd) {
  let element = document.getElementById(idd);
  element.parentNode.removeChild(element);
}*/
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

/* ---------------------------------- tableToJson ::---------------------------------- */
/*function tableToJson(table) {
  var data = [];
  for (var i = 1; i < table.rows.length; i++) {
    var tableRow = table.rows[i];
    var rowData = {};
    for (var j = 0; j < tableRow.cells.length; j++) {
      rowData[tableRow.cells[j].getAttribute("k")] =
        tableRow.cells[j].innerHTML;
    }
    data.push(rowData);
  }
  return data;
}
*/

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

/*
scope.addEventListener("contextmenu", (event) => {
  console.log("right click")
  event.preventDefault();

  const { offsetX: mouseX, offsetY: mouseY } = event;
  const { normalizedX, normalizedY } = normalizePosition(mouseX,mouseY);

  contextMenu.style.top = `${normalizedY}px`;
  contextMenu.style.left = `${normalizedX}px`;

  contextMenu.classList.remove("visible")

  setTimeout(() => {
    contextMenu.classList.add("visible");
  });
});

scope.addEventListener("click", (e) => {
  if (e.target.offsetParent != contextMenu) {
    contextMenu.classList.remove("visible");
}});
*/
scope.addEventListener("click", (e) => {
  if(contextMenu !== undefined)
    contextMenu.classList.remove("visible");
 
});
/* ---------------------------------- searchFor :: sort table view by column header ---------------------------------- */
async function searchFor() {
  let input = document.getElementById("searchKey").value;
  if (input != "") {
    let found = await findIds(input);
    //    found = defiant.search(snapshot, '//*[contains(' + selectedCol + ',"' + input + '")]/title');
    /*found = defiant.search(
      snapshot,
      '//*[contains(text(), "' + input + '")]/..'
    );*/

    //(log(found);
    //datatableFilter(found);
    if(found!== "undefined") datatableFilter(found);
    //datatable(main,found,dbKeys["artifacts"])
  } else {
    let tb = document.getElementById("tblBody").children;
    for (let i = 0; i < tb.length; i++) {
      tb[i].classList.remove("hide");
    }
  }
  /*if (input != "") {
    const { data, error } = await _supabase.from("artifacts").select("json").textSearch("json", input)
    console.log("searching for "+ input + " results "+ data)
  }*/
}

/* ---------------------------------- datatableFilter :: hide entries not responding to the filter ---------------------------------- */
function datatableFilter(found) {
  let tb = document.getElementById("tblBody").children;
  for (let i = 0; i < tb.length; i++) {
    tb[i].classList.add("hide");
  }
  found=JSON.parse(found)
  log(found[0]);
  for (const elem of found) {
    log("found this " + elem);
    document.getElementById("tr" + elem._id).classList.remove("hide");
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
function toggleShow(elem){
  document.getElementById(elem).classList.toggle('show');
}

/* ---------------------------------- log :: lazy console.log ---------------------------------- */
function log(val) {
  console.log(val);
}