import PocketBase from "pocketbase";
import puppeteer from "puppeteer";

import type { MiniCrossword } from "../src/lib/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HOST = "https://nytimes.com";

const MAIN_PAGE = `${HOST}/crosswords/game/mini`;
const MINI_URL = `${HOST}/svc/crosswords/v6/puzzle/mini.json`;
const DAILY_URL = `${HOST}/svc/crosswords/v6/puzzle/daily.json`;
const MIDI_URL = `${HOST}/svc/crosswords/v6/puzzle/midi.json`;

const REQUIRED_VARS = ["VITE_POCKETBASE_URL", "PB_SUPERUSER_EMAIL", "PB_SUPERUSER_PASSWORD"];
for (const variable of REQUIRED_VARS) {
  if (!process.env[variable]) {
    console.error(`Error: Missing required environment variable ${variable}`);
    process.exit(1);
  }
}

console.log("Logging into PocketBase...");
const pb = new PocketBase(process.env.VITE_POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(process.env.PB_SUPERUSER_EMAIL as string, process.env.PB_SUPERUSER_PASSWORD as string);
const archive = pb.collection("archive");

console.log("Launching browser...");
const browser = await puppeteer.launch({
  headless: true,
  userDataDir: "./bot/puppeteer-data",
  browser: "firefox"
});
const page = await browser.newPage();

await page.goto(MAIN_PAGE);
await page.setViewport({ width: 1080, height: 720 });

console.log("Loaded. Sleeping...");
await sleep(3000);

console.log("Fetching mini data...");
await page.goto(MINI_URL);
const miniData: MiniCrossword = JSON.parse(await page.evaluate(() => document.querySelector("pre")?.innerText ?? "{}"));

if (!miniData || !miniData.body) {
  console.error(miniData);
  await browser.close();
  process.exit(1);
}
miniData.body[0].SVG = {};

console.log("Fetching daily data...");
await page.goto(DAILY_URL);
const dailyData: MiniCrossword = JSON.parse(await page.evaluate(() => document.querySelector("pre")?.innerText ?? "{}"));
dailyData.body[0].SVG = {};

console.log("Fetching midi data...");
await page.goto(MIDI_URL);
const midiData: MiniCrossword = JSON.parse(await page.evaluate(() => document.querySelector("pre")?.innerText ?? "{}"));
midiData.body[0].SVG = {};

let pdf: File | "" = "";
try {
  console.log("Fetching daily printout...");
  const viewSource = await page.goto(`${HOST}/svc/crosswords/v2/puzzle/${dailyData.id}.pdf`);
  const pdfBuffer = await viewSource?.buffer();
  pdf = new File([pdfBuffer as BlobPart], `${dailyData.id}.printout.pdf`, { type: "application/pdf" });
} catch (err) {
  console.error(err);
  console.warn("Failed to fetch daily printout.");
}

console.log("Creating archive record...");

const data = {
  publication_date: miniData.publicationDate,
  mini_id: miniData.id,
  mini: miniData,
  daily_id: dailyData.id,
  daily: dailyData,
  midi_id: midiData.id,
  midi: midiData,
  media: [pdf]
};

const oldRecord = await archive.getFirstListItem(`publication_date="${miniData.publicationDate}"`).catch(() => null);
if (oldRecord) {
  console.log("Updating older record...");
  await archive.update(oldRecord.id, data);
} else {
  await archive.create(data);
}

await browser.close();
console.log(miniData.publicationDate);
