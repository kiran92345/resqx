export type AppLanguage = "en" | "te" | "ta" | "kn";

export const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

export type TranslationKey =
  | "settings.title"
  | "settings.subtitle"
  | "settings.adminDetails"
  | "settings.language"
  | "settings.languageHint"
  | "settings.logout"
  | "settings.logoutHint"
  | "settings.name"
  | "settings.email"
  | "settings.role"
  | "settings.userId"
  | "settings.administrator"
  | "settings.languageChanged";

const en: Record<TranslationKey, string> = {
  "settings.title": "Settings",
  "settings.subtitle": "Manage your admin account, language, and session.",
  "settings.adminDetails": "Admin Details",
  "settings.language": "Language",
  "settings.languageHint": "Interface language for alerts, labels, and voice emergency (where supported).",
  "settings.logout": "Log Out",
  "settings.logoutHint": "End your admin session on this device.",
  "settings.name": "Name",
  "settings.email": "Email",
  "settings.role": "Role",
  "settings.userId": "User ID",
  "settings.administrator": "Administrator",
  "settings.languageChanged": "Language updated",
};

const te: Record<TranslationKey, string> = {
  "settings.title": "సెట్టింగ్‌లు",
  "settings.subtitle": "మీ అడ్మిన్ ఖాతా, భాష మరియు సెషన్‌ను నిర్వహించండి.",
  "settings.adminDetails": "అడ్మిన్ వివరాలు",
  "settings.language": "భాష",
  "settings.languageHint": "అలర్ట్‌లు, లేబుల్‌లు మరియు వాయిస్ ఎమర్జెన్సీ కోసం ఇంటర్‌ఫేస్ భాష.",
  "settings.logout": "లాగ్ అవుట్",
  "settings.logoutHint": "ఈ పరికరంలో మీ అడ్మిన్ సెషన్‌ను ముగించండి.",
  "settings.name": "పేరు",
  "settings.email": "ఇమెయిల్",
  "settings.role": "పాత్ర",
  "settings.userId": "యూజర్ ID",
  "settings.administrator": "అడ్మినిస్ట్రేటర్",
  "settings.languageChanged": "భాష నవీకరించబడింది",
};

const ta: Record<TranslationKey, string> = {
  "settings.title": "அமைப்புகள்",
  "settings.subtitle": "உங்கள் நிர்வாக கணக்கு, மொழி மற்றும் அமர்வை நிர்வகிக்கவும்.",
  "settings.adminDetails": "நிர்வாக விவரங்கள்",
  "settings.language": "மொழி",
  "settings.languageHint": "எச்சரிக்கைகள், லேபிள்கள் மற்றும் குரல் அவசரநிலைக்கான இடைமுக மொழி.",
  "settings.logout": "வெளியேறு",
  "settings.logoutHint": "இந்த சாதனத்தில் உங்கள் நிர்வாக அமர்வை முடிக்கவும்.",
  "settings.name": "பெயர்",
  "settings.email": "மின்னஞ்சல்",
  "settings.role": "பங்கு",
  "settings.userId": "பயனர் ID",
  "settings.administrator": "நிர்வாகி",
  "settings.languageChanged": "மொழி புதுப்பிக்கப்பட்டது",
};

const kn: Record<TranslationKey, string> = {
  "settings.title": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
  "settings.subtitle": "ನಿಮ್ಮ ನಿರ್ವಾಹಕ ಖಾತೆ, ಭಾಷೆ ಮತ್ತು ಸೆಷನ್ ಅನ್ನು ನಿರ್ವಹಿಸಿ.",
  "settings.adminDetails": "ನಿರ್ವಾಹಕ ವಿವರಗಳು",
  "settings.language": "ಭಾಷೆ",
  "settings.languageHint": "ಎಚ್ಚರಿಕೆಗಳು, ಲೇಬಲ್‌ಗಳು ಮತ್ತು ಧ್ವನಿ ತುರ್ತುಸ್ಥಿತಿಗಾಗಿ ಇಂಟರ್ಫೇಸ್ ಭಾಷೆ.",
  "settings.logout": "ಲಾಗ್ ಔಟ್",
  "settings.logoutHint": "ಈ ಸಾಧನದಲ್ಲಿ ನಿಮ್ಮ ನಿರ್ವಾಹಕ ಸೆಷನ್ ಅನ್ನು ಕೊನೆಗೊಳಿಸಿ.",
  "settings.name": "ಹೆಸರು",
  "settings.email": "ಇಮೇಲ್",
  "settings.role": "역할",
  "settings.userId": "ಬಳಕೆದಾರ ID",
  "settings.administrator": "ನಿರ್ವಾಹಕ",
  "settings.languageChanged": "ಭಾಷೆ ನವೀಕರಿಸಲಾಗಿದೆ",
};

// Fix kn role - I accidentally used Korean character
kn["settings.role"] = "ಪಾತ್ರ";

const MAP: Record<AppLanguage, Record<TranslationKey, string>> = { en, te, ta, kn };

export function t(lang: AppLanguage, key: TranslationKey): string {
  return MAP[lang][key] ?? en[key];
}
