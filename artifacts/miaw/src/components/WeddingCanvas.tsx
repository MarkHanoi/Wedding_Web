import { useState, type CSSProperties, type FormEvent } from "react";
import { getTodaysPalette } from "../lib/dailyPalette";
import couplePhoto from "../../../../attached_assets/Gemini_Generated_Image_viph59viph59viph_1792092122504.jpg";
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

const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

interface WeddingCanvasProps {
  onGoToHero?: () => void;
}

interface GalleryPhoto {
  src: string;
  alt: string;
}

const preWeddingPhotos: GalleryPhoto[] = [
  { src: aerialFonteDaTelha, alt: "Aerial view of Fonte da Telha beach and coastline" },
  { src: dunePath, alt: "A sandy path winding through the dunes toward the beach" },
  { src: coastalView, alt: "View of the Atlantic coastline from the cliffs above the beach" },
  { src: beachRestaurant, alt: "Shaded tables on a beachside restaurant terrace" },
  { src: atlanticWaves, alt: "Atlantic waves rolling onto the shore, seen from above" },
  { src: beachLounge, alt: "Relaxed lounge seating overlooking Fonte da Telha beach" },
];

const weddingVenuePhotos: GalleryPhoto[] = [
  { src: weddingAerial, alt: "Aerial view of the wedding venue among the wooded grounds" },
  { src: weddingGarden, alt: "Garden terrace beneath the shade of a large oak tree" },
  { src: weddingEntrance, alt: "Coral-pink venue entrance framed by cypress trees" },
  { src: weddingCourtyardNight, alt: "The venue courtyard warmly lit after dark" },
  { src: weddingGardenSeating, alt: "A shaded garden seating area with blue benches" },
  { src: weddingGate, alt: "The coral-pink garden wall and entrance gate" },
];

interface PhotoGallery {
  photos: GalleryPhoto[];
  label: string;
  landscape?: boolean;
}

function PhotoCarousel({
  photos,
  label,
  landscape = false,
}: {
  photos: GalleryPhoto[];
  label: string;
  landscape?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const photo = photos[currentIndex];
  const photoCount = photos.length;

  const moveBy = (offset: number) => {
    setCurrentIndex((index) => (index + offset + photoCount) % photoCount);
  };

  return (
    <div
      className={`weekend-gallery${landscape ? " weekend-gallery--landscape" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <figure className="weekend-gallery__figure">
        <div className="weekend-gallery__frame">
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
          <button
            className="weekend-gallery__arrow weekend-gallery__arrow--previous"
            type="button"
            aria-label="Show previous photo"
            onClick={() => moveBy(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="weekend-gallery__arrow weekend-gallery__arrow--next"
            type="button"
            aria-label="Show next photo"
            onClick={() => moveBy(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <figcaption className="weekend-gallery__caption" aria-live="polite" aria-atomic="true">
          <span>{photo.alt}</span>
          <span>{currentIndex + 1} / {photoCount}</span>
        </figcaption>
      </figure>
      <div className="weekend-gallery__indicators" role="group" aria-label="Choose a photo">
        {photos.map((item, index) => (
          <button
            className="weekend-gallery__indicator"
            key={item.src}
            type="button"
            aria-label={`Show photo ${index + 1} of ${photoCount}: ${item.alt}`}
            aria-pressed={currentIndex === index}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface WeekendDay {
  date: string;
  title: string;
  description: string;
  location: string;
  mapUrl?: string;
  events: { time: string; name: string }[];
  gallery?: PhotoGallery;
}

const weekend: WeekendDay[] = [
  {
    date: "Friday · 18 June 2027",
    title: "Pre-wedding gathering",
    description: "An evening together by the water before the wedding.",
    location: "Aroeira Beach · Fonte da Telha",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Aroeira+Beach+Fonte+da+Telha+Portugal",
    events: [{ time: "Evening", name: "Pre-wedding celebration" }],
    gallery: { photos: preWeddingPhotos, label: "Pre-wedding photos" },
  },
  {
    date: "Saturday · 19 June 2027",
    title: "The wedding",
    description: "A ceremony beneath the open sky, followed by dinner and dancing.",
    location: "South Lisbon · full venue details to follow",
    events: [
      { time: "17:00", name: "Ceremony" },
      { time: "18:00", name: "Cocktails" },
      { time: "21:00", name: "Dinner" },
      { time: "Late", name: "Dancing" },
    ],
    gallery: { photos: weddingVenuePhotos, label: "Wedding venue photos", landscape: true },
  },
  {
    date: "Sunday · 20 June 2027",
    title: "Beach brunch",
    description: "A slow, sunny goodbye by the water.",
    location: "Details to follow",
    events: [{ time: "Midday", name: "Brunch" }],
  },
];

const sectionLinks = [
  { href: "#our-story", label: "Our story" },
  { href: "#weekend", label: "The weekend" },
  { href: "#location", label: "Location" },
  { href: "#travel", label: "Travel" },
  { href: "#faq", label: "Good to know" },
  { href: "#dress-code", label: "Dress code" },
  { href: "#rsvp", label: "RSVP" },
];

export default function WeddingCanvas({ onGoToHero }: WeddingCanvasProps) {
  const palette = getTodaysPalette();
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
      setError("We couldn't send your reply just now. Please try again in a moment.");
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

      <header className="wedding-scroll__header">
        <nav className="wedding-scroll__section-links" aria-label="Main sections">
          {sectionLinks.map((section) => (
            <a key={section.href} href={section.href}>
              {section.label}
            </a>
          ))}
        </nav>
        {onGoToHero && (
          <button
            className="wedding-scroll__home"
            onClick={onGoToHero}
            type="button"
            data-testid="button-back-to-intro"
            aria-label="Back to intro"
            title="Back to intro"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
      </header>

      <div id="top" className="wedding-scroll__intro">
        <div className="wedding-scroll__heading">
          <p className="wedding-scroll__eyebrow">We're Getting Married</p>
          <h1>Clémence &amp; Antonio</h1>
          <p className="wedding-scroll__lead">19 · 06 · 2027</p>
        </div>
        <figure className="wedding-scroll__photo">
          <img src={couplePhoto} alt="A personal photo of Clémence and Antonio together" />
        </figure>
        <a className="wedding-scroll__down" href="#our-story" aria-label="Scroll to our story" data-testid="link-scroll-to-story">
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <section id="our-story" className="wedding-section wedding-section--story">
        <h2>Our Story</h2>
        <p>
          Clemence, from Jouy-en-Josas, France, and Antonio, from Córdoba, Spain, met
          in London in 2016. What began there soon became a shared adventure, taking
          them across countries and continents.
        </p>
        <p>
          After two years in London, they moved to Sydney in 2018, then to Brisbane
          in 2019. In 2022, they took another leap and made Portugal their home,
          settling just north of Lisbon, where they began building a house together.
        </p>
        <p>
          Along the way, they travelled around the world, collecting memories,
          discovering new places, and making every adventure part of their story.
        </p>
        <p>
          Today, they are back on Lisbon’s South Bank, a place they call home and
          where they are excited to celebrate the next chapter of their journey —
          surrounded by the people they love most.
        </p>
        <p>And so, their story continues…</p>
      </section>

      <section id="weekend" className="wedding-section wedding-section--band">
        <div className="wedding-section__inner">
          <p className="wedding-section__eyebrow">The weekend</p>
          <h2>Meet us in South Lisbon</h2>
          <p className="wedding-section__description">
            Three days together on the Lisbon coast. More practical details will be
            added here as they’re confirmed.
          </p>
          <div className="weekend-grid">
            {weekend.map((day, index) => (
              <article className="weekend-card" key={day.date} data-testid={`card-weekend-${index}`}>
                <p className="weekend-card__date">{day.date}</p>
                <h3>{day.title}</h3>
                <p className="weekend-card__description">{day.description}</p>
                {day.gallery && (
                  <PhotoCarousel
                    photos={day.gallery.photos}
                    label={day.gallery.label}
                    landscape={day.gallery.landscape}
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
                    View the beach on a map <span aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="wedding-section wedding-section--location">
        <p className="wedding-section__eyebrow">The place</p>
        <h2>South Lisbon, close to the sea</h2>
        <p>
          Our pre-wedding gathering is at Aroeira Beach in Fonte da Telha. The
          wedding celebration will be in South Lisbon; we’ll share the exact venue
          and address as soon as they’re confirmed.
        </p>
        <a
          className="text-link"
          href="https://www.google.com/maps/search/?api=1&query=Aroeira+Beach+Fonte+da+Telha+Portugal"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-location-map"
        >
          Aroeira Beach · Fonte da Telha <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section id="travel" className="wedding-section">
        <p className="wedding-section__eyebrow">Travel &amp; stay</p>
        <h2>A little further south</h2>
        <p>
          Fly into Lisbon Airport (LIS). We’ll share accommodation suggestions and
          local transport details when they’re ready.
        </p>
        <div className="travel-grid">
          <article>
            <span>01</span>
            <h3>Getting here</h3>
            <p>Lisbon Airport is the closest international airport.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Where to stay</h3>
            <p>Stay recommendations will be added soon.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Getting around</h3>
            <p>We’ll share local transport and shuttle information closer to the day.</p>
          </article>
        </div>
      </section>

      <section id="faq" className="wedding-section wedding-section--faq">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">A few notes</p>
          <h2>Good to know</h2>
          <details>
            <summary data-testid="summary-children">Are children welcome?</summary>
            <p>Yes, we’d love to see them.</p>
          </details>
          <details>
            <summary data-testid="summary-weather">What if it’s windy or rainy?</summary>
            <p>We have a covered plan so the day stays beautiful.</p>
          </details>
          <details>
            <summary data-testid="summary-gifts">Gifts?</summary>
            <p>Your presence is the gift. A contribution to our honeymoon is welcome.</p>
          </details>
        </div>
      </section>

      <section id="dress-code" className="wedding-section wedding-section--band">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">Dress code</p>
          <h2>Ivory, sand &amp; soft light</h2>
          <p>
            Think natural linen, airy fabrics and warm neutrals. Please leave white
            for the bride and black at home.
          </p>
          <div className="wedding-swatches" aria-label="Suggested colours">
            {["#FAF6F0", "#E8D8B8", "#D4A574", "#B8845A"].map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </section>

      <section id="rsvp" className="wedding-section wedding-section--rsvp">
        <div className="wedding-section__inner wedding-section__inner--narrow">
          <p className="wedding-section__eyebrow">RSVP</p>
          <h2>Will you join us?</h2>
          <p className="wedding-section__description">
            Please reply for the wedding weekend. We’ll add the response deadline soon.
          </p>

          {submitted ? (
            <div className="rsvp-success" role="status" data-testid="status-rsvp-success">
              <span aria-hidden="true">✳</span>
              <h3>Thank you, {name.split(" ")[0]}.</h3>
              <p>
                {attending === "yes"
                  ? "We can’t wait to celebrate with you."
                  : "We’ll miss you, but thank you for letting us know."}
              </p>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <label className="rsvp-field">
                <span>Your name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  data-testid="input-rsvp-name"
                />
              </label>

              <fieldset className="rsvp-field">
                <legend>Will you attend?</legend>
                <div className="rsvp-choice-row">
                  <button
                    className={`rsvp-choice${attending === "yes" ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={attending === "yes"}
                    onClick={() => setAttending("yes")}
                    data-testid="button-rsvp-attending"
                  >
                    Joyfully accepts
                  </button>
                  <button
                    className={`rsvp-choice${attending === "no" ? " is-selected" : ""}`}
                    type="button"
                    aria-pressed={attending === "no"}
                    onClick={() => setAttending("no")}
                    data-testid="button-rsvp-decline"
                  >
                    Regretfully declines
                  </button>
                </div>
              </fieldset>

              {attending === "yes" && (
                <>
                  <fieldset className="rsvp-field">
                    <legend>Additional guests, excluding yourself</legend>
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
                    <legend>Will you need a shuttle?</legend>
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
                          {answer === "yes" ? "Yes, please" : "No, thank you"}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              <label className="rsvp-field">
                <span>Dietary requirements</span>
                <input
                  type="text"
                  name="dietary"
                  placeholder="Allergies or preferences"
                  value={dietary}
                  onChange={(event) => setDietary(event.target.value)}
                  data-testid="input-rsvp-dietary"
                />
              </label>

              <label className="rsvp-field">
                <span>A note for the couple <em>(optional)</em></span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Write a little note…"
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
                {submitting ? "Sending…" : "Send your reply"}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="wedding-scroll__footer">
        Clémence &amp; Antonio · Lisbon Coast · 2027
      </footer>
    </main>
  );
}
