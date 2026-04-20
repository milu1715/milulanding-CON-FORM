"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeneratedStrategy } from "@/types/strategy";
import {
  getAllStrategies,
  saveStrategy as saveToDb,
  deleteStrategy as deleteFromDB,
} from "@/lib/storage/strategies";

export function useStrategies() {
  const [strategies, setStrategies] = useState<GeneratedStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllStrategies();
      setStrategies(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveStrategy = useCallback(async (strategy: GeneratedStrategy) => {
    await saveToDb(strategy);
    setStrategies((prev) => [strategy, ...prev.filter((s) => s.id !== strategy.id)]);
  }, []);

  const deleteStrategy = useCallback(async (id: string) => {
    await deleteFromDB(id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { strategies, isLoading, refresh, saveStrategy, deleteStrategy };
}
