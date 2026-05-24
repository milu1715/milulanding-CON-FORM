"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { DecisionEntry } from "@/types/decisions";
import {
  getAllDecisions,
  saveDecision,
  updateDecision as updateInDB,
  deleteDecision as deleteFromDB,
} from "@/lib/storage/decisions";

export function useDecisions() {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllDecisions();
      setDecisions(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDecision = useCallback(
    async (entry: Omit<DecisionEntry, "id" | "createdAt">) => {
      const decision: DecisionEntry = {
        ...entry,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      await saveDecision(decision);
      setDecisions((prev) => [decision, ...prev]);
    },
    []
  );

  const updateDecision = useCallback(async (id: string, patch: Partial<DecisionEntry>) => {
    await updateInDB(id, patch);
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }, []);

  const deleteDecision = useCallback(async (id: string) => {
    await deleteFromDB(id);
    setDecisions((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { decisions, isLoading, refresh, addDecision, updateDecision, deleteDecision };
}
