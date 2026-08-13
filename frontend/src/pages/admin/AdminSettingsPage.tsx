import React from "react";
import { LogOut, ShieldCheck, Globe, User } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/translations";
import { useToast } from "../../components/common/Toast";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { push } = useToast();

  function selectLanguage(code: typeof language) {
    setLanguage(code);
    push(t("settings.languageChanged"), "info");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("settings.subtitle")}</p>
      </div>

      {/* Admin details */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.adminDetails")}</h2>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-blue/15">
            <User className="h-8 w-8 text-accent-blue" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{user?.name ?? "—"}</p>
            <span className="mt-1 inline-block rounded-full bg-accent-blue/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-blue">
              {t("settings.administrator")}
            </span>
          </div>
        </div>

        <DetailRow label={t("settings.name")} value={user?.name ?? "—"} />
        <DetailRow label={t("settings.email")} value={user?.email ?? "—"} />
        <DetailRow label={t("settings.role")} value={t("settings.administrator")} />
        <DetailRow label={t("settings.userId")} value={user?.id ?? "—"} />
      </section>

      {/* Language */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
        <div className="mb-2 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent-cyan" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.language")}</h2>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t("settings.languageHint")}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.filter((l) => l.code !== "en").map(({ code, label, native }) => (
            <button
              key={code}
              type="button"
              onClick={() => selectLanguage(code)}
              className={clsx(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                language === code
                  ? "border-accent-cyan/50 bg-accent-cyan/10 ring-1 ring-accent-cyan/30"
                  : "border-[var(--border-subtle)] hover:border-accent-cyan/30 hover:bg-[var(--surface-muted)]"
              )}
            >
              <div>
                <p className="font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-sm text-[var(--text-muted)]">{native}</p>
              </div>
              {language === code && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-cyan" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => selectLanguage("en")}
          className={clsx(
            "mt-2 w-full rounded-xl border px-4 py-2.5 text-sm transition",
            language === "en"
              ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
              : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          )}
        >
          English {language === "en" && "✓"}
        </button>
      </section>

      {/* Logout */}
      <section className="rounded-xl border border-emergency-red/20 bg-emergency-red/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-emergency-red" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("settings.logout")}</h2>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{t("settings.logoutHint")}</p>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emergency-red px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 sm:w-auto sm:min-w-[160px]"
        >
          <LogOut className="h-4 w-4" />
          {t("settings.logout")}
        </button>
      </section>
    </div>
  );
}
