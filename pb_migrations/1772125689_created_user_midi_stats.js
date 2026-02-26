/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json2764861455",
        "maxSize": 1,
        "name": "lowest_time",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3505419716",
        "maxSize": 1,
        "name": "lowest_time_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json2335800428",
        "maxSize": 1,
        "name": "highest_time",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json4211296525",
        "maxSize": 1,
        "name": "highest_time_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "number1210460338",
        "max": null,
        "min": null,
        "name": "num_completed",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json3386116411",
        "maxSize": 1,
        "name": "average_time",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3581119660",
        "maxSize": 1,
        "name": "num_cheated",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3428982605",
        "maxSize": 1,
        "name": "num_desktop",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3839089593",
    "indexes": [],
    "listRule": null,
    "name": "user_midi_stats",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  leaderboard.user AS id,\n\n  MIN(leaderboard.time) AS lowest_time,\n  (\n    SELECT l2.puzzle_id\n    FROM leaderboard l2\n    WHERE l2.user = leaderboard.user\n      AND l2.type = \"mini\"\n    ORDER BY l2.time ASC\n    LIMIT 1\n  ) AS lowest_time_id,\n\n  MAX(leaderboard.time) AS highest_time,\n  (\n    SELECT l3.puzzle_id\n    FROM leaderboard l3\n    WHERE l3.user = leaderboard.user\n      AND l3.type = \"midi\"\n    ORDER BY l3.time DESC\n    LIMIT 1\n  ) AS highest_time_id,\n\n  COUNT(leaderboard.id) AS num_completed,\n  AVG(leaderboard.time) AS average_time,\n\n  SUM(CASE WHEN leaderboard.cheated = TRUE THEN 1 ELSE 0 END) AS num_cheated,\n  SUM(CASE WHEN leaderboard.platform = \"desktop\" THEN 1 ELSE 0 END) AS num_desktop\n\nFROM leaderboard\nWHERE leaderboard.type = \"midi\" AND leaderboard.platform IS NOT NULL\nGROUP BY leaderboard.user;",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3839089593");

  return app.delete(collection);
})
