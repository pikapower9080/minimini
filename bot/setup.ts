import puppeteer from "puppeteer";

const HOST = "https://nytimes.com";

const MAIN_PAGE = `${HOST}/crosswords/game/mini`;

console.log("Launching browser...");
const browser = await puppeteer.launch({
  headless: false,
  userDataDir: "./bot/puppeteer-data",
  browser: "firefox"
});
const page = await browser.newPage();

await page.goto(MAIN_PAGE);
await page.setViewport({ width: 1080, height: 720 });

console.log("Please sign into the New York Times, then close the browser.");
