import type { RequestStatus } from "../types";

export interface PipelineStep {
  id: string;
  label: string;
  status: RequestStatus;
}

/** RESQ-X emergency lifecycle mapped to backend statuses */
export const EMERGENCY_PIPELINE: PipelineStep[] = [
  { id: "alert", label: "Alert Created", status: "submitted" },
  { id: "ai", label: "AI Analyzing", status: "submitted" },
  { id: "verified", label: "Verified", status: "in_review" },
  { id: "assigned", label: "Resource Assigned", status: "dispatched" },
  { id: "accepted", label: "Responder Accepted", status: "dispatched" },
  { id: "enroute", label: "On the Way", status: "in_transit" },
  { id: "arriving", label: "Arriving", status: "in_transit" },
  { id: "resolved", label: "Resolved", status: "resolved" },
];

const STATUS_INDEX: Record<RequestStatus, number> = {
  submitted: 1,
  in_review: 3,
  dispatched: 5,
  in_transit: 6,
  delivered: 7,
  resolved: 8,
};

export function pipelineIndex(status: RequestStatus): number {
  return STATUS_INDEX[status] ?? 0;
}

export function pipelineProgress(status: RequestStatus): number {
  return Math.round((pipelineIndex(status) / (EMERGENCY_PIPELINE.length - 1)) * 100);
}

export function needsVerification(anomalyFlags: string[]): boolean {
  return anomalyFlags.some((f) =>
    f.includes("duplicate") || f.includes("suspicious") || f.includes("verification")
  );
}
