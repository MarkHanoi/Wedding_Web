// ---------------------------------------------------------------------------
// WorkshopPanel — floating panel listing MIAW's 3 workshops with their
// module groups, sessions structure, tools, and guest expert faces.
//
// Data source: src/data/workshops.ts (single source of truth from draw.io diagram)
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import FloatingPanel from "./FloatingPanel";
import { WORKSHOPS, getGuestsBySlug, WORKSHOP_IMAGES } from "../data/workshops";

interface WorkshopPanelProps {
  onClose: () => void;
  onSelectGuest: (slug: string) => void;
  initialX: number;
  initialY: number;
  width?: number | string;
  height?: number | string;
}

function GuestCircle({
  name,
  photo,
  gradientFrom,
  gradientTo,
  initials,
  onClick,
}: {
  name: string;
  photo?: string;
  gradientFrom: string;
  gradientTo: string;
  initials: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        border: "1.5px solid rgba(255,255,255,0.18)",
        background: `linear-gradient(160deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        cursor: "pointer",
        padding: 0,
        position: "relative",
        transition: "transform 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.12)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(100%) contrast(1.05)",
          }}
        />
      ) : (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
            fontWeight: 200,
            fontSize: "9px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          {initials}
        </span>
      )}
    </button>
  );
}

export default function WorkshopPanel({
  onClose,
  onSelectGuest,
  initialX,
  initialY,
  width = 540,
  height,
}: WorkshopPanelProps) {
  const heroImage = useMemo(
    () => WORKSHOP_IMAGES[Math.floor(Math.random() * WORKSHOP_IMAGES.length)],
    [],
  );

  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Workshops
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={33}
      resizable
      className="floating-panel--workshops"
    >
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
      >
        {/* Hero image */}
        <div style={{ width: "100%", aspectRatio: "16/7", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={heroImage}
            alt="Workshop"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(20%) contrast(1.05) brightness(0.88)",
              display: "block",
            }}
          />
        </div>

        {/* Workshop list */}
        <div className="px-4 py-3" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p
            className="text-white/35 text-xs tracking-wide"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            three phase juries — each spanning multiple modules of practice
          </p>

          {WORKSHOPS.map((workshop) => {
            const guests = getGuestsBySlug(workshop.guestSlugs);
            return (
              <div
                key={workshop.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                {/* Header strip */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.055)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    padding: "10px 14px 8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      color: "rgba(255,255,255,0.45)",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {workshop.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.88)",
                      lineHeight: 1.3,
                    }}
                  >
                    {workshop.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 300,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      marginLeft: "auto",
                      flexShrink: 0,
                    }}
                  >
                    {workshop.module}
                  </span>
                </div>

                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 300,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.52)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {workshop.description}
                  </p>

                  {/* Modules */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                      }}
                    >
                      Modules
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {workshop.modules.map((mod) => (
                        <div
                          key={mod.code}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 600,
                              fontSize: 9,
                              color: "rgba(255,255,255,0.35)",
                              letterSpacing: "0.1em",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {mod.code}
                          </span>
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                fontSize: 10,
                                color: "rgba(255,255,255,0.7)",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {mod.name}
                            </span>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 300,
                                fontSize: 10,
                                color: "rgba(255,255,255,0.38)",
                                marginLeft: 6,
                              }}
                            >
                              — {mod.description}
                            </span>
                            {mod.tools.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "3px 6px",
                                  marginTop: 4,
                                }}
                              >
                                {mod.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 300,
                                      fontSize: 9,
                                      color: "rgba(255,255,255,0.38)",
                                      background: "rgba(255,255,255,0.06)",
                                      borderRadius: 3,
                                      padding: "1px 5px",
                                    }}
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sessions structure */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                      }}
                    >
                      Structure
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {workshop.sessions.map((session) => {
                        const isJury = session.label.includes("Jury");
                        return (
                          <div
                            key={session.label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: isJury ? 500 : 300,
                                fontSize: 10,
                                color: isJury
                                  ? "rgba(255,220,200,0.75)"
                                  : "rgba(255,255,255,0.55)",
                              }}
                            >
                              {session.label}
                            </span>
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 300,
                                fontSize: 9,
                                color: "rgba(255,255,255,0.28)",
                                flexShrink: 0,
                              }}
                            >
                              {session.detail}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expert talks note */}
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 300,
                      fontSize: 9,
                      color: "rgba(255,255,255,0.28)",
                      lineHeight: 1.5,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    {workshop.expertTalks}
                  </p>

                  {/* Guest faces */}
                  {guests.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {guests.map((g) => (
                          <GuestCircle
                            key={g.slug}
                            name={g.name}
                            photo={g.photo}
                            gradientFrom={g.gradientFrom}
                            gradientTo={g.gradientTo}
                            initials={g.initials}
                            onClick={() => onSelectGuest(g.slug)}
                          />
                        ))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {guests.map((g) => (
                          <span
                            key={g.slug}
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 300,
                              fontSize: 10,
                              color: "rgba(255,255,255,0.42)",
                              lineHeight: 1.4,
                            }}
                          >
                            {g.name}
                            <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>
                              · {g.affiliation}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FloatingPanel>
  );
}
