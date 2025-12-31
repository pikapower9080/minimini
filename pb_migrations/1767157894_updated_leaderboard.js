/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_B9A6tmQ0hP` ON `leaderboard` (\n  `user`,\n  `puzzle_id`,\n  `type`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3906957607")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_B9A6tmQ0hP` ON `leaderboard` (\n  `user`,\n  `puzzle_id`\n)"
    ]
  }, collection)

  return app.save(collection)
})
