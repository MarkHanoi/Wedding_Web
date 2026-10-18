import { useState, type CSSProperties, type FormEvent } from "react";
import { getTodaysPalette } from "../lib/dailyPalette";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations, type GalleryKey, type Language, type RSVPEvent } from "../lib/i18n";
import aerialFonteDaTelha from "../../../../attached_assets/Fonte_da_Telha_1_-_Copy_1792139804228.jpg";
import dunePath from "../../../../attached_assets/92658_-_Copy_1792139804226.jpg";
import coastalView from "../../../../attached_assets/fonte-da-telha_-_Copy_1792139804229.jpg";
import atlanticWaves from "../../../../attached_assets/images_1792139804230.jpg";
import beachLounge from "../../../../attached_assets/Screenshot_2026-10-16_074211_1792139804230.jpg";
import weddingAerial from "../../../../attached_assets/dji_0225_1792142246805.webp";
import weddingGarden from "../../../../attached_assets/dsc7086_1792142246824.webp";
import weddingEntrance from "../../../../attached_assets/dsc7090_1792142246824.webp";
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
  atlanticWaves,
  beachLounge,
];

const weddingVenuePhotoSources = [
  weddingAerial,
  weddingGarden,
  weddingEntrance,
];

const BEACH_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=38.569540%2C-9.195252";
const WEDDING_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Casa+do+Pinheiro+Manso+Quinta+do+Peru+2925-206+Azeit%C3%A3o+Portugal";
const WEDDING_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding&dates=20270619T173000/20270620T020000&ctz=Europe/Lisbon&location=Azeit%C3%A3o";

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
  className = "weekend-gallery",
}: {
  photos: GalleryPhoto[];
  label: string;
  carouselRole: string;
  previousLabel: string;
  nextLabel: string;
  chooseLabel: string;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const photo = photos[currentIndex];
  const photoCount = photos.length;

  const moveBy = (offset: number) => {
    setCurrentIndex((index) => (index + offset + photoCount) % photoCount);
  };

  return (
    <div
      className={className}
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
        {photoCount > 1 && (
          <figcaption
            className="weekend-gallery__caption"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{currentIndex + 1} / {photoCount}</span>
          </figcaption>
        )}
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
  "#travel",
  "#dress-code",
  "#faq",
  "#rsvp",
];
const travelItemHrefs = ["#travel-getting-here", "#travel-where-to-stay", "#travel-dinner", "#travel-things-to-do"];
const faqTestIds = ["invited", "weather", "gifts", "contact"] as const;

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
    mapUrl: index === 0 ? BEACH_MAP_URL : index === 1 ? WEDDING_MAP_URL : undefined,
    gallery: galleries[day.gallery],
  }));
  const sectionLinks = sectionHrefs.map((href, index) => ({
    href,
    label: copy.navigation.sections[index],
  }));
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [needsShuttle, setNeedsShuttle] = useState<"yes" | "no" | "">("");
  const [selectedEvents, setSelectedEvents] = useState<RSVPEvent[]>([]);
  const [arrival, setArrival] = useState("");
  const [transportEmail, setTransportEmail] = useState("");
  const [dietary, setDietary] = useState("");
  const [dietaryDetails, setDietaryDetails] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !name.trim() ||
      !attending ||
      (attending === "yes" &&
        (!needsShuttle ||
          selectedEvents.length === 0 ||
          (needsShuttle === "yes" && !transportEmail.trim()) ||
          (dietary === "other" && !dietaryDetails.trim())))
    ) return;

    const selectedDietaryOption = copy.rsvp.dietaryOptions.find(
      (option) => option.value === dietary,
    );
    const dietaryAnswer = selectedDietaryOption
      ? selectedDietaryOption.value === "other"
        ? `${selectedDietaryOption.label}: ${dietaryDetails.trim()}`
        : selectedDietaryOption.label
      : "";

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          guests: 0,
          shuttle: attending === "yes" && needsShuttle === "yes",
          events: attending === "yes" ? selectedEvents : [],
          arrival: attending === "yes" ? arrival.trim() : "",
          transportEmail:
            attending === "yes" && needsShuttle === "yes" ? transportEmail.trim() : "",
          dietary: attending === "yes" ? dietaryAnswer : "",
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
          src="/photos/hero-beach.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
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
          <a className="wedding-scroll__lead" href="#rsvp" data-testid="link-intro-rsvp">
            {copy.intro.rsvpLink}
          </a>
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
          <p className="wedding-section__description">
            {copy.weekend.description.beforeRsvp}
            <a className="weekend-description__rsvp-link" href="#rsvp">
              RSVP
            </a>
            {copy.weekend.description.afterRsvp}
          </p>
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
                  <div className="weekend-card__event">
                    <span>{copy.weekend.whereLabel}</span>
                    <strong>
                      {index === 1 ? (
                        <a
                          className="weekend-card__location-link"
                          href={WEDDING_MAP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="link-weekend-location"
                        >
                          {day.location}
                        </a>
                      ) : (
                        day.location
                      )}
                    </strong>
                  </div>
                  <div className="weekend-card__event">
                    <span>{copy.weekend.wearLabel}</span>
                    <strong>{day.wear}</strong>
                  </div>
                </div>
                {day.mapUrl && (
                  <div className="weekend-card__links">
                    <a
                      className="text-link"
                      href={day.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-weekend-map-${index}`}
                    >
                      {copy.weekend.mapLink} <span aria-hidden="true">↗</span>
                    </a>
                    {index === 0 && (
                      <a className="text-link" href="#travel-dinner" data-testid="link-dinner-ideas">
                        {copy.weekend.dinnerIdeasLink}
                      </a>
                    )}
                    {index === 1 && (
                      <a
                        className="text-link"
                        href={WEDDING_CALENDAR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-add-to-calendar"
                      >
                        {copy.weekend.calendarLink}
                      </a>
                    )}
                  </div>
                )}
                {index === 2 && (
                  <a className="text-link" href="#rsvp" data-testid="link-sunday-rsvp">
                    {copy.weekend.rsvpLink}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="travel" className="wedding-section">
        <p className="wedding-section__eyebrow">{copy.travel.eyebrow}</p>
        <h2>{copy.travel.title}</h2>
        <p>{copy.travel.description}</p>
        <div className="travel-shortcuts" role="group" aria-label={copy.travel.title}>
          {copy.travel.items.map((item, index) => (
            <a
              className="travel-shortcut"
              href={travelItemHrefs[index]}
              key={item.title}
              data-testid={`link-travel-shortcut-${index}`}
            >
              {item.title}
            </a>
          ))}
        </div>
        <div className="travel-grid">
          {copy.travel.items.map((item, index) => (
            <article id={travelItemHrefs[index].slice(1)} key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              {item.bulletItems && (
                <ul>
                  {item.bulletItems.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="dress-code" className="wedding-section wedding-section--band">
        <div className="wedding-section__inner">
          <p className="wedding-section__eyebrow">{copy.dressCode.eyebrow}</p>
          <h2>{copy.dressCode.title}</h2>
          {copy.dressCode.description && <p>{copy.dressCode.description}</p>}
          <div className="dress-code-grid">
            {copy.dressCode.days.map((day, index) => (
              <article key={day.title}>
                <span>{day.day}</span>
                <h3>{day.title}</h3>
                <p>{day.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="wedding-section wedding-section--faq">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">{copy.faq.eyebrow}</p>
          <h2>{copy.faq.title}</h2>
          {copy.faq.items.map((item, index) => (
            <details key={item.question}>
              <summary data-testid={`summary-${faqTestIds[index]}`}>{item.question}</summary>
              <p>
                {item.answer}
                {item.linkText && (
                  <>
                    {" "}
                    <a
                      className="wedding-section__inline-link"
                      href="/gifts"
                      data-testid="link-gifts-details"
                    >
                      {item.linkText}
                    </a>
                  </>
                )}
              </p>
              {item.contacts?.map((contact) => (
                <p key={contact.name}>
                  <strong>{contact.name}</strong>
                  <br />
                  {copy.faq.contactLabels.email}:{" "}
                  <a
                    className="wedding-section__inline-link"
                    href={`mailto:${contact.email}`}
                    aria-label={`${contact.name} — ${copy.faq.contactLabels.email}`}
                  >
                    {contact.email}
                  </a>
                  {contact.whatsapp && (
                    <>
                      {" · "}
                      {copy.faq.contactLabels.whatsapp}:{" "}
                      <a
                        className="wedding-section__inline-link"
                        href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${contact.name} — ${copy.faq.contactLabels.whatsapp}`}
                      >
                        {contact.whatsapp}
                      </a>
                    </>
                  )}
                  {contact.phone && (
                    <>
                      {" · "}
                      {copy.faq.contactLabels.call}:{" "}
                      <a
                        className="wedding-section__inline-link"
                        href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                        aria-label={`${contact.name} — ${copy.faq.contactLabels.call}`}
                      >
                        {contact.phone}
                      </a>
                    </>
                  )}
                </p>
              ))}
            </details>
          ))}
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
                    onClick={() => {
                      setAttending("yes");
                      setSelectedEvents((current) =>
                        current.includes("saturday") ? current : [...current, "saturday"],
                      );
                    }}
                    data-testid="button-rsvp-attending"
                  >
                    {copy.rsvp.accept}
                  </button>
                  <button
                    className={`rsvp-choice${attending === "no" ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={attending === "no"}
                    onClick={() => {
                      setAttending("no");
                      setSelectedEvents([]);
                    }}
                    data-testid="button-rsvp-decline"
                  >
                    {copy.rsvp.decline}
                  </button>
                </div>
              </fieldset>

              {attending === "yes" && (
                <>
                  <fieldset className="rsvp-field">
                    <legend>{copy.rsvp.eventsLegend}</legend>
                    <div className="rsvp-event-options">
                      {copy.rsvp.events.map((item) => {
                        const checked = selectedEvents.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`rsvp-event-option${checked ? " is-selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              name="events"
                              value={item.id}
                              checked={checked}
                              onChange={(event) => {
                                const isChecked = event.currentTarget.checked;
                                setSelectedEvents((current) =>
                                  isChecked
                                    ? [...current, item.id]
                                    : current.filter((eventId) => eventId !== item.id),
                                );
                              }}
                              data-testid={`checkbox-rsvp-event-${item.id}`}
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
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
                  {needsShuttle === "yes" && (
                    <label className="rsvp-field">
                      <span>{copy.rsvp.transportEmailLabel}</span>
                      <input
                        type="email"
                        name="transportEmail"
                        autoComplete="email"
                        placeholder={copy.rsvp.transportEmailPlaceholder}
                        value={transportEmail}
                        onChange={(event) => setTransportEmail(event.target.value)}
                        required
                        data-testid="input-rsvp-transport-email"
                      />
                    </label>
                  )}

                  <label className="rsvp-field">
                    <span>{copy.rsvp.arrivalLabel} <em>{copy.rsvp.optional}</em></span>
                    <input
                      type="text"
                      name="arrival"
                      placeholder={copy.rsvp.arrivalPlaceholder}
                      value={arrival}
                      onChange={(event) => setArrival(event.target.value)}
                      data-testid="input-rsvp-arrival"
                    />
                  </label>

                  <label className="rsvp-field">
                    <span>{copy.rsvp.dietaryLabel}</span>
                    <select
                      name="dietary"
                      value={dietary}
                      onChange={(event) => setDietary(event.target.value)}
                      data-testid="input-rsvp-dietary"
                    >
                      <option value="">{copy.rsvp.dietaryPlaceholder}</option>
                      {copy.rsvp.dietaryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {dietary === "other" && (
                    <label className="rsvp-field">
                      <span>{copy.rsvp.dietaryOtherLabel}</span>
                      <input
                        type="text"
                        name="dietaryOther"
                        placeholder={copy.rsvp.dietaryOtherPlaceholder}
                        value={dietaryDetails}
                        onChange={(event) => setDietaryDetails(event.target.value)}
                        maxLength={400}
                        required
                        data-testid="input-rsvp-dietary-other"
                      />
                    </label>
                  )}
                </>
              )}

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
                disabled={
                  !name.trim() ||
                  !attending ||
                  (attending === "yes" &&
                    (!needsShuttle ||
                      selectedEvents.length === 0 ||
                      (needsShuttle === "yes" && !transportEmail.trim()) ||
                      (dietary === "other" && !dietaryDetails.trim()))) ||
                  submitting
                }
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
        <a className="wedding-admin-link" href="/admin">Admin</a>
      </footer>
    </main>
  );
}
