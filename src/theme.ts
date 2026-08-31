// theme.ts
// Brand palette extracted from https://renderedby.com (/, /services, /about)
// on 2026-08-25 by fetching the rendered HTML and its compiled Astro CSS
// bundle and reading the actual hex values used for backgrounds, buttons,
// and text — not guessed. Source values:
//   - Hero/page background:      #02020A  (style="background:#02020A")
//   - Alternate section bg:      #060612  (style="background:#060612", used
//                                 consistently across all three pages)
//   - .btn-primary / CTA:        linear-gradient(135deg,#1E6BC4,#18B4AD),
//                                 border/glow color rgb(41,136,230) = #2988E6
//   - .text-gradient (wordmark): #2988E6 -> #18B4AD -> #16B8A8
//   - Logo mark gradient:        #2988E6 -> #18B4AD (inline SVG in <header>)
//   - Body text:                 #ffffff (headings/buttons)
//   - Muted text:                text-slate-400 (#94a3b8), the most-used
//                                 muted-copy class across all three pages
//
// Every later phase must source colors from here — no new hardcoded colors.
//
// Phase 3 adds a few more named tones for the character roster's required
// variety (cooler/darker/warmer accents, formal grays). Every value below is
// still a real hex pulled from the site's CSS, not invented — see each
// comment for where it appears. GUARD_UNIFORM is the one deliberate
// exception: the roster spec calls for a uniform color "independent of the
// brand palette," so it's a plain navy, not sourced from the site.

import { Color3 } from "@babylonjs/core";

export const BRAND_BG = "#02020A";
export const BRAND_SURFACE = "#060612";
export const BRAND_ACCENT = "#2988E6";
export const BRAND_ACCENT_SECONDARY = "#18B4AD";
export const BRAND_TEXT = "#FFFFFF";
export const BRAND_TEXT_MUTED = "#94A3B8";
export const BRAND_CTA = "#2988E6";

// Cooler tone — sky blue used in .text-gradient-cyan (#18B4AD,#38BDF8,#6ee7b7).
export const BRAND_ACCENT_COOL = "#38BDF8";
// Darker/formal tone — the deep-blue start of the .btn-primary gradient.
export const BRAND_ACCENT_DARK = "#1E6BC4";
// Distinct warm accent — amber used repeatedly for feature icons/highlights.
export const BRAND_ACCENT_WARM = "#FBBF24";
// Formal gray tones — text-slate-600 / text-slate-700, both heavily used for
// body copy across all three fetched pages.
export const BRAND_FORMAL = "#475569";
export const BRAND_FORMAL_DARK = "#334155";
// Security guard uniform — intentionally brand-independent, per spec.
export const GUARD_UNIFORM = "#141B2E";

export function hexToColor3(hex: string): Color3 {
  return Color3.FromHexString(hex);
}
