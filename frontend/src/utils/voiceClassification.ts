import type { EmergencyCategoryId } from "../data/mockDashboard";

/** Keyword-based emergency classification from voice transcript. */
export function classifyEmergencyFromVoice(text: string): EmergencyCategoryId {
  const t = text.toLowerCase();

  if (/fire|आग|अग्नि|మంట|inferno|smoke|burning/.test(t)) return "fire";
  if (/medical|ambulance|heart|chest|collapsed|unconscious|doctor|hospital|चिकित्स|एम्बुलेंस|వైద్య|ఆంబులెన్స/.test(t)) return "medical";
  if (/flood|water|drowning|tsunami|बाढ़|पानी|వరద|నీరు/.test(t)) return "flood";
  if (/crime|robbery|theft|attack|assault|police|chor|डकै|దొంగ/.test(t)) return "crime";
  if (/accident|crash|collision|car|vehicle|bike|truck|अपघात|दुर्घटना|ప్రమాద|కారు/.test(t)) return "accident";

  return "other";
}

export const VOICE_LANGUAGES = [
  { id: "en-IN", label: "English" },
  { id: "hi-IN", label: "Hindi" },
  { id: "te-IN", label: "Telugu" },
  { id: "ta-IN", label: "Tamil" },
  { id: "kn-IN", label: "Kannada" },
] as const;

export type VoiceLanguageId = (typeof VOICE_LANGUAGES)[number]["id"];
