// ui/kickoffPanel.ts
// Journey summary (token, department, signed name, quote, paid status) +
// "Exit" button. Exit transitions to EXIT, appends the completed journey
// to visitHistory, and resets to EXTERIOR for a fresh visit — the actual
// scene reversal (back to the exterior zone) is handled reactively in
// main.ts, which watches for the journey re-entering EXTERIOR.

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";
import { getJourney, transitionTo, resetForNewVisit, JourneyState } from "../state/journeyState";
import { closeChat } from "./chat";

let panel: HTMLDivElement | null = null;

function ensurePanel(): HTMLDivElement {
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "kickoffPanel";
  Object.assign(panel.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "380px",
    display: "none",
    flexDirection: "column",
    gap: "10px",
    background: BRAND_SURFACE,
    border: `1px solid ${BRAND_ACCENT}55`,
    borderRadius: "14px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
    padding: "22px",
    fontFamily: "sans-serif",
    color: BRAND_TEXT,
    zIndex: "970",
  } as CSSStyleDeclaration);
  document.body.appendChild(panel);
  return panel;
}

function row(label: string, value: string): HTMLDivElement {
  const r = document.createElement("div");
  Object.assign(r.style, {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "6px 0",
    borderBottom: `1px solid ${BRAND_TEXT_MUTED}22`,
  } as CSSStyleDeclaration);
  const l = document.createElement("span");
  l.textContent = label;
  l.style.color = BRAND_TEXT_MUTED;
  const v = document.createElement("span");
  v.textContent = value;
  v.style.fontWeight = "600";
  r.appendChild(l);
  r.appendChild(v);
  return r;
}

export function openKickoffPanel(): void {
  const el = ensurePanel();
  const journey = getJourney();
  el.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "You're all set!";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "800", marginBottom: "4px" } as CSSStyleDeclaration);
  el.appendChild(title);

  el.appendChild(row("Token", journey.token ?? "-"));
  el.appendChild(row("Department", journey.department ?? "-"));
  el.appendChild(row("Signed by", journey.signature?.name ?? "-"));
  el.appendChild(row("Service", journey.quote?.service ?? "-"));
  el.appendChild(row("Estimate", journey.quote?.estimatedRange ?? "-"));
  el.appendChild(row("Paid", journey.paidAt ? "Yes" : "No"));

  const nextSteps = document.createElement("div");
  nextSteps.textContent = journey.quote?.nextSteps ?? "";
  Object.assign(nextSteps.style, {
    fontSize: "12px",
    color: BRAND_TEXT_MUTED,
    background: BRAND_BG,
    padding: "8px 10px",
    borderRadius: "8px",
    marginTop: "6px",
  } as CSSStyleDeclaration);
  el.appendChild(nextSteps);

  const exitBtn = document.createElement("button");
  exitBtn.textContent = "Exit";
  Object.assign(exitBtn.style, {
    marginTop: "10px",
    background: BRAND_ACCENT,
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  } as CSSStyleDeclaration);
  exitBtn.onclick = () => {
    closeChat();
    closeKickoffPanel();
    transitionTo(JourneyState.EXIT);
    resetForNewVisit();
  };
  el.appendChild(exitBtn);

  el.style.display = "flex";
}

export function closeKickoffPanel(): void {
  if (panel) panel.style.display = "none";
}
