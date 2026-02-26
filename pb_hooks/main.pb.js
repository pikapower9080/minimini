/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/today/mini", (e) => {
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", getTodayDateString());
    return e.json(200, record.get("mini"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/daily", (e) => {
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", getTodayDateString());
    return e.json(200, record.get("daily"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/midi", (e) => {
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", getTodayDateString());
    return e.json(200, record.get("midi"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
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
