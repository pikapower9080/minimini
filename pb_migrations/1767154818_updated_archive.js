/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_PNMij208X4` ON `archive` (`mini`)",
      "CREATE UNIQUE INDEX `idx_9gHqcjR4BY` ON `archive` (`publicationDate`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number980514753",
    "max": null,
    "min": null,
    "name": "miniId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_PNMij208X4` ON `archive` (`puzzleId`)",
      "CREATE UNIQUE INDEX `idx_9gHqcjR4BY` ON `archive` (`publicationDate`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number980514753",
    "max": null,
    "min": null,
    "name": "puzzleId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
