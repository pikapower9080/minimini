/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2253883328")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT (ROW_NUMBER() OVER()) as id, leaderboard.puzzle_id as puzzle_id, MIN(leaderboard.time) as lowest_time, MAX(leaderboard.time) as highest_time, COUNT(leaderboard.id) as completions, AVG(leaderboard.time) as average_time\nFROM \"leaderboard\"\nGROUP BY leaderboard.puzzle_id\n"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_NjLJ")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "_clone_gQLD",
    "max": null,
    "min": null,
    "name": "puzzle_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2253883328")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT (ROW_NUMBER() OVER()) as id, MAX(leaderboard.time) as highest_time, MIN(leaderboard.time) as lowest_time, leaderboard.puzzle_id as puzzle_id, COUNT(leaderboard.id) as completions, AVG(leaderboard.time) as average_time\nFROM \"leaderboard\"\nGROUP BY leaderboard.puzzle_id\n"
  }, collection)

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_NjLJ",
    "max": null,
    "min": null,
    "name": "puzzle_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("_clone_gQLD")

  return app.save(collection)
})
