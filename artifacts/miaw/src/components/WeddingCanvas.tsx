import { useState, type CSSProperties, type FormEvent } from "react";
import { getTodaysPalette } from "../lib/dailyPalette";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations, type GalleryKey, type Language } from "../lib/i18n";
import aerialFonteDaTelha from "../../../../attached_assets/Fonte_da_Telha_1_-_Copy_1792139804228.jpg";
import dunePath from "../../../../attached_assets/92658_-_Copy_1792139804226.jpg";
import coastalView from "../../../../attached_assets/fonte-da-telha_-_Copy_1792139804229.jpg";
import beachRestaurant from "../../../../attached_assets/image_1792139804229.webp";
import atlanticWaves from "../../../../attached_assets/images_1792139804230.jpg";
import beachLounge from "../../../../attached_assets/Screenshot_2026-10-16_074211_1792139804230.jpg";
import weddingAerial from "../../../../attached_assets/dji_0225_1792142246805.webp";
import weddingGarden from "../../../../attached_assets/dsc7086_1792142246824.webp";
import weddingEntrance from "../../../../attached_assets/dsc7090_1792142246824.webp";
import weddingCourtyardNight from "../../../../attached_assets/dsc7696_1792142246825.webp";
import weddingGardenSeating from "../../../../attached_assets/dsc7805_1792142246825.webp";
import weddingGate from "../../../../attached_assets/vh2-4698_6_176483-176823242177654_1792142246826.webp";
import brunchTable from "../../../../attached_assets/but-first-brunch-outdoor-brunch-party-ideas-165228_1296x_1792142942629.webp";

const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

interface WeddingCanvasProps {
  onGoToHero?: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

const preWeddingPhotoSources = [
  aerialFonteDaTelha,
  dunePath,
  coastalView,
  beachRestaurant,
  atlanticWaves,
  beachLounge,
];

const weddingVenuePhotoSources = [
  weddingAerial,
  weddingGarden,
  weddingEntrance,
  weddingCourtyardNight,
  weddingGardenSeating,
  weddingGate,
];

const BEACH_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Aroeira+Beach+Fonte+da+Telha+Portugal";

interface PhotoGallery {
  photos: GalleryPhoto[];
  label: string;
}

function PhotoCarousel({
  photos,
  label,
  carouselRole,
  previousLabel,
  nextLabel,
  chooseLabel,
}: {
  photos: GalleryPhoto[];
  label: string;
  carouselRole: string;
  previousLabel: string;
  nextLabel: string;
  chooseLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const photo = photos[currentIndex];
  const photoCount = photos.length;

  const moveBy = (offset: number) => {
    setCurrentIndex((index) => (index + offset + photoCount) % photoCount);
  };

  return (
    <div
      className="weekend-gallery"
      role="region"
      aria-roledescription={photoCount > 1 ? carouselRole : undefined}
      aria-label={label}
    >
      <figure className="weekend-gallery__figure">
        <div className="weekend-gallery__frame">
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
          {photoCount > 1 && (
            <>
              <button
                className="weekend-gallery__arrow weekend-gallery__arrow--previous"
                type="button"
                aria-label={previousLabel}
                onClick={() => moveBy(-1)}
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                className="weekend-gallery__arrow weekend-gallery__arrow--next"
                type="button"
                aria-label={nextLabel}
                onClick={() => moveBy(1)}
              >
                <span aria-hidden="true">›</span>
              </button>
            </>
          )}
        </div>
        <figcaption
          className="weekend-gallery__caption"
          aria-live={photoCount > 1 ? "polite" : undefined}
          aria-atomic={photoCount > 1 ? "true" : undefined}
        >
          <span>{photo.alt}</span>
          {photoCount > 1 && <span>{currentIndex + 1} / {photoCount}</span>}
        </figcaption>
      </figure>
      {photoCount > 1 && (
        <div className="weekend-gallery__indicators" role="group" aria-label={chooseLabel}>
          {photos.map((item, index) => (
            <button
              className="weekend-gallery__indicator"
              key={item.src}
              type="button"
              aria-label={`${chooseLabel} ${index + 1} / ${photoCount}: ${item.alt}`}
              aria-pressed={currentIndex === index}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const sectionHrefs = [
  "#our-story",
  "#weekend",
  "#location",
  "#travel",
  "#faq",
  "#dress-code",
  "#rsvp",
];
const faqTestIds = ["children", "weather", "gifts"] as const;

export default function WeddingCanvas({
  onGoToHero,
  language,
  onLanguageChange,
}: WeddingCanvasProps) {
  const palette = getTodaysPalette();
  const copy = translations[language];
  const galleries: Record<GalleryKey, PhotoGallery> = {
    preWedding: {
      photos: preWeddingPhotoSources.map((src, index) => ({
        src,
        alt: copy.galleries.preWeddingAlts[index],
      })),
      label: copy.galleries.preWeddingLabel,
    },
    venue: {
      photos: weddingVenuePhotoSources.map((src, index) => ({
        src,
        alt: copy.galleries.venueAlts[index],
      })),
      label: copy.galleries.venueLabel,
    },
    brunch: {
      photos: [{ src: brunchTable, alt: copy.galleries.brunchAlt }],
      label: copy.galleries.brunchLabel,
    },
  };
  const weekend = copy.weekend.days.map((day, index) => ({
    ...day,
    galleryId: day.gallery,
    mapUrl: index === 0 ? BEACH_MAP_URL : undefined,
    gallery: galleries[day.gallery],
  }));
  const sectionLinks = sectionHrefs.map((href, index) => ({
    href,
    label: copy.navigation.sections[index],
  }));
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [needsShuttle, setNeedsShuttle] = useState<"yes" | "no" | "">("");
  const [guestCount, setGuestCount] = useState(0);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !attending || (attending === "yes" && !needsShuttle)) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guests: attending === "yes" ? guestCount : 0,
          shuttle: attending === "yes" && needsShuttle === "yes",
          dietary: dietary.trim(),
          message: message.trim(),
        }),
      });
      if (!response.ok) throw new Error("RSVP request failed");
      setSubmitted(true);
    } catch {
      setError(copy.rsvp.error);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollStyle = {
    "--c1": palette.c1,
    "--c2": palette.c2,
    "--c3": palette.c3,
    "--c4": palette.c4,
  } as CSSProperties;

  return (
    <main className="wedding-scroll" style={scrollStyle} data-testid="page-wedding-information">
      <div className="gradient-canvas wedding-scroll__background" aria-hidden="true" />
      <div className="grain-overlay hero-gradient wedding-scroll__sea-gradient" aria-hidden="true">
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "18%",
            background: "linear-gradient(to top, #203e4e 0%, #203e4e 30%, transparent 100%)",
            zIndex: 3,
          }}
        />
      </div>
      <div className="wedding-scroll__beach-transition" aria-hidden="true">
        <img
          src="/photos/hero-beach.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ transform: "rotate(180deg)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "45%",
            background: "linear-gradient(to bottom, #203e4e 0%, #203e4e 5%, transparent 100%)",
            zIndex: 1,
          }}
        />
      </div>

      <header className="wedding-scroll__header">
        <nav
          className="wedding-scroll__section-links"
          aria-label={copy.navigation.mainSections}
        >
          {sectionLinks.map((section) => (
            <a key={section.href} href={section.href}>
              {section.label}
            </a>
          ))}
        </nav>
        <LanguageSwitcher
          language={language}
          label={copy.languageLabel}
          variant="explore"
          onChange={onLanguageChange}
        />
        {onGoToHero && (
          <button
            className="wedding-scroll__home"
            onClick={onGoToHero}
            type="button"
            data-testid="button-back-to-intro"
            aria-label={copy.navigation.backToIntro}
            title={copy.navigation.backToIntro}
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
      </header>

      <div id="top" className="wedding-scroll__intro">
        <div className="wedding-scroll__heading">
          <p className="wedding-scroll__eyebrow">{copy.intro.eyebrow}</p>
          <h1>Clémence &amp; Antonio</h1>
          <p className="wedding-scroll__lead">19 · 06 · 2027</p>
        </div>
        <a
          className="wedding-scroll__down"
          href="#our-story"
          aria-label={copy.intro.scrollToStory}
          data-testid="link-scroll-to-story"
        >
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <section id="our-story" className="wedding-section wedding-section--story">
        <h2>{copy.story.title}</h2>
        {copy.story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section id="weekend" className="wedding-section wedding-section--band">
        <div className="wedding-section__inner">
          <p className="wedding-section__eyebrow">{copy.weekend.eyebrow}</p>
          <h2>{copy.weekend.title}</h2>
          <p className="wedding-section__description">{copy.weekend.description}</p>
          <div className="weekend-grid">
            {weekend.map((day, index) => (
              <article className="weekend-card" key={day.galleryId} data-testid={`card-weekend-${index}`}>
                <p className="weekend-card__date">{day.date}</p>
                <h3>{day.title}</h3>
                <p className="weekend-card__description">{day.description}</p>
                {day.gallery && (
                  <PhotoCarousel
                    photos={day.gallery.photos}
                    label={day.gallery.label}
                    carouselRole={copy.galleries.carouselRole}
                    previousLabel={copy.galleries.previous}
                    nextLabel={copy.galleries.next}
                    chooseLabel={copy.galleries.choose}
                  />
                )}
                <div className="weekend-card__events">
                  {day.events.map((item) => (
                    <div className="weekend-card__event" key={`${item.time}-${item.name}`}>
                      <span data-testid={`text-event-time-${index}-${item.time}`}>{item.time}</span>
                      <strong data-testid={`text-event-name-${index}-${item.time}`}>{item.name}</strong>
                    </div>
                  ))}
                </div>
                <p className="weekend-card__location">{day.location}</p>
                {day.mapUrl && (
                  <a
                    className="text-link"
                    href={day.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-prewedding-map"
                  >
                    {copy.weekend.mapLink} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="wedding-section wedding-section--location">
        <p className="wedding-section__eyebrow">{copy.location.eyebrow}</p>
        <h2>{copy.location.title}</h2>
        <p>{copy.location.description}</p>
        <a
          className="text-link"
          href={BEACH_MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-location-map"
        >
          {copy.location.mapLink} <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section id="travel" className="wedding-section">
        <p className="wedding-section__eyebrow">{copy.travel.eyebrow}</p>
        <h2>{copy.travel.title}</h2>
        <p>{copy.travel.description}</p>
        <div className="travel-grid">
          {copy.travel.items.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="wedding-section wedding-section--faq">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">{copy.faq.eyebrow}</p>
          <h2>{copy.faq.title}</h2>
          {copy.faq.items.map((item, index) => (
            <details key={item.question}>
              <summary data-testid={`summary-${faqTestIds[index]}`}>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="dress-code" className="wedding-section wedding-section--band">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">{copy.dressCode.eyebrow}</p>
          <h2>{copy.dressCode.title}</h2>
          <p>{copy.dressCode.description}</p>
          <div className="wedding-swatches" aria-label={copy.dressCode.swatchesLabel}>
            {["#FAF6F0", "#E8D8B8", "#D4A574", "#B8845A"].map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </section>

      <section id="rsvp" className="wedding-section wedding-section--rsvp">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">{copy.rsvp.eyebrow}</p>
          <h2>{copy.rsvp.title}</h2>
          <p className="wedding-section__description">{copy.rsvp.description}</p>

          {submitted ? (
            <div className="rsvp-success" role="status" data-testid="status-rsvp-success">
              <span aria-hidden="true">✳</span>
              <h3>{copy.rsvp.thankYou.replace("{name}", name.split(" ")[0])}</h3>
              <p>
                {attending === "yes"
                  ? copy.rsvp.accepted
                  : copy.rsvp.declined}
              </p>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <label className="rsvp-field">
                <span>{copy.rsvp.nameLabel}</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder={copy.rsvp.namePlaceholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  data-testid="input-rsvp-name"
                />
              </label>

              <fieldset className="rsvp-field">
                <legend>{copy.rsvp.attendanceLegend}</legend>
                <div className="rsvp-choice-row">
                  <button
                    className={`rsvp-choice${attending === "yes" ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={attending === "yes"}
                    onClick={() => setAttending("yes")}
                    data-testid="button-rsvp-attending"
                  >
                    {copy.rsvp.accept}
                  </button>
                  <button
                    className={`rsvp-choice${attending === "no" ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={attending === "no"}
                    onClick={() => setAttending("no")}
                    data-testid="button-rsvp-decline"
                  >
                    {copy.rsvp.decline}
                  </button>
                </div>
              </fieldset>

              {attending === "yes" && (
                <>
                  <fieldset className="rsvp-field">
                    <legend>{copy.rsvp.additionalGuests}</legend>
                    <div className="rsvp-guests">
                      {[0, 1, 2, 3].map((count) => (
                        <button
                          key={count}
                          className={`rsvp-guest${guestCount === count ? " is-selected" : ""}`}
                          type="button"
                          aria-pressed={guestCount === count}
                          onClick={() => setGuestCount(count)}
                          data-testid={`button-rsvp-guests-${count}`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="rsvp-field">
                    <legend>{copy.rsvp.shuttleLegend}</legend>
                    <div className="rsvp-choice-row">
                      {(["yes", "no"] as const).map((answer) => (
                        <button
                          key={answer}
                          className={`rsvp-choice${needsShuttle === answer ? " is-selected" : ""}`}
                          type="button"
                          aria-pressed={needsShuttle === answer}
                          onClick={() => setNeedsShuttle(answer)}
                          data-testid={`button-rsvp-shuttle-${answer}`}
                        >
                          {answer === "yes" ? copy.rsvp.shuttleYes : copy.rsvp.shuttleNo}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              <label className="rsvp-field">
                <span>{copy.rsvp.dietaryLabel}</span>
                <input
                  type="text"
                  name="dietary"
                  placeholder={copy.rsvp.dietaryPlaceholder}
                  value={dietary}
                  onChange={(event) => setDietary(event.target.value)}
                  data-testid="input-rsvp-dietary"
                />
              </label>

              <label className="rsvp-field">
                <span>
                  {copy.rsvp.noteLabel} <em>{copy.rsvp.optional}</em>
                </span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder={copy.rsvp.notePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  data-testid="input-rsvp-message"
                />
              </label>

              {error && <p className="rsvp-error" role="alert" data-testid="status-rsvp-error">{error}</p>}
              <button
                className="rsvp-submit"
                type="submit"
                disabled={!name.trim() || !attending || (attending === "yes" && !needsShuttle) || submitting}
                data-testid="button-submit-rsvp"
              >
                {submitting ? copy.rsvp.sending : copy.rsvp.send}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="wedding-scroll__footer">
        {copy.footer}
      </footer>
    </main>
  );
}
