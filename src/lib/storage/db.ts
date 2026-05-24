import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "amazon-ads-console";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const reports = db.createObjectStore("reports", { keyPath: "id" });
        reports.createIndex("uploadedAt", "uploadedAt");
        reports.createIndex("reportType", "reportType");

        const strategies = db.createObjectStore("strategies", { keyPath: "id" });
        strategies.createIndex("createdAt", "createdAt");
        strategies.createIndex("reportId", "reportId");

        const decisions = db.createObjectStore("decisions", { keyPath: "id" });
        decisions.createIndex("createdAt", "createdAt");
        decisions.createIndex("status", "status");
      },
    });
  }
  return dbPromise;
}
