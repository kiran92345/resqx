import React from "react";
import { GlassCard } from "../../components/common/GlassCard";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-8">
      <GlassCard className="max-w-md p-8 text-center">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{description ?? "This section is available from the sidebar navigation."}</p>
      </GlassCard>
    </div>
  );
}
