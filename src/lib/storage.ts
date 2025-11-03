import localforage from "localforage";
import ALDER32 from "adler-32";
import type { AuthRecord } from "pocketbase";
import type { MiniCrossword } from "./types";

export function configureStorage() {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: "minimini",
    version: 1.0,
    storeName: "minimini_store"
  });

  if (import.meta.env.DEV) {
    // @ts-ignore
    window.localforage = localforage;
  }
}

export function generateStateDocId(user: AuthRecord, data: MiniCrossword) {
  if (!user || !data) return "";
  return ALDER32.str(`${user.id}_${data.id}`).toString().padEnd(15, "0");
}
