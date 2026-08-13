import React, { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  tone: "warning" | "info";
}

const ToastContext = createContext<{
  push: (message: string, tone?: "warning" | "info") => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: "warning" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-lg border p-3 shadow-lg backdrop-blur ${
              t.tone === "warning"
                ? "border-amber-500/40 bg-amber-950/80 text-amber-200"
                : "border-slate-700 bg-slate-900/90 text-slate-200"
            }`}
          >
            {t.tone === "warning" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="text-sm">{t.message}</span>
            <button
              className="ml-auto text-slate-500 hover:text-slate-200"
              onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
