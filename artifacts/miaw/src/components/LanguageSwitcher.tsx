import { languageOptions, type Language } from "../lib/i18n";

const languageCodes: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
  pt: "PT",
};

interface LanguageSwitcherProps {
  language: Language;
  label: string;
  variant: "hero" | "explore";
  onChange: (language: Language) => void;
}

export default function LanguageSwitcher({
  language,
  label,
  variant,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <div className={`language-switcher language-switcher--${variant}`}>
      <span className="language-switcher__code" aria-hidden="true">
        {languageCodes[language]}
      </span>
      <select
        value={language}
        aria-label={label}
        title={label}
        onChange={(event) => onChange(event.target.value as Language)}
      >
        {languageOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            lang={option.value === "pt" ? "pt-PT" : option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
