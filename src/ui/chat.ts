// ui/chat.ts
// A simple DOM-based chat panel (easier to style/test than Babylon GUI for
// text-heavy UI). openChat() opens it with a title + opening greeting;
// sendMessage wiring below is a placeholder that Phase 4 replaces with a
// call into ai/getAIResponse.ts — see the comment on `respond`.

import { BRAND_ACCENT, BRAND_BG, BRAND_SURFACE, BRAND_TEXT, BRAND_TEXT_MUTED } from "../theme";

export interface QuickSelectOption {
  label: string;
  onSelect: () => void;
}

export interface ChatOptions {
  title: string;
  department: string;
  greeting: string;
  /**
   * If set, the panel opens showing these as large tappable buttons instead
   * of the free-text input — used for the reception intake (Improvement 3),
   * so the visitor doesn't have to type anything to get a token. The input
   * row reappears once a button is picked. Pod consultant chats don't set
   * this, so they behave exactly as before.
   */
  quickSelect?: QuickSelectOption[];
}

// Phase 4 replaces this with a call to ai/getAIResponse.ts's
// getAIResponse(userText, { department }). Kept as a swappable function
// reference so that wiring is a one-line change, not a chat.ts rewrite.
type Responder = (userText: string, department: string) => Promise<string>;
let respond: Responder = async (_userText, _department) => {
  return "Got it — tell me a bit more.";
};

export function setChatResponder(fn: Responder): void {
  respond = fn;
}

let panel: HTMLDivElement | null = null;
let messagesEl: HTMLDivElement | null = null;
let inputRowEl: HTMLDivElement | null = null;
let quickSelectRowEl: HTMLDivElement | null = null;
let currentDepartment = "general";

function ensurePanel(): void {
  if (panel) return;

  panel = document.createElement("div");
  panel.id = "chatPanel";
  Object.assign(panel.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "340px",
    maxHeight: "70vh",
    display: "none",
    flexDirection: "column",
    background: BRAND_SURFACE,
    border: `1px solid ${BRAND_ACCENT}55`,
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    fontFamily: "sans-serif",
    zIndex: "900",
    overflow: "hidden",
  } as CSSStyleDeclaration);

  const header = document.createElement("div");
  header.id = "chatPanelHeader";
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    background: BRAND_BG,
    color: BRAND_TEXT,
    fontWeight: "700",
    fontSize: "14px",
  } as CSSStyleDeclaration);

  const titleSpan = document.createElement("span");
  titleSpan.id = "chatPanelTitle";
  header.appendChild(titleSpan);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    background: "transparent",
    border: "none",
    color: BRAND_TEXT_MUTED,
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: "1",
  } as CSSStyleDeclaration);
  closeBtn.onclick = () => closeChat();
  header.appendChild(closeBtn);

  messagesEl = document.createElement("div");
  messagesEl.id = "chatPanelMessages";
  Object.assign(messagesEl.style, {
    flex: "1",
    overflowY: "auto",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minHeight: "160px",
    maxHeight: "45vh",
  } as CSSStyleDeclaration);

  quickSelectRowEl = document.createElement("div");
  quickSelectRowEl.id = "chatPanelQuickSelect";
  Object.assign(quickSelectRowEl.style, {
    display: "none",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    padding: "0 14px 14px",
  } as CSSStyleDeclaration);

  const inputRow = document.createElement("div");
  inputRowEl = inputRow;
  Object.assign(inputRow.style, {
    display: "flex",
    borderTop: `1px solid ${BRAND_TEXT_MUTED}33`,
    padding: "10px",
    gap: "8px",
  } as CSSStyleDeclaration);

  const input = document.createElement("input");
  input.id = "chatPanelInput";
  input.type = "text";
  input.placeholder = "Type a message...";
  Object.assign(input.style, {
    flex: "1",
    background: BRAND_BG,
    border: `1px solid ${BRAND_TEXT_MUTED}44`,
    borderRadius: "8px",
    padding: "8px 10px",
    color: BRAND_TEXT,
    fontSize: "13px",
    outline: "none",
  } as CSSStyleDeclaration);

  const sendBtn = document.createElement("button");
  sendBtn.id = "chatPanelSend";
  sendBtn.textContent = "Send";
  Object.assign(sendBtn.style, {
    background: BRAND_ACCENT,
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  } as CSSStyleDeclaration);

  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    appendMessage("user", text);
    input.value = "";
    respond(text, currentDepartment).then((reply) => appendMessage("bot", reply));
  };
  sendBtn.onclick = send;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(messagesEl);
  panel.appendChild(quickSelectRowEl);
  panel.appendChild(inputRow);
  document.body.appendChild(panel);
}

function appendMessage(from: "user" | "bot", text: string): void {
  if (!messagesEl) return;
  const bubble = document.createElement("div");
  bubble.textContent = text;
  bubble.dataset.from = from;
  Object.assign(bubble.style, {
    alignSelf: from === "user" ? "flex-end" : "flex-start",
    background: from === "user" ? BRAND_ACCENT : BRAND_BG,
    color: from === "user" ? "#fff" : BRAND_TEXT,
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.4",
    maxWidth: "85%",
  } as CSSStyleDeclaration);
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/** Appends a bot message to whichever chat is currently open. */
export function appendBotMessage(text: string): void {
  appendMessage("bot", text);
}

function showQuickSelect(options: QuickSelectOption[]): void {
  if (!quickSelectRowEl || !inputRowEl) return;
  quickSelectRowEl.innerHTML = "";
  for (const option of options) {
    const btn = document.createElement("button");
    btn.textContent = option.label;
    Object.assign(btn.style, {
      background: BRAND_ACCENT,
      border: "none",
      borderRadius: "8px",
      padding: "14px 10px",
      color: "#fff",
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
      textAlign: "center",
    } as CSSStyleDeclaration);
    btn.onclick = () => {
      option.onSelect();
      hideQuickSelect();
    };
    quickSelectRowEl.appendChild(btn);
  }
  quickSelectRowEl.style.display = "grid";
  inputRowEl.style.display = "none";
}

function hideQuickSelect(): void {
  if (!quickSelectRowEl || !inputRowEl) return;
  quickSelectRowEl.style.display = "none";
  quickSelectRowEl.innerHTML = "";
  inputRowEl.style.display = "flex";
}

export function openChat(options: ChatOptions): void {
  ensurePanel();
  if (!panel || !messagesEl) return;
  currentDepartment = options.department;
  const titleEl = document.getElementById("chatPanelTitle");
  if (titleEl) titleEl.textContent = options.title;
  messagesEl.innerHTML = "";
  panel.style.display = "flex";
  appendMessage("bot", options.greeting);

  if (options.quickSelect && options.quickSelect.length > 0) {
    showQuickSelect(options.quickSelect);
  } else {
    hideQuickSelect();
  }
}

export function closeChat(): void {
  if (panel) panel.style.display = "none";
}

export function isChatOpen(): boolean {
  return !!panel && panel.style.display !== "none";
}
