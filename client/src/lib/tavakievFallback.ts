import type {
  TavakievFinancialEntry,
  TavakievRiskEntry,
  TavakievSourceRecord,
  TavakievTimelineEntry,
} from "./tavakievTypes";

const defaultTimeline: TavakievTimelineEntry[] = [
  {
    id: "alpha-site",
    title: "Alpha Site Commissioning",
    description:
      "Retrofit of the former Intel facility to house the autonomous Alpha pilot line with digital twin coverage.",
    quarter: "Q4",
    year: 2025,
    cta: "Schedule on-site demo",
  },
  {
    id: "beta-campus",
    title: "Beta Campus Construction",
    description:
      "Greenfield campus tuned for 2 GW throughput with humanoid-assisted assembly and closed-loop supply flows.",
    quarter: "Q2",
    year: 2026,
    cta: "Review campus co-investment terms",
  },
  {
    id: "digital-twin",
    title: "Digital Twin Synchronization",
    description:
      "Full-stack digital twin links manufacturing telemetry, autonomous quality control, and investor transparency.",
    quarter: "Q3",
    year: 2026,
    cta: "Access real-time operations dashboard",
  },
  {
    id: "replication",
    title: "Replication Playbook Release",
    description:
      "Self-assembling blueprint exported to additional Colorado sites, targeting 6 GW aggregate capacity.",
    quarter: "Q1",
    year: 2027,
    cta: "Partner on replication sites",
  },
];

const defaultFinancialStack: TavakievFinancialEntry[] = [
  {
    label: "IRA 45X Production Credit",
    value: 420,
    category: "credit",
    description: "Per-module manufacturing incentive at $0.07/W, monetized via transferability.",
  },
  {
    label: "IRA 48C Investment Credit",
    value: 185,
    category: "credit",
    description: "Advanced manufacturing equipment credit capturing 30% of eligible capex.",
  },
  {
    label: "Energy Community Bonus",
    value: 95,
    category: "credit",
    description: "Additional uplift for revitalizing the Colorado Springs energy community site.",
  },
  {
    label: "Domestic Content Bonus",
    value: 150,
    category: "credit",
    description: "Stacked bonus for fully domesticized supply chain and module assembly.",
  },
  {
    label: "Capital Efficiency Play",
    value: -260,
    category: "investment",
    description: "Net capital requirement after credit stack offsets and vendor financing.",
  },
  {
    label: "Operational Yield Savings",
    value: 65,
    category: "savings",
    description: "Humanoid-assisted automation reduces labor cost by 95% with 24/7 uptime.",
  },
];

const defaultRiskRegister: TavakievRiskEntry[] = [
  {
    id: "supply-chain",
    title: "Polysilicon feedstock concentration",
    description:
      "Upstream supply disruptions could slow module throughput during scale-up of domestic refining capacity.",
    mitigation:
      "Golden Spike vertical integration and long-term offtake agreements with Colorado feedstock partners.",
    severity: "medium",
    tags: ["supply chain", "operations"],
  },
  {
    id: "automation-readiness",
    title: "Humanoid robotics readiness",
    description:
      "Factory cadence depends on maturing humanoid robots (Optimus, Figure) and reliable hand-off to automation cells.",
    mitigation:
      "Hybrid lines with collaborative robots + skilled operators during transition; fallback workflows validated in pilot.",
    severity: "medium",
    tags: ["automation", "workforce"],
  },
  {
    id: "policy-shift",
    title: "Federal incentive policy shift",
    description:
      "Changes to IRA credit programs could impact revenue stacking and replication economics.",
    mitigation:
      "Multi-year credit contracts, diversified revenue strategy, and operating margins sustainable without bonuses by 2028.",
    severity: "high",
    tags: ["policy", "finance"],
  },
  {
    id: "demand-curve",
    title: "AI datacenter demand curve",
    description:
      "Expected AI-driven energy demand may underperform forecasts, reducing premium pricing for modules.",
    mitigation:
      "Track hyperscale commitments quarterly and hedge with utility-scale PPAs plus resort microgrid integrations.",
    severity: "low",
    tags: ["market", "demand"],
  },
];

export const tavakievFallbackSections: TavakievSourceRecord[] = [
  {
    id: "1",
    slug: "tavakiev-triad",
    heading: "Parallel Execution: The Tavakiev Triad",
    summary:
      "Alpha, Beta, and Digital Twin initiatives run in parallel to compress timelines and derisk commissioning.",
    body:
      "Project Tavakiev orchestrates three synchronized lanes: an Alpha pilot line inside the retrofitted Intel campus, a Beta greenfield campus optimized for lights-out assembly, and an always-on digital twin linking every robot, cell, and quality checkpoint. Investors and partners can follow each milestone, audit readiness gates, and collaborate on targeted CTAs at every phase.",
    citation: "Tavakiev Solar Self-Assembling Power Systems — Strategy Brief",
    data: {
      timeline: defaultTimeline,
    },
  },
  {
    id: "2",
    slug: "financial-stack",
    heading: "Capital Stack & Credit Waterfall",
    summary:
      "Federal and state incentives convert manufacturing output into predictable cashflow, offsetting capex requirements.",
    body:
      "By stacking IRA 45X production credits with 48C, energy community uplifts, and domestic content bonuses, Project Tavakiev generates excess credit value relative to Chinese benchmark module pricing. Combined with autonomous manufacturing, investors see near-immediate payback and optionality for transferability or tax equity partnerships.",
    data: {
      financials: defaultFinancialStack,
    },
  },
  {
    id: "3",
    slug: "risk-mitigation",
    heading: "Risk Navigation & Mitigation Ops",
    summary:
      "Structured mitigation playbooks convert execution risk into transparent action plans for supply, automation, and policy.",
    body:
      "Each risk lane maintains AI-generated monitoring feeds, owner assignments, and automated stakeholder updates. Advisors can drill into mitigation depth, contribute expertise, and trigger follow-up CTAs when they interact with timeline or financial layers.",
    data: {
      risks: defaultRiskRegister,
    },
  },
];

