/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_606782896")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  leaderboard.user AS id,\n\n  MIN(leaderboard.time) AS lowest_time,\n  (\n    SELECT l2.puzzle_id\n    FROM leaderboard l2\n    WHERE l2.user = leaderboard.user\n      AND l2.type = \"daily\"\n    ORDER BY l2.time ASC\n    LIMIT 1\n  ) AS lowest_time_id,\n\n  MAX(leaderboard.time) AS highest_time,\n  (\n    SELECT l3.puzzle_id\n    FROM leaderboard l3\n    WHERE l3.user = leaderboard.user\n      AND l3.type = \"daily\"\n    ORDER BY l3.time DESC\n    LIMIT 1\n  ) AS highest_time_id,\n\n  COUNT(leaderboard.id) AS num_completed,\n  AVG(leaderboard.time) AS average_time,\n\n  SUM(CASE WHEN leaderboard.cheated = TRUE THEN 1 ELSE 0 END) AS num_cheated,\n  SUM(CASE WHEN leaderboard.platform = \"desktop\" THEN 1 ELSE 0 END) AS num_desktop\n\nFROM leaderboard\nWHERE leaderboard.type = \"daily\" AND leaderboard.platform IS NOT NULL\nGROUP BY leaderboard.user;"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_606782896")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  leaderboard.user AS id,\n\n  MIN(leaderboard.time) AS lowest_time,\n  (\n    SELECT l2.puzzle_id\n    FROM leaderboard l2\n    WHERE l2.user = leaderboard.user\n      AND l2.type = \"mini\"\n    ORDER BY l2.time ASC\n    LIMIT 1\n  ) AS lowest_time_id,\n\n  MAX(leaderboard.time) AS highest_time,\n  (\n    SELECT l3.puzzle_id\n    FROM leaderboard l3\n    WHERE l3.user = leaderboard.user\n      AND l3.type = \"mini\"\n    ORDER BY l3.time DESC\n    LIMIT 1\n  ) AS highest_time_id,\n\n  COUNT(leaderboard.id) AS num_completed,\n  AVG(leaderboard.time) AS average_time,\n\n  SUM(CASE WHEN leaderboard.cheated = TRUE THEN 1 ELSE 0 END) AS num_cheated,\n  SUM(CASE WHEN leaderboard.platform = \"desktop\" THEN 1 ELSE 0 END) AS num_desktop\n\nFROM leaderboard\nWHERE leaderboard.type = \"daily\" AND leaderboard.platform IS NOT NULL\nGROUP BY leaderboard.user;"
  }, collection)

  return app.save(collection)
})
