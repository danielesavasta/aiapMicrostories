const settings = {
    editing: true,
    editProp: false,
    addImages: false,
    collection1: "objects",
    collection2: "entities",
    imageField: "6",
    verbose: true
};

const dbKeys = {
    objects: [
        {"id": "_id", "name": "id", "type": "id", "display": true, "editable": false},
        {"id": "0", "name": "id_address", "type": "link", "display": true, "editable": false},
        {"id": "1", "name": "title", "type": "text", "display": true, "editable": false},
        {"id": "2", "name": "subtitle", "type": "text", "display": true, "editable": false},
        {"id": "3", "name": "description_1", "type": "text", "display": true, "editable": false},
        {"id": "4", "name": "description_2", "type": "text", "display": true, "editable": false},
        {"id": "14", "name": "designer", "type": "text", "display": true, "editable": true},
        {"id": "5", "name": "source", "type": "tags", "display": true, "editable": false},
        {"id": "6", "name": "images", "type": "images", "display": false, "editable": false},
        {"id": "7", "name": "codice aiap", "type": "unique", "display": true, "editable": false},
        {"id": "8", "name": "format", "type": "text", "display": true, "editable": false},
        {"id": "10", "name": "place", "type": "text", "display": true, "editable": false},
        {"id": "11", "name": "year", "type": "date", "display": true, "editable": false},
        {"id": "12", "name": "notes", "type": "text", "display": true, "editable": true},
        {"id": "13", "name": "group", "type": "text", "display": true, "editable": true}],
        
    entities: [
        {"id": "0", "name": "name", "type": "text", "display": true},
        {"id": "1", "name": "birth", "type": "date", "display": true},
        {"id": "2", "name": "death", "type": "date", "display": true},
        {"id": "3", "name": "biography", "type": "text", "display": true}
    ]  
};

async function start() {
    await loadDB();
    loadInterface()
}

start();

