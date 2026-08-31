// state/generateQuote.ts
// Stub quote generator — canned, plausible content per department. No AI
// call needed; the real build could eventually make this data-driven, but
// a rough estimate doesn't need an LLM.

export interface Quote {
  service: string;
  estimatedRange: string;
  nextSteps: string;
}

const QUOTES: Record<string, Quote> = {
  cloud: {
    service: "Cloud Migration & Cost Optimization",
    estimatedRange: "$8,000 - $25,000",
    nextSteps:
      "We'll start with a 1-week infrastructure assessment, then propose a phased migration/optimization plan with fixed milestones.",
  },
  security: {
    service: "Security Audit & DevSecOps Hardening",
    estimatedRange: "$6,000 - $20,000",
    nextSteps:
      "We'll kick off with a scoping call to confirm compliance targets, then run the audit and deliver a prioritized remediation plan.",
  },
  software: {
    service: "Software Implementation — including Garage Management System (GMS)",
    estimatedRange: "$4,000 - $15,000 + monthly subscription",
    nextSteps:
      "We'll confirm which of our products fit (GMS and/or others), configure it for your workflow, import existing data, and train your team before go-live.",
  },
  sales: {
    service: "RenderedBy Engagement — General Scope",
    estimatedRange: "$5,000 - $30,000",
    nextSteps:
      "We'll schedule a short discovery call to nail down scope, then follow up with a tailored proposal within 2 business days.",
  },
};

export function generateQuote(department: string): Quote {
  return QUOTES[department.toLowerCase()] ?? QUOTES.sales;
}
