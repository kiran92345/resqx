import React from "react";
import { LogOut, User, Globe } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/translations";
import { useToast } from "../../components/common/Toast";
import { UserPageHeader } from "../../components/user/UserPageHeader";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export function UserSettingsPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { push } = useToast();

  function selectLanguage(code: typeof language) {
    setLanguage(code);
    push("Language updated", "info");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <UserPageHeader title="Settings" subtitle="Your account, language, and session." />

      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-accent-cyan" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Account Details</h2>
        </div>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-cyan/15 text-xl font-bold text-accent-cyan">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{user?.name}</p>
            <span className="mt-1 inline-block rounded-full bg-emergency-emerald/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emergency-emerald">
              User / Reporter
            </span>
          </div>
        </div>
        <DetailRow label="Name" value={user?.name ?? "—"} />
        <DetailRow label="Email" value={user?.email ?? "—"} />
        <DetailRow label="Role" value="Emergency Reporter" />
      </section>

      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
        <div className="mb-2 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent-cyan" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Language</h2>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">Telugu, Tamil, Kannada, or English.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map(({ code, label, native }) => (
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
              {language === code && <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan" />}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-emergency-red/20 bg-emergency-red/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-emergency-red" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Log Out</h2>
        </div>
        <p className="mb-4 text-sm text-[var(--text-muted)]">Sign out of the user portal on this device.</p>
        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 rounded-xl bg-emergency-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </section>
    </div>
  );
}
