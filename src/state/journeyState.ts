// state/journeyState.ts
// Single source of truth for the visitor's journey through the office.
// Persisted to localStorage on every transition. Token generation lives
// here (nowhere else generates one) so it can never drift out of sync
// with the rest of the journey data.
//
// Reception issues and calls a token in the same step (issueToken ->
// TOKEN_CALLED, no wait) — a real build would still front this with a
// Supabase-backed session/queue subscription if multiple visitors ever
// need to queue for the same department. See README "Next steps".

import { generateQuote, type Quote } from "./generateQuote";

// A plain `enum` isn't allowed under this project's erasableSyntaxOnly
// tsconfig setting (enums emit runtime code, which that flag forbids) — this
// const-object + union-type pair is the erasable equivalent, and supports
// the exact same `JourneyState.EXTERIOR` usage everywhere else.
export const JourneyState = {
  EXTERIOR: "EXTERIOR",
  RECEPTION: "RECEPTION",
  TOKEN_ISSUED: "TOKEN_ISSUED",
  LOBBY_WAITING: "LOBBY_WAITING",
  TOKEN_CALLED: "TOKEN_CALLED",
  POD_CONVERSATION: "POD_CONVERSATION",
  QUOTE_GENERATED: "QUOTE_GENERATED",
  AGREEMENT_SIGNED: "AGREEMENT_SIGNED",
  PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
  EXIT: "EXIT",
} as const;
export type JourneyState = (typeof JourneyState)[keyof typeof JourneyState];

export interface Signature {
  name: string;
  phone: string;
  timestamp: string;
}

/** Collected by reception before a visitor is sent through to any department. */
export interface VisitorDetails {
  name: string;
  phone: string;
  email: string;
}

export interface JourneyData {
  state: JourneyState;
  token: string | null;
  department: string | null;
  visitorDetails: VisitorDetails | null;
  quote: Quote | null;
  signature: Signature | null;
  paidAt: string | null;
  /** File name of the uploaded payment slip — never the file contents (no backend yet). */
  paymentSlipFileName: string | null;
}

const STORAGE_KEY = "renderedby_journey";
const HISTORY_KEY = "renderedby_visitHistory";

function freshJourney(): JourneyData {
  return {
    state: JourneyState.EXTERIOR,
    token: null,
    department: null,
    visitorDetails: null,
    quote: null,
    signature: null,
    paidAt: null,
    paymentSlipFileName: null,
  };
}

function loadJourney(): JourneyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as JourneyData;
  } catch {
    // Corrupt/unavailable localStorage — fall back to a fresh journey.
  }
  return freshJourney();
}

let journey: JourneyData = loadJourney();

// Exchange count within the current pod conversation. Deliberately not
// persisted — it's mid-conversation UI state, not journey data.
let exchangeCount = 0;

type Listener = (journey: JourneyData) => void;
const listeners: Listener[] = [];

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch {
    // Best-effort persistence; a full/unavailable localStorage shouldn't crash the app.
  }
}

function notify(): void {
  for (const fn of listeners) fn(journey);
}

export function onJourneyChange(fn: Listener): void {
  listeners.push(fn);
}

export function getJourney(): JourneyData {
  return journey;
}

export function transitionTo(newState: JourneyState): void {
  journey = { ...journey, state: newState };
  persist();
  console.log(`[journeyState] -> ${newState}`, journey);
  notify();
}

function randomToken(department: string): string {
  const prefix = (department[0] ?? "X").toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}

/** Issues a token for a department and transitions to TOKEN_ISSUED. */
export function issueToken(department: string): string {
  const token = randomToken(department);
  journey = { ...journey, token, department };
  persist();
  transitionTo(JourneyState.TOKEN_ISSUED);
  return token;
}

export function setVisitorDetails(details: VisitorDetails): void {
  journey = { ...journey, visitorDetails: details };
  persist();
  notify();
}

export function setQuoteForCurrentDepartment(): Quote {
  const quote = generateQuote(journey.department ?? "sales");
  journey = { ...journey, quote };
  persist();
  return quote;
}

export function setSignature(signature: Signature): void {
  journey = { ...journey, signature };
  persist();
}

export function markPaid(paymentSlipFileName: string | null = null): void {
  journey = { ...journey, paidAt: new Date().toISOString(), paymentSlipFileName };
  persist();
}

export function incrementExchangeCount(): number {
  exchangeCount += 1;
  return exchangeCount;
}

export function resetExchangeCount(): void {
  exchangeCount = 0;
}

/** Appends the just-completed journey to visitHistory, then resets for a fresh visit. */
export function resetForNewVisit(): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: JourneyData[] = raw ? JSON.parse(raw) : [];
    history.push(journey);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Best-effort history; losing it shouldn't block starting a fresh visit.
  }
  journey = freshJourney();
  exchangeCount = 0;
  persist();
  console.log("[journeyState] reset for new visit", journey);
  notify();
}

export function getVisitHistory(): JourneyData[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as JourneyData[]) : [];
  } catch {
    return [];
  }
}
