import React, { useState } from "react";
import { Sparkles, ChevronRight, Droplets, HeartPulse, Users, Flame } from "lucide-react";
import { MOCK_AI_RECOMMENDATIONS } from "../../data/mockDashboard";
import { useToast } from "../common/Toast";
import { DashboardPanel } from "./DashboardPanel";
import clsx from "clsx";

const ICONS = { flood: Droplets, medical: HeartPulse, rescue: Users, fire: Flame };
const COLORS = {
  blue: "text-accent-blue bg-accent-blue/12 border-accent-blue/20",
  green: "text-emergency-emerald bg-emergency-emerald/12 border-emergency-emerald/20",
  orange: "text-emergency-amber bg-emergency-amber/12 border-emergency-amber/20",
  red: "text-emergency-red bg-emergency-red/12 border-emergency-red/20",
};

export function AIRecommendations() {
  const { push } = useToast();
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? MOCK_AI_RECOMMENDATIONS : MOCK_AI_RECOMMENDATIONS.slice(0, 3);

  return (
    <DashboardPanel
      icon={Sparkles}
      iconTheme="cyan"
      title="AI Recommendations"
      subtitle="Suggested dispatch actions"
      action={
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-medium text-accent-blue hover:underline"
        >
          {expanded ? "Show Less" : "View All"}
        </button>
      }
      bodyClassName="overflow-y-auto"
    >
      <div className="space-y-2">
        {items.map((rec) => {
          const Icon = ICONS[rec.icon as keyof typeof ICONS] ?? Sparkles;
          return (
            <button
              key={rec.id}
              onClick={() => push(`Action queued: ${rec.text.split("—")[0].trim()}`, "info")}
              className="dashboard-list-item group flex items-start gap-3"
            >
              <div
                className={clsx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  COLORS[rec.color as keyof typeof COLORS]
                )}
              >
                <Icon className="h-[20px] w-[20px]" strokeWidth={2} />
              </div>
              <p className="flex-1 text-xs leading-relaxed text-[var(--text-secondary)]">{rec.text}</p>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-faint)] transition group-hover:text-accent-blue" />
            </button>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
