# RenderedBy Virtual Office

A 3D virtual office for [RenderedBy](https://renderedby.com), built with Vite +
TypeScript + Babylon.js. Visitors walk through an entrance, get a token from
reception, wait to be called to the right consultant pod (Sales & Marketing,
Cloud/DevOps, Security/DevSecOps, or GMS Product), have a short chat, and walk
away with a stub quote, e-signed agreement, and "paid" confirmation.

This is a client-only prototype — there is no backend and no paid services.
Every place a real integration would eventually go is stubbed and clearly
commented with what it becomes.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. Click the door to go inside, click a pod's sign
in reception to request a token, wait for the "please proceed" banner, then
click that pod's consultant to chat.

## Current scope

- **Scene**: exterior (ground, building, gate, clickable door) → reception
  (desk, chairs, logo sign, "monitor" placeholder) → 4 consultant pods, an
  open office, and a conference room, each a self-contained room reached by
  clicking a nav marker in reception.
- **Characters**: a reusable `createCharacter(config, scene)` factory drives
  the full roster — receptionist, 4 pod consultants, 4 engineers, 2
  managers, 2 directors, and a security guard — from data in
  `characters/characterConfig.ts`. Real rigged/animated models are a later
  pass; today it's capsule bodies + sphere heads + a colored "badge."
- **Brand theme**: `theme.ts` holds colors extracted from renderedby.com's
  actual rendered CSS (not guessed) — every mesh/UI color in the project
  sources from there.
- **Chat**: a DOM-based chat panel (`ui/chat.ts`) opens on interactive
  characters. Replies come from `ai/getAIResponse.ts`, a keyword-matched
  canned-response stub — **no AI API call is made**. The real build calls
  Claude Haiku through a server-side proxy; the API key must never be
  called directly from browser code.
- **Journey state machine**: `state/journeyState.ts` is the single source
  of truth (persisted to `localStorage`) for the visitor's progress —
  token issuance, the simulated lobby wait, pod gating (wrong-pod clicks
  show a toast instead of letting you in), quote generation after 3 chat
  exchanges, a stub e-signature, a stub "payment," and a kickoff summary.
  A persistent HUD shows "Step N of 7." Exiting resets the scene for a
  fresh visit and appends the completed journey to a `visitHistory` array
  in `localStorage` rather than deleting it.
- **No real payment, e-signature, or network backend calls anywhere** —
  every one of those is a client-side stub with a comment on what replaces
  it.

## Next steps

In order:

1. **Real 3D assets** — replace the capsule/sphere placeholder characters
   and boxy furniture with real models from
   [Kenney.nl](https://kenney.nl), [Quaternius](https://quaternius.com), or
   rigged/animated humanoids via [Mixamo](https://www.mixamo.com).
2. **Click-to-move navigation** — replace the instant zone-to-zone camera
   cuts with an actual walking/pathfinding camera (Babylon's navigation
   mesh plugin or a simple tween-based walk).
3. **A Cloudflare Worker proxy** wiring `ai/getAIResponse.ts` to real
   Claude Haiku — the Worker holds the API key and forwards
   `{ userText, department, conversationHistory }` to Anthropic; the
   browser never sees the key.
4. **A Supabase-backed session/queue service** replacing the
   `localStorage` + `setTimeout` stand-ins in `journeyState.ts` — real
   multi-visitor token queues, a real "called" signal instead of a timer,
   and journey data that survives more than one browser.
5. **Real Stripe + e-signature** — swap `ui/paymentPanel.ts` for Stripe
   Checkout/Payment Intents, and `ui/agreementPanel.ts` for an embedded
   DocuSign/HelloSign flow. Never collect card details directly in client
   code.
6. **Deploy to Cloudflare Pages.**
