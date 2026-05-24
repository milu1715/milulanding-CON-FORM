import { getDB } from "./db";
import type { DecisionEntry } from "@/types/decisions";

export async function saveDecision(decision: DecisionEntry): Promise<void> {
  const db = await getDB();
  await db.put("decisions", decision);
}

export async function getAllDecisions(): Promise<DecisionEntry[]> {
  const db = await getDB();
  const decisions = await db.getAllFromIndex("decisions", "createdAt");
  return decisions.reverse();
}

export async function getDecision(id: string): Promise<DecisionEntry | undefined> {
  const db = await getDB();
  return db.get("decisions", id);
}

export async function updateDecision(id: string, patch: Partial<DecisionEntry>): Promise<void> {
  const db = await getDB();
  const existing = await db.get("decisions", id);
  if (!existing) return;
  await db.put("decisions", { ...existing, ...patch });
}

export async function deleteDecision(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("decisions", id);
}
