import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;

  posthog.init(key, {
    api_host:
      (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
      "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    persistence: "memory",
  });

  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (typeof window === "undefined") return;
  if (!initialized) initPostHog();
  if (!initialized) return;
  posthog.capture(event, { ...properties, product: "miaw_phase0" });
}

export const analytics = {
  pageLoaded: (referrer: string) =>
    trackEvent("page_loaded", { referrer: referrer || "direct" }),

  conversationStarted: () => trackEvent("conversation_started"),

  conversationTurn: (
    turn: number,
    visitorType: string,
    messageLength: number,
  ) =>
    trackEvent("conversation_turn", {
      turn_number: turn,
      visitor_type: visitorType,
      message_length: messageLength,
    }),

  profileIdentified: (visitorType: string, turnWhenIdentified: number) =>
    trackEvent("profile_identified", {
      visitor_type: visitorType,
      turn_when_identified: turnWhenIdentified,
    }),

  ctaShown: (turnNumber: number, visitorType: string) =>
    trackEvent("cta_shown", {
      turn_number: turnNumber,
      visitor_type: visitorType,
    }),

  waitlistSubmitted: (
    visitorType: string,
    emailDomainTld: string,
    conversationLength: number,
  ) =>
    trackEvent("waitlist_submitted", {
      visitor_type: visitorType,
      email_domain_tld: emailDomainTld,
      conversation_length: conversationLength,
    }),

  // P2-B: Application flow events

  applicationStarted: (visitorType: string, qualificationTurns: number) =>
    trackEvent("application_started", {
      visitor_type: visitorType,
      qualification_turns: qualificationTurns,
    }),

  applicationTurn: (
    applicationTurn: number,
    visitorType: string,
    messageLength: number,
  ) =>
    trackEvent("application_turn", {
      application_turn_number: applicationTurn,
      visitor_type: visitorType,
      message_length: messageLength,
    }),

  applicationSubmitShown: (visitorType: string, applicationTurns: number) =>
    trackEvent("application_submit_shown", {
      visitor_type: visitorType,
      application_turns: applicationTurns,
    }),

  applicationSubmitted: (
    visitorType: string,
    applicationTurns: number,
    fitScore: number,
    emailDomainTld: string,
    hasPortfolioUrl: boolean,
  ) =>
    trackEvent("application_submitted", {
      visitor_type: visitorType,
      application_turns: applicationTurns,
      fit_score: fitScore,
      email_domain_tld: emailDomainTld,
      has_portfolio_url: hasPortfolioUrl,
    }),

  errorShown: (errorType: string, turnNumber: number) =>
    trackEvent("error_shown", {
      error_type: errorType,
      turn_number: turnNumber,
    }),
};
