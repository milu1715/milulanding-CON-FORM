import { getDB } from "./db";
import type { ParsedReport } from "@/types/reports";

export async function saveReport(report: ParsedReport): Promise<void> {
  const db = await getDB();
  await db.put("reports", report);
}

export async function getAllReports(): Promise<ParsedReport[]> {
  const db = await getDB();
  const reports = await db.getAllFromIndex("reports", "uploadedAt");
  return reports.reverse();
}

export async function getReport(id: string): Promise<ParsedReport | undefined> {
  const db = await getDB();
  return db.get("reports", id);
}

export async function getLatestReport(): Promise<ParsedReport | undefined> {
  const reports = await getAllReports();
  return reports[0];
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("reports", id);
}
