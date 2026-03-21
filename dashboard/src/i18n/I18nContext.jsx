import { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

const messages = { en, ko };
const SUPPORTED_LANGS = ["en", "ko"];
const STORAGE_KEY = "app-lang";

function detectLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch { /* private browsing or storage disabled */ }
  const nav = navigator.language || "";
  if (nav.startsWith("ko")) return "ko";
  return "en";
}

function translate(lang, key, vars) {
  let msg = messages[lang]?.[key] ?? messages.en?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replaceAll(`{${k}}`, v ?? "");
    }
  }
  return msg;
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((l) => {
    if (!SUPPORTED_LANGS.includes(l)) return;
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
