/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3308775492")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ user.id || @request.auth.id = user.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3308775492")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && @request.auth.friends ?= user.id"
  }, collection)

  return app.save(collection)
})
