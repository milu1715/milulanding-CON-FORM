import { getDB } from "./db";
import type { GeneratedStrategy } from "@/types/strategy";

export async function saveStrategy(strategy: GeneratedStrategy): Promise<void> {
  const db = await getDB();
  await db.put("strategies", strategy);
}

export async function getAllStrategies(): Promise<GeneratedStrategy[]> {
  const db = await getDB();
  const strategies = await db.getAllFromIndex("strategies", "createdAt");
  return strategies.reverse();
}

export async function getStrategy(id: string): Promise<GeneratedStrategy | undefined> {
  const db = await getDB();
  return db.get("strategies", id);
}

export async function getStrategiesForReport(reportId: string): Promise<GeneratedStrategy[]> {
  const db = await getDB();
  return db.getAllFromIndex("strategies", "reportId", reportId);
}

export async function deleteStrategy(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("strategies", id);
}
