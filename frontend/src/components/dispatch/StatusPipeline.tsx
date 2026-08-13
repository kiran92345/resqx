import React from "react";
import { Check } from "lucide-react";
import type { RequestStatus } from "../../types";

const STAGES: RequestStatus[] = [
  "submitted",
  "in_review",
  "dispatched",
  "in_transit",
  "delivered",
  "resolved",
];

const LABELS: Record<RequestStatus, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  resolved: "Resolved",
};

export function StatusPipeline({
  current,
  etaMinutes,
}: {
  current: RequestStatus;
  etaMinutes?: number | null;
}) {
  const currentIdx = STAGES.indexOf(current);

  return (
    <div>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const done = i <= currentIdx;
          const isLast = i === STAGES.length - 1;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs ${
                    done
                      ? "border-emergency-emerald bg-emergency-emerald/20 text-emergency-emerald"
                      : "border-slate-700 text-slate-600"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={`mt-1 w-16 text-center text-[10px] ${
                    done ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {LABELS[stage]}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    i < currentIdx ? "bg-emergency-emerald" : "bg-slate-800"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {etaMinutes != null && current !== "resolved" && current !== "delivered" && (
        <p className="mt-3 text-center text-sm text-slate-400">
          Estimated arrival:{" "}
          <span className="font-semibold text-slate-100">{etaMinutes} min</span>
        </p>
      )}
    </div>
  );
}
