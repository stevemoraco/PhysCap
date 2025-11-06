export interface TavakievTimelineEntry {
  id: string;
  title: string;
  description: string;
  quarter: string;
  year: number;
  cta?: string;
}

export interface TavakievFinancialEntry {
  label: string;
  value: number;
  category: "credit" | "investment" | "savings" | "operational";
  description?: string;
}

export interface TavakievRiskEntry {
  id: string;
  title: string;
  description: string;
  mitigation: string;
  severity: "low" | "medium" | "high";
  tags?: string[];
}

export interface TavakievSourceRecord {
  id: string;
  slug: string;
  heading: string;
  summary?: string | null;
  body?: string | null;
  citation?: string | null;
  data?: {
    timeline?: TavakievTimelineEntry[];
    financials?: TavakievFinancialEntry[];
    risks?: TavakievRiskEntry[];
    metrics?: Record<string, number>;
  } | null;
}

