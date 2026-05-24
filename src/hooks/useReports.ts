"use client";

import { useState, useEffect, useCallback } from "react";
import type { ParsedReport } from "@/types/reports";
import { getAllReports, deleteReport as deleteFromDB } from "@/lib/storage/reports";

export function useReports() {
  const [reports, setReports] = useState<ParsedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      console.error("Errore nel caricamento dei report:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const latestReport = reports[0];

  const deleteReport = useCallback(async (id: string) => {
    await deleteFromDB(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reports, latestReport, isLoading, refresh, deleteReport };
}
