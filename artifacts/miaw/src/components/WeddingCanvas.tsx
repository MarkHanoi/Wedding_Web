import { useState, type CSSProperties, type FormEvent } from "react";
import { getTodaysPalette } from "../lib/dailyPalette";

const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, "");

interface WeddingCanvasProps {
  onGoToHero?: () => void;
}

const weekend = [
  {
    date: "Friday · 18 June 2027",
    title: "Pre-wedding gathering",
    description: "An evening together by the water before the wedding.",
    location: "Aroeira Beach · Fonte da Telha",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Aroeira+Beach+Fonte+da+Telha+Portugal",
    events: [{ time: "Evening", name: "Pre-wedding celebration" }],
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
  },
  {
    date: "Sunday · 20 June 2027",
    title: "Beach brunch",
    description: "A slow, sunny goodbye by the water.",
    location: "Details to follow",
    events: [{ time: "Midday", name: "Brunch" }],
  },
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
        <a className="wedding-scroll__brand" href="#top" aria-label="Clémence and Antonio, top of page" data-testid="link-to-top">
          C <span>&amp;</span> A
        </a>
        <span className="wedding-scroll__header-note">Lisbon Coast · Portugal</span>
        {onGoToHero && (
          <button
            className="wedding-scroll__home"
            onClick={onGoToHero}
            type="button"
            data-testid="button-back-to-intro"
          >
            Back to intro
          </button>
        )}
      </header>

      <div id="top" className="wedding-scroll__intro">
        <p className="wedding-scroll__eyebrow">Clémence &amp; Antonio · 19 June 2027</p>
        <h1>Three days of light</h1>
        <p className="wedding-scroll__lead">
          A weekend by the sea, with our favourite people.
        </p>
        <a className="wedding-scroll__down" href="#our-story" aria-label="Scroll to our story" data-testid="link-scroll-to-story">
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <section id="our-story" className="wedding-section wedding-section--story">
        <p className="wedding-section__eyebrow">Our story</p>
        <h2>From Paris to Madrid, and everywhere between</h2>
        <p>
          She is French, he is Spanish, and for ten years the world has been our home:
          slow mornings in Formentera, sunsets in Comporta, rooftops in Mallorca, and
          buildings that stop us in the street.
        </p>
        <p>
          Now we’re choosing Portugal, light, sea and stone, to celebrate with the
          people we love most.
        </p>
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

      <section className="wedding-section wedding-section--faq">
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
