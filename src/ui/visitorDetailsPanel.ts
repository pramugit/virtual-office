// ui/visitorDetailsPanel.ts
// Reception intake form: before a visitor can be sent through to any
// department (a consultant pod, open office, conference room, or the office
// cabins), reception collects name, phone number, and email. Stored in
// journeyState only — no backend, no network call.

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";
import { setVisitorDetails } from "../state/journeyState";

let panel: HTMLDivElement | null = null;

function ensurePanel(): HTMLDivElement {
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "visitorDetailsPanel";
  Object.assign(panel.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "360px",
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
    zIndex: "980",
  } as CSSStyleDeclaration);
  document.body.appendChild(panel);
  return panel;
}

// Same format check as agreementPanel's phone field: digits, spaces, and +
// only, at least 7 digits.
function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^[\d\s+]+$/.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) ?? []).length;
  return digitCount >= 7;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function styleInput(el: HTMLInputElement): void {
  Object.assign(el.style, {
    background: BRAND_BG,
    border: `1px solid ${BRAND_TEXT_MUTED}44`,
    borderRadius: "8px",
    padding: "9px 10px",
    color: BRAND_TEXT,
    fontSize: "13px",
    outline: "none",
  } as CSSStyleDeclaration);
}

/** Opens the intake form; calls onDone() only after valid details are saved. */
export function openVisitorDetailsPanel(onDone: () => void): void {
  const el = ensurePanel();
  el.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "Welcome to RenderedBy";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "800" } as CSSStyleDeclaration);
  el.appendChild(title);

  const note = document.createElement("div");
  note.textContent = "Before I send you through, could I get a few details?";
  Object.assign(note.style, { fontSize: "13px", color: BRAND_TEXT_MUTED } as CSSStyleDeclaration);
  el.appendChild(note);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Full name";
  styleInput(nameInput);
  el.appendChild(nameInput);

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.placeholder = "Phone number (e.g. +1 555 123 4567)";
  styleInput(phoneInput);
  el.appendChild(phoneInput);

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "Email address";
  styleInput(emailInput);
  el.appendChild(emailInput);

  const errorEl = document.createElement("div");
  errorEl.textContent = "Please enter your name, a valid phone number, and a valid email.";
  Object.assign(errorEl.style, {
    fontSize: "11px",
    color: BRAND_TEXT_MUTED,
    display: "none",
  } as CSSStyleDeclaration);
  el.appendChild(errorEl);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Continue";
  Object.assign(submitBtn.style, {
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

  submitBtn.onclick = () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    if (!name || !isValidPhone(phone) || !isValidEmail(email)) {
      errorEl.style.display = "block";
      return;
    }
    setVisitorDetails({ name, phone, email });
    closeVisitorDetailsPanel();
    onDone();
  };
  el.appendChild(submitBtn);

  el.style.display = "flex";
}

export function closeVisitorDetailsPanel(): void {
  if (panel) panel.style.display = "none";
}
