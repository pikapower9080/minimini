/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `crossword_id`,\n  `midi_id`\n)",
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number3949648367",
    "max": null,
    "min": null,
    "name": "midi_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json2599515954",
    "maxSize": 0,
    "name": "midi",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `crossword_id`\n)",
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("number3949648367")

  // remove field
  collection.fields.removeById("json2599515954")

  return app.save(collection)
})
