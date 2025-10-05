import localforage from "localforage";

export function configureStorage() {
	localforage.config({
		driver: localforage.INDEXEDDB,
		name: "minimini",
		version: 1.0,
		storeName: "minimini_store"
	})
}