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
          <details className="gifts-page__option gifts-page__option--bank">
            <summary className="gifts-page__bank-summary">
              <span className="gifts-page__bank-summary-copy">
                <span className="gifts-page__bank-title" role="heading" aria-level={2}>
                  {copy.bankTitle}
                </span>
                <span className="gifts-page__bank-description">{copy.bankDescription}</span>
              </span>
              <span className="gifts-page__bank-chevron" aria-hidden="true" />
            </summary>
            <div className="gifts-page__bank-details">
              <p>
                <strong>{copy.accountNameLabel}:</strong> ANTONIO CANERO
              </p>
              <p>
                <strong>{copy.ibanLabel}:</strong>{" "}
                <span className="gifts-page__iban">PT50 0033 0000 4567 8571 9620 5</span>
              </p>
            </div>
          </details>
          <article className="gifts-page__option">
            <h2>{copy.cashTitle}</h2>
            <p>{copy.cashDescription}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
