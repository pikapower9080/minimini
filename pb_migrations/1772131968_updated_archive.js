/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`\n)",
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3292627395",
    "max": null,
    "min": null,
    "name": "daily_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3239922771",
    "maxSize": 0,
    "name": "daily",
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
      "CREATE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `crossword_id`,\n  `midi_id`\n)",
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3292627395",
    "max": null,
    "min": null,
    "name": "crossword_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3239922771",
    "maxSize": 0,
    "name": "crossword",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
