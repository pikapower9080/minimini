/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/today", (e) => {
  function getTodayDateString() {
    const today = new Date();
    const estToday = new Date(today.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const year = estToday.getFullYear();
    const month = String(estToday.getMonth() + 1).padStart(2, "0");
    const day = String(estToday.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    const record = $app.findFirstRecordByData("archive", "publicationDate", getTodayDateString());
    return e.json(200, record.get("mini"));
  } catch (err) {
    try {
      const res = $http.send({
        url: "https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json",
        method: "GET",
        body: "",
        headers: {},
        timeout: 120
      });

      const data = res.json;
      return e.json(200, data);
    } catch (err) {
      console.error(err);
      return e.json(500, { error: "Failed to fetch data" });
    }
  }
});

routerAdd("GET", "/api/friends/from_code/{code}", (e) => {
  const friendCode = e.request.pathValue("code");

  try {
    const record = $app.findFirstRecordByData("users", "friend_code", friendCode);
    if (!record) {
      return e.json(404, { error: "Invalid friend code" });
    }

    return e.json(200, { id: record.id, username: record.get("username") });
  } catch (err) {
    return e.json(404, { error: "Invalid friend code" });
  }
});

cronAdd("archive", "0 4 * * *", () => {
  try {
    const res = $http.send({
      url: "https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json",
      method: "GET",
      body: "",
      headers: {},
      timeout: 120
    });

    const data = res.json;

    try {
      const record = $app.findFirstRecordByData("archive", "puzzleId", data.id);
    } catch (err) {
      const collection = $app.findCollectionByNameOrId("archive");
      const record = new Record(collection);

      record.set("puzzleId", data.id);
      record.set("publicationDate", data.publicationDate);
      record.set("mini", data);

      $app.save(record);
    }
  } catch (err) {
    console.error(err);
  }
});
