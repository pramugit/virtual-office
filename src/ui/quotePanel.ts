// ui/quotePanel.ts
// Displays the stub quote (state/generateQuote.ts) with a "Proceed to
// agreement" button.

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";
import { getJourney } from "../state/journeyState";
import { openAgreementPanel } from "./agreementPanel";

let panel: HTMLDivElement | null = null;

function ensurePanel(): HTMLDivElement {
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "quotePanel";
  Object.assign(panel.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "380px",
    display: "none",
    flexDirection: "column",
    gap: "12px",
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

export function openQuotePanel(): void {
  const el = ensurePanel();
  const journey = getJourney();
  const quote = journey.quote;

  el.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "Your Proposal";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "800" } as CSSStyleDeclaration);
  el.appendChild(title);

  if (quote) {
    const service = document.createElement("div");
    service.textContent = quote.service;
    Object.assign(service.style, { fontSize: "15px", fontWeight: "700", color: BRAND_ACCENT } as CSSStyleDeclaration);
    el.appendChild(service);

    const range = document.createElement("div");
    range.textContent = `Estimated: ${quote.estimatedRange}`;
    Object.assign(range.style, { fontSize: "14px" } as CSSStyleDeclaration);
    el.appendChild(range);

    const next = document.createElement("div");
    next.textContent = quote.nextSteps;
    Object.assign(next.style, {
      fontSize: "13px",
      color: BRAND_TEXT_MUTED,
      lineHeight: "1.5",
      background: BRAND_BG,
      padding: "10px 12px",
      borderRadius: "8px",
    } as CSSStyleDeclaration);
    el.appendChild(next);
  }

  const proceedBtn = document.createElement("button");
  proceedBtn.textContent = "Proceed to agreement";
  Object.assign(proceedBtn.style, {
    marginTop: "6px",
    background: BRAND_ACCENT,
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  } as CSSStyleDeclaration);
  proceedBtn.onclick = () => {
    closeQuotePanel();
    openAgreementPanel();
  };
  el.appendChild(proceedBtn);

  el.style.display = "flex";
}

export function closeQuotePanel(): void {
  if (panel) panel.style.display = "none";
}
