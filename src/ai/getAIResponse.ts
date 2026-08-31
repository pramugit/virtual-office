// ai/getAIResponse.ts
//
// STUB — keyword-matched canned responses per department, no network call.
//
// The real build calls the Claude API (Claude Haiku) via a server-side
// proxy — e.g. a Cloudflare Worker that holds the API key and forwards
// { userText, department, conversationHistory } to Anthropic. The API key
// must NEVER be called directly from browser code: that would ship a
// secret to every visitor's devtools. See README "Next steps".

export interface AIResponseContext {
  department: string;
}

interface KeywordRule {
  keywords: string[];
  response: string;
}

const CLOUD_RULES: KeywordRule[] = [
  {
    keywords: ["cost", "bill", "expensive", "spend", "budget"],
    response:
      "Cost optimization is one of our most common engagements — we typically find 20-40% in savings through right-sizing, reserved capacity, and cleaning up idle resources. What cloud provider are you on?",
  },
  {
    keywords: ["aws", "azure", "gcp", "google cloud"],
    response:
      "We work across AWS, Azure, and GCP. Which one (or ones) are you running on today, and roughly how many services/environments are we talking about?",
  },
  {
    keywords: ["migrat", "move to the cloud", "on-prem", "on prem"],
    response:
      "Migrations are a specialty of ours — we usually start with an assessment of what's migrating, dependencies, and downtime tolerance before touching anything. What's driving the move?",
  },
  {
    keywords: ["ci/cd", "cicd", "pipeline", "deploy", "deployment"],
    response:
      "We build CI/CD pipelines with GitHub Actions, GitLab CI, or your existing tooling — automated tests, staged rollouts, the works. What does your deploy process look like right now?",
  },
  {
    keywords: ["kubernetes", "k8s", "docker", "container"],
    response:
      "We do a fair amount of container/Kubernetes work — cluster setup, cost tuning, and hardening. Are you already containerized, or is this greenfield?",
  },
];

const SECURITY_RULES: KeywordRule[] = [
  {
    keywords: ["audit", "assessment", "review"],
    response:
      "A security audit typically covers infrastructure config, access controls, and code-level review. Is this for an internal check, a customer requirement, or something else?",
  },
  {
    keywords: ["compliance", "soc2", "soc 2", "hipaa", "gdpr", "pci"],
    response:
      "Compliance work (SOC 2, HIPAA, PCI-DSS, GDPR) is a core part of what we do — gap analysis, remediation, and getting you audit-ready. Which framework are you targeting?",
  },
  {
    keywords: ["breach", "incident", "hacked", "attack"],
    response:
      "If this is an active incident, that changes our priority — let me know and I'll flag it. Otherwise, tell me more about what happened and when.",
  },
  {
    keywords: ["harden", "hardening", "pentest", "penetration"],
    response:
      "We do hardening reviews and can coordinate penetration testing. What's currently in scope — infrastructure, application, or both?",
  },
  {
    keywords: ["vulnerab", "cve", "patch"],
    response:
      "Vulnerability management (scanning, triage, patching cadence) is something we set up as an ongoing process, not a one-off. What's your current patching process like?",
  },
];

const SOFTWARE_RULES: KeywordRule[] = [
  {
    // Explicit so that typing "gms" or "garage" on its own still routes
    // into GMS-specific content within the broader Software department,
    // now that GMS is one product among several discussed here.
    keywords: ["gms", "garage"],
    response:
      "Our Garage Management System (GMS) covers booking, inventory, invoicing, and customer history for auto shops — happy to go deeper on any of that, or I can tell you about our other software products instead. Which would help more?",
  },
  {
    keywords: ["booking", "appointment", "schedul"],
    response:
      "GMS handles appointment scheduling with automated reminders and technician assignment. How many bays/technicians are you working with today?",
  },
  {
    keywords: ["inventory", "parts", "stock"],
    response:
      "Parts inventory tracking is built in — low-stock alerts, supplier reorder points, the usual. Are you tracking inventory manually right now, or with another tool?",
  },
  {
    keywords: ["invoice", "billing", "payment"],
    response:
      "GMS generates invoices straight from the work order, with support for partial payments and common gateways. What are you using for billing currently?",
  },
  {
    keywords: ["customer", "crm", "history"],
    response:
      "Every customer gets a full vehicle service history tied to their profile, so repeat visits are fast to look up. How many customers are in your current system?",
  },
  {
    keywords: ["price", "pricing", "cost", "how much"],
    response:
      "GMS pricing depends on shop size and modules — I'll factor that into your proposal. Roughly how many locations/bays are we talking about?",
  },
];

const SALES_RULES: KeywordRule[] = [
  {
    keywords: ["price", "pricing", "cost", "how much", "budget"],
    response:
      "Pricing depends on scope — I'll put together a proposal once I understand what you need. What's the main problem you're trying to solve?",
  },
  {
    keywords: ["timeline", "how long", "when can"],
    response:
      "Timelines vary by project, but most engagements start within 1-2 weeks of signing. What's your target timeframe?",
  },
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hey there! What's the main thing you're hoping to get done?",
  },
];

const RULES_BY_DEPARTMENT: Record<string, KeywordRule[]> = {
  cloud: CLOUD_RULES,
  devops: CLOUD_RULES,
  security: SECURITY_RULES,
  devsecops: SECURITY_RULES,
  software: SOFTWARE_RULES,
  // Kept as aliases in case department ever arrives as the old GMS-specific
  // key rather than the broader "software" department.
  gms: SOFTWARE_RULES,
  garage: SOFTWARE_RULES,
  sales: SALES_RULES,
};

const DEPARTMENT_FALLBACKS: Record<string, string> = {
  cloud: "Tell me more about your current infrastructure and what's prompting the change.",
  devops: "Tell me more about your current infrastructure and what's prompting the change.",
  security: "Tell me more about what's driving this — a specific requirement, an incident, or general hardening?",
  devsecops: "Tell me more about what's driving this — a specific requirement, an incident, or general hardening?",
  software: "Tell me more about what you're looking for — GMS specifically, or something else we've built?",
  gms: "Tell me more about what you're looking for — GMS specifically, or something else we've built?",
  garage: "Tell me more about what you're looking for — GMS specifically, or something else we've built?",
  sales: "Tell me more about what you're trying to achieve, and I'll point you to the right next step.",
};

const GENERIC_FALLBACK =
  "Got it — tell me a bit more about what you need, and I'll get you pointed in the right direction.";

export async function getAIResponse(
  userText: string,
  context: AIResponseContext
): Promise<string> {
  const department = context.department.toLowerCase();
  const text = userText.toLowerCase();

  const rules = RULES_BY_DEPARTMENT[department] ?? SALES_RULES;
  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.response;
    }
  }

  return DEPARTMENT_FALLBACKS[department] ?? GENERIC_FALLBACK;
}
