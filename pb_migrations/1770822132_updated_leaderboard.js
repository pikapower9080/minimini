/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool729547810",
    "name": "hardcore",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // remove field
  collection.fields.removeById("bool729547810")

  return app.save(collection)
})
