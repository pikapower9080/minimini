/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `crossword_id`,\n  `publication_date`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_PNMij208X4` ON `archive` (`mini`)",
      "CREATE UNIQUE INDEX `idx_9gHqcjR4BY` ON `archive` (`publication_date`)"
    ]
  }, collection)

  return app.save(collection)
})
