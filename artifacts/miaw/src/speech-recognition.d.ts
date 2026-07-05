/**
 * Web Speech API — minimal type declarations for SpeechRecognition.
 *
 * TypeScript 5.9's lib.dom.d.ts includes SpeechRecognitionAlternative,
 * SpeechRecognitionResult, and SpeechRecognitionResultList, but does NOT
 * declare the main SpeechRecognition interface or its event types.
 * These are declared here to fill the gap without a third-party @types package.
 *
 * Spec: https://wicg.github.io/speech-api/
 * Browser support: Chrome ✅, Edge ✅, Safari 14.5+ ✅ (webkit prefix), Firefox ❌
 */

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;

  abort(): void;
  start(): void;
  stop(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
