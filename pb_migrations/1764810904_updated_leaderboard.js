/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select961728715",
    "maxSelect": 1,
    "name": "platform",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mobile",
      "desktop"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // remove field
  collection.fields.removeById("select961728715")

  return app.save(collection)
})
