// ui/hud.ts
// Persistent "Step N of 7" progress HUD, plus the lobby-wait / token-called
// banners. The 10 JourneyState values are grouped into 7 visitor-facing
// steps (e.g. LOBBY_WAITING and TOKEN_CALLED are both "waiting to be
// called") since that's what a visitor actually perceives as one step.

import { BRAND_ACCENT, BRAND_BG, BRAND_TEXT } from "../theme";
import { JourneyState, onJourneyChange, getJourney, type JourneyData } from "../state/journeyState";

const STEP_GROUPS: Array<{ label: string; states: JourneyState[] }> = [
  { label: "Welcome", states: [JourneyState.EXTERIOR, JourneyState.RECEPTION] },
  { label: "Get your token", states: [JourneyState.TOKEN_ISSUED] },
  { label: "Waiting to be called", states: [JourneyState.LOBBY_WAITING, JourneyState.TOKEN_CALLED] },
  { label: "Talk to a specialist", states: [JourneyState.POD_CONVERSATION] },
  { label: "Review your quote", states: [JourneyState.QUOTE_GENERATED] },
  { label: "Sign the agreement", states: [JourneyState.AGREEMENT_SIGNED] },
  { label: "Payment & kickoff", states: [JourneyState.PAYMENT_COMPLETE] },
];

let hudEl: HTMLDivElement | null = null;
let bannerEl: HTMLDivElement | null = null;
let bannerHideTimer: number | undefined;

function ensureHud(): HTMLDivElement {
  if (hudEl) return hudEl;
  hudEl = document.createElement("div");
  hudEl.id = "journeyHud";
  Object.assign(hudEl.style, {
    position: "fixed",
    top: "16px",
    left: "16px",
    padding: "8px 14px",
    background: BRAND_BG,
    border: `1px solid ${BRAND_ACCENT}55`,
    borderRadius: "8px",
    color: BRAND_TEXT,
    fontFamily: "sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: "950",
  } as CSSStyleDeclaration);
  document.body.appendChild(hudEl);
  return hudEl;
}

function renderHud(journey: JourneyData): void {
  const el = ensureHud();
  if (journey.state === JourneyState.EXIT) {
    el.textContent = "Journey complete — resetting for a new visit...";
    return;
  }
  const idx = STEP_GROUPS.findIndex((g) => g.states.includes(journey.state));
  const stepNum = idx === -1 ? 1 : idx + 1;
  const label = idx === -1 ? "Welcome" : STEP_GROUPS[idx].label;
  el.textContent = `Step ${stepNum} of ${STEP_GROUPS.length}: ${label}`;
}

export function initHud(): void {
  renderHud(getJourney());
  onJourneyChange(renderHud);
}

function ensureBanner(): HTMLDivElement {
  if (bannerEl) return bannerEl;
  bannerEl = document.createElement("div");
  bannerEl.id = "journeyBanner";
  Object.assign(bannerEl.style, {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 22px",
    background: BRAND_ACCENT,
    color: "#fff",
    borderRadius: "8px",
    fontFamily: "sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    zIndex: "960",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    display: "none",
  } as CSSStyleDeclaration);
  document.body.appendChild(bannerEl);
  return bannerEl;
}

/** durationMs = 0 means the banner stays until replaced/hidden explicitly. */
function showBanner(text: string, durationMs: number): void {
  const el = ensureBanner();
  el.textContent = text;
  el.style.display = "block";
  if (bannerHideTimer) window.clearTimeout(bannerHideTimer);
  if (durationMs > 0) {
    bannerHideTimer = window.setTimeout(() => {
      el.style.display = "none";
    }, durationMs);
  }
}

export function showWaitingBanner(token: string, department: string): void {
  showBanner(`Waiting... token ${token} for ${department}`, 0);
}

export function showCalledBanner(token: string, department: string): void {
  showBanner(`Token ${token}, please proceed to ${department} Pod`, 4000);
}

export function hideBanner(): void {
  const el = ensureBanner();
  el.style.display = "none";
}
