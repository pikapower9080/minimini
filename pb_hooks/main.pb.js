/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/ratings/{id}", (e) => {
  let id = e.request.pathValue("id");

  const result = arrayOf(
    new DynamicModel({
      rating: -0,
      cnt: 0
    })
  );

  $app.db().newQuery("SELECT COALESCE(AVG(rating), 0) rating, COUNT(*) cnt FROM ratings WHERE puzzle_id = {:id}").bind({ id }).all(result);

  return e.json(200, { average: result[0]?.rating ?? -1, count: result[0]?.cnt ?? 0 });
});

routerAdd("GET", "/api/today", (e) => {
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
