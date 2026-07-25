export type ConditionLabel = "Critical" | "Poor" | "Fair" | "Good" | "Ungraded";

export type LeadStatus = "New" | "Routed" | "Contacted" | "Quoted" | "Won" | "Lost";

export interface Owner {
  name: string;
  phone: string;
  email: string;
  yearsOwned: number;
  assessedValue: number;
}

export interface RoofInfo {
  areaSqFt: number;
  pitch: string;
  material: string;
  estAgeYears: number;
  segments: number;
}

export interface Condition {
  score: number; // 0–100, higher = better shape. Meaningless placeholder when graded=false.
  label: ConditionLabel;
  issues: string[];
  summary: string;
  graded: boolean; // false when AI vision grading wasn't available (e.g. no ANTHROPIC_API_KEY)
}

export interface Lead {
  id: string;
  scanId: string;
  createdAt: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  owner?: Owner; // absent in live mode until a parcel-data provider is connected
  roof: RoofInfo;
  condition: Condition;
  status: LeadStatus;
  salesAngles: string[];
  imageUrl?: string; // live mode: proxied satellite tile
  source?: "mock" | "live";
}

// Everything needed to create a Lead except the fields the store assigns
// (id, scanId, createdAt) — produced by the mock generator or the live scan
// pipeline, consumed by store.ts's createScanWithLeads.
export type LeadDraft = Omit<Lead, "id" | "scanId" | "createdAt">;

export interface ScanBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ScanRecord {
  id: string;
  createdAt: string;
  label: string;
  bounds: ScanBounds;
  leadCount: number;
}

export interface Db {
  leads: Lead[];
  scans: ScanRecord[];
  nextLeadNumber: number;
}
