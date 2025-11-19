/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "_clone_wA0H",
        "max": null,
        "min": null,
        "name": "puzzle_id",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json3632866850",
        "maxSize": 1,
        "name": "rating",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "number2245608546",
        "max": null,
        "min": null,
        "name": "count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_3700094976",
    "indexes": [],
    "listRule": null,
    "name": "average_ratings",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT (ROW_NUMBER() OVER()) as id, puzzle_id, AVG(rating) as rating, COUNT(rating) as count\nFROM \"ratings\"\nGROUP BY puzzle_id",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3700094976");

  return app.delete(collection);
})
