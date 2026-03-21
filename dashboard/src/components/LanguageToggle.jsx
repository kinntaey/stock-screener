import { useI18n } from "../i18n/I18nContext";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ko" : "en")}
      aria-label="Switch language"
      className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
    >
      {lang === "en" ? "한국어" : "EN"}
    </button>
  );
}
