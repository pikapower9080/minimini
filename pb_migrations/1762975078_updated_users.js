/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "[0-9]{6}",
    "hidden": false,
    "id": "text3983535224",
    "max": 6,
    "min": 6,
    "name": "friend_code",
    "pattern": "[0-9]{6}",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("text3983535224")

  return app.save(collection)
})
