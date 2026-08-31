// ui/paymentPanel.ts
// Bank-transfer-only stub checkout: placeholder bank details, an upload
// for the payment slip, and a "Submit payment slip" button that only
// enables once a file is chosen.
//
// Real build: the uploaded slip should go to actual storage (e.g. Supabase
// Storage), and "payment successful" should wait for manual or automated
// verification of that slip — not be confirmed immediately client-side the
// way this stub does. This stub only ever stores the file's name (never
// its contents — there's no backend yet to store them).

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";
import { getJourney, markPaid, transitionTo, JourneyState } from "../state/journeyState";
import { openKickoffPanel } from "./kickoffPanel";

// Placeholder bank details — the client should replace these with real
// account information before this ever goes in front of an actual customer.
const BANK_DETAILS = {
  bankName: "First National Bank (placeholder)",
  accountName: "RenderedBy Pvt Ltd (placeholder)",
  accountNumber: "0000-1234-5678-90 (placeholder)",
};

let panel: HTMLDivElement | null = null;

function ensurePanel(): HTMLDivElement {
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "paymentPanel";
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

function detailRow(label: string, value: string): HTMLDivElement {
  const row = document.createElement("div");
  Object.assign(row.style, {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    padding: "4px 0",
  } as CSSStyleDeclaration);
  const l = document.createElement("span");
  l.textContent = label;
  l.style.color = BRAND_TEXT_MUTED;
  const v = document.createElement("span");
  v.textContent = value;
  v.style.fontWeight = "600";
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

export function openPaymentPanel(): void {
  const el = ensurePanel();
  const journey = getJourney();
  const quote = journey.quote;
  el.innerHTML = "";

  const title = document.createElement("div");
  title.textContent = "Payment — Bank Transfer";
  Object.assign(title.style, { fontSize: "18px", fontWeight: "800" } as CSSStyleDeclaration);
  el.appendChild(title);

  const amount = document.createElement("div");
  amount.textContent = quote ? `Amount due: ${quote.estimatedRange}` : "Estimated amount unavailable";
  Object.assign(amount.style, {
    fontSize: "14px",
    background: BRAND_BG,
    padding: "8px 10px",
    borderRadius: "8px",
  } as CSSStyleDeclaration);
  el.appendChild(amount);

  const bankBox = document.createElement("div");
  Object.assign(bankBox.style, {
    background: BRAND_BG,
    borderRadius: "8px",
    padding: "10px 12px",
  } as CSSStyleDeclaration);
  bankBox.appendChild(detailRow("Bank", BANK_DETAILS.bankName));
  bankBox.appendChild(detailRow("Account name", BANK_DETAILS.accountName));
  bankBox.appendChild(detailRow("Account number", BANK_DETAILS.accountNumber));
  bankBox.appendChild(detailRow("Reference", journey.token ?? "-"));
  el.appendChild(bankBox);

  const note = document.createElement("div");
  note.textContent =
    "Stub checkout for this pass — placeholder bank details above. The real build swaps this for actual account info, stores the slip in real storage, and waits for verification before confirming payment.";
  Object.assign(note.style, { fontSize: "11px", color: BRAND_TEXT_MUTED, fontStyle: "italic" } as CSSStyleDeclaration);
  el.appendChild(note);

  const uploadLabel = document.createElement("div");
  uploadLabel.textContent = "Upload your payment slip";
  Object.assign(uploadLabel.style, { fontSize: "13px", fontWeight: "700", marginTop: "4px" } as CSSStyleDeclaration);
  el.appendChild(uploadLabel);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,application/pdf";
  Object.assign(fileInput.style, {
    fontSize: "12px",
    color: BRAND_TEXT_MUTED,
  } as CSSStyleDeclaration);
  el.appendChild(fileInput);

  const statusMsg = document.createElement("div");
  Object.assign(statusMsg.style, {
    fontSize: "13px",
    fontWeight: "700",
    display: "none",
  } as CSSStyleDeclaration);
  el.appendChild(statusMsg);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit payment slip";
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
    opacity: "0.5",
  } as CSSStyleDeclaration);
  submitBtn.disabled = true;

  fileInput.addEventListener("change", () => {
    const hasFile = !!fileInput.files && fileInput.files.length > 0;
    submitBtn.disabled = !hasFile;
    submitBtn.style.opacity = hasFile ? "1" : "0.5";
  });

  submitBtn.onclick = () => {
    if (submitBtn.disabled || !fileInput.files || fileInput.files.length === 0) return;
    const fileName = fileInput.files[0].name;
    submitBtn.disabled = true;
    fileInput.disabled = true;

    // Real build: upload `fileInput.files[0]` to Supabase Storage (or
    // similar), and only transition to PAYMENT_COMPLETE once the slip has
    // been manually or automatically verified — not immediately, as here.
    markPaid(fileName);
    transitionTo(JourneyState.PAYMENT_COMPLETE);

    statusMsg.textContent = "Your payment is successful";
    statusMsg.style.color = BRAND_ACCENT;
    statusMsg.style.display = "block";

    window.setTimeout(() => {
      closePaymentPanel();
      openKickoffPanel();
    }, 1500);
  };
  el.appendChild(submitBtn);

  el.style.display = "flex";
}

export function closePaymentPanel(): void {
  if (panel) panel.style.display = "none";
}
