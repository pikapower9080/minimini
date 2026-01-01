/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file1781309708",
    "maxSelect": 99,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "media",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // remove field
  collection.fields.removeById("file1781309708")

  return app.save(collection)
})
