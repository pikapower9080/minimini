/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.friends ?~ id || @request.auth.id = id",
    "viewRule": "@request.auth.friends ?~ id || @request.auth.id = id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ id || @request.auth.id = id)",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
