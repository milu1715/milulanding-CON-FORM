"use client";

import { useEffect, useState } from "react";
import { Key, Eye, EyeOff, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { getStoredApiKey, saveApiKey, isElectron } from "@/lib/api-client";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredApiKey().then((key) => {
      if (key) { setHasSavedKey(true); setApiKey(key); }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    await saveApiKey(apiKey.trim());
    setHasSavedKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = async () => {
    if (!isElectron()) return;
    await window.electronAPI!.deleteApiKey();
    setApiKey("");
    setHasSavedKey(false);
  };

  if (loading) return null;

  return (
    <div className="max-w-xl space-y-8">
      {/* API Key */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[var(--primary)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Chiave API Anthropic
          </h2>
        </div>

        {!isElectron() && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
            In modalità web la chiave API è configurata nel file <code className="font-mono">.env.local</code> sul server.
            Questa pagina è rilevante solo nell&apos;app desktop.
          </div>
        )}

        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          {hasSavedKey && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Chiave API configurata e salvata
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--muted-foreground)]">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Trovi la tua chiave su{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--primary)] inline-flex items-center gap-1 hover:underline"
              >
                console.anthropic.com <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || !isElectron()}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Salvata!</>
              ) : (
                "Salva Chiave"
              )}
            </button>
            {hasSavedKey && isElectron() && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </section>

      {/* App info */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Informazioni
        </h2>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] space-y-1">
          <p>MiLù Ads Console v1.0.0</p>
          <p>Modello AI: Claude Opus 4.7</p>
          <p>I dati sono salvati localmente nel browser (IndexedDB)</p>
          {isElectron() && <p>La chiave API è salvata in modo sicuro nell&apos;app</p>}
        </div>
      </section>
    </div>
  );
}
