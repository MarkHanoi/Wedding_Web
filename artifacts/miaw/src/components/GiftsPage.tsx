import LanguageSwitcher from "./LanguageSwitcher";
import { translations, type Language } from "../lib/i18n";

interface GiftsPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function GiftsPage({ language, onLanguageChange }: GiftsPageProps) {
  const copy = translations[language].giftsPage;
  const siteCopy = translations[language];

  return (
    <main className="gifts-page">
      <header className="gifts-page__header">
        <a className="gifts-page__back" href="/">
          <span aria-hidden="true">←</span> {copy.backLink}
        </a>
        <LanguageSwitcher
          language={language}
          label={siteCopy.languageLabel}
          variant="explore"
          onChange={onLanguageChange}
        />
      </header>

      <section className="gifts-page__content" aria-labelledby="gifts-page-title">
        <p className="gifts-page__eyebrow">{copy.eyebrow}</p>
        <h1 id="gifts-page-title">{copy.title}</h1>
        <p className="gifts-page__intro">{copy.description}</p>

        <div className="gifts-page__options">
          <article className="gifts-page__option">
            <h2>{copy.bankTitle}</h2>
            <p>{copy.bankDescription}</p>
          </article>
          <article className="gifts-page__option">
            <h2>{copy.cashTitle}</h2>
            <p>{copy.cashDescription}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
