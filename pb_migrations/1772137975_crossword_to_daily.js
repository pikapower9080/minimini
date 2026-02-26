/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const leaderboard = app.findCollectionByNameOrId("leaderboard");
  
  const oldLbRecords = app.findRecordsByFilter("leaderboard", "type=\"crossword\" || type=NULL", "-created", -1, 0);
  for (record of oldLbRecords) {
    if (record.get("type") === "crossword") {
      record.set("type", "daily")
    } else {
      record.set("type", "mini");
    }
    app.save(record);
  }
}, (app) => {
  // add down queries...
})
