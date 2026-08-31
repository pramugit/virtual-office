// ui/agreementPanel.ts
// Stub e-sign: real-looking Terms & Conditions text (placeholder copy —
// see PLACEHOLDER_TERMS below), a full name + phone number, and two
// sequential checkboxes (must read before you can agree). "Sign Agreement"
// stays disabled until everything is filled/checked. Real build swaps this
// whole panel for DocuSign/HelloSign — this only ever stores
// { name, phone, timestamp } locally, never a real signature.

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";
import { getJourney, setSignature, transitionTo, JourneyState } from "../state/journeyState";
import { openPaymentPanel } from "./paymentPanel";

// Placeholder copy only — the client should replace this with real,
// lawyer-reviewed Terms & Conditions before this ever goes in front of an
// actual customer.
const PLACEHOLDER_TERMS = `1. Scope of Service
RenderedBy agrees to provide the software/consulting services described in the accompanying proposal. Any work outside that scope requires a separate written agreement.

2. Payment Terms
Fees are due per the schedule in the proposal. Unless otherwise agreed, an initial deposit is due before work begins, with the remaining balance due on delivery or per agreed milestones.

3. Cancellation
Either party may cancel this engagement with 14 days' written notice. Work completed up to the cancellation date is billable; any deposit for undelivered work is refunded on a pro-rata basis.

4. Confidentiality
Both parties agree to keep confidential information (business plans, source code, customer data, credentials) private and to use it only for the purposes of this engagement.

This is placeholder text for prototype purposes only and is not a binding legal document.`;

let panel: HTMLDivElement | null = null;

function ensurePanel(): HTMLDivElement {
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "agreementPanel";
  Object.assign(panel.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "420px",
    maxHeight: "85vh",
    overflowY: "auto",
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

// Basic format check per spec: digits, spaces, and + only, at least 7 digits.
function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^[\d\s+]+$/.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) ?? []).length;
  return digitCount >= 7;
}

export function openAgreementPanel(): void {
  const el = ensurePanel();
  const journey = getJourney();
  const quote = journey.quote;
  el.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "Sign Agreement";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "800" } as CSSStyleDeclaration);
  el.appendChild(title);

  if (quote) {
    const summary = document.createElement("div");
    summary.textContent = `${quote.service} — ${quote.estimatedRange}`;
    Object.assign(summary.style, {
      fontSize: "13px",
      color: BRAND_TEXT_MUTED,
      background: BRAND_BG,
      padding: "8px 10px",
      borderRadius: "8px",
    } as CSSStyleDeclaration);
    el.appendChild(summary);
  }

  // Real build: DocuSign / HelloSign embedded signing, not a text input,
  // and real legal Terms & Conditions, not the placeholder copy below.
  const note = document.createElement("div");
  note.textContent = "Stub e-sign for this pass — the real build swaps this for DocuSign/HelloSign.";
  Object.assign(note.style, { fontSize: "11px", color: BRAND_TEXT_MUTED, fontStyle: "italic" } as CSSStyleDeclaration);
  el.appendChild(note);

  const termsLabel = document.createElement("div");
  termsLabel.textContent = "Terms & Conditions";
  Object.assign(termsLabel.style, { fontSize: "13px", fontWeight: "700" } as CSSStyleDeclaration);
  el.appendChild(termsLabel);

  const termsBox = document.createElement("div");
  termsBox.textContent = PLACEHOLDER_TERMS;
  Object.assign(termsBox.style, {
    whiteSpace: "pre-wrap",
    fontSize: "12px",
    lineHeight: "1.5",
    color: BRAND_TEXT_MUTED,
    background: BRAND_BG,
    padding: "10px 12px",
    borderRadius: "8px",
    maxHeight: "140px",
    overflowY: "auto",
    border: `1px solid ${BRAND_TEXT_MUTED}33`,
  } as CSSStyleDeclaration);
  el.appendChild(termsBox);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Your full name";
  Object.assign(nameInput.style, {
    background: BRAND_BG,
    border: `1px solid ${BRAND_TEXT_MUTED}44`,
    borderRadius: "8px",
    padding: "9px 10px",
    color: BRAND_TEXT,
    fontSize: "13px",
    outline: "none",
  } as CSSStyleDeclaration);
  el.appendChild(nameInput);

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.placeholder = "Phone number (e.g. +1 555 123 4567)";
  Object.assign(phoneInput.style, {
    background: BRAND_BG,
    border: `1px solid ${BRAND_TEXT_MUTED}44`,
    borderRadius: "8px",
    padding: "9px 10px",
    color: BRAND_TEXT,
    fontSize: "13px",
    outline: "none",
  } as CSSStyleDeclaration);
  el.appendChild(phoneInput);

  const phoneError = document.createElement("div");
  phoneError.textContent = "Digits, spaces, and + only, at least 7 digits.";
  Object.assign(phoneError.style, {
    fontSize: "11px",
    color: BRAND_TEXT_MUTED,
    display: "none",
  } as CSSStyleDeclaration);
  el.appendChild(phoneError);

  const readRow = document.createElement("label");
  Object.assign(readRow.style, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: BRAND_TEXT_MUTED,
    cursor: "pointer",
  } as CSSStyleDeclaration);
  const readCheckbox = document.createElement("input");
  readCheckbox.type = "checkbox";
  readRow.appendChild(readCheckbox);
  readRow.appendChild(document.createTextNode("I have read the Terms and Conditions"));
  el.appendChild(readRow);

  const agreeRow = document.createElement("label");
  Object.assign(agreeRow.style, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: BRAND_TEXT_MUTED,
    cursor: "pointer",
  } as CSSStyleDeclaration);
  const agreeCheckbox = document.createElement("input");
  agreeCheckbox.type = "checkbox";
  agreeCheckbox.disabled = true;
  agreeRow.appendChild(agreeCheckbox);
  agreeRow.appendChild(document.createTextNode("I agree to the Terms and Conditions"));
  Object.assign(agreeRow.style, { opacity: "0.5" } as CSSStyleDeclaration);
  el.appendChild(agreeRow);

  const signBtn = document.createElement("button");
  signBtn.textContent = "Sign agreement";
  Object.assign(signBtn.style, {
    marginTop: "6px",
    background: BRAND_ACCENT,
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    opacity: "0.5",
  } as CSSStyleDeclaration);
  signBtn.disabled = true;

  function updateAgreeCheckbox(): void {
    agreeCheckbox.disabled = !readCheckbox.checked;
    agreeRow.style.opacity = readCheckbox.checked ? "1" : "0.5";
    if (!readCheckbox.checked) agreeCheckbox.checked = false;
    updateSignBtn();
  }

  function updateSignBtn(): void {
    const phoneValid = isValidPhone(phoneInput.value);
    phoneError.style.display = phoneInput.value.trim().length > 0 && !phoneValid ? "block" : "none";
    const ready =
      nameInput.value.trim().length > 0 &&
      phoneValid &&
      readCheckbox.checked &&
      agreeCheckbox.checked;
    signBtn.disabled = !ready;
    signBtn.style.opacity = ready ? "1" : "0.5";
  }

  nameInput.addEventListener("input", updateSignBtn);
  phoneInput.addEventListener("input", updateSignBtn);
  readCheckbox.addEventListener("change", updateAgreeCheckbox);
  agreeCheckbox.addEventListener("change", updateSignBtn);

  signBtn.onclick = () => {
    if (signBtn.disabled) return;
    setSignature({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      timestamp: new Date().toISOString(),
    });
    transitionTo(JourneyState.AGREEMENT_SIGNED);
    closeAgreementPanel();
    openPaymentPanel();
  };
  el.appendChild(signBtn);

  el.style.display = "flex";
}

export function closeAgreementPanel(): void {
  if (panel) panel.style.display = "none";
}
