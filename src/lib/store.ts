import type { Lead as PrismaLeadRow, ScanRecord as PrismaScanRow } from "@prisma/client";
import { prisma } from "./db";
import { generateLead, mulberry32, randomPointIn } from "./mock";
import { isNeglected } from "./leadFilter";
import type { ConditionLabel, Lead, LeadDraft, LeadStatus, ScanBounds, ScanRecord } from "./types";

// --- Prisma row <-> app-shape conversion -----------------------------------
// The DB stores Lead flat (ownerName, roofAreaSqFt, conditionScore, ...);
// the app works with the nested Lead/Owner/RoofInfo/Condition shape from
// types.ts. issues/salesAngles are JSON-encoded strings in SQLite (no native
// array/Json type there) — see prisma/schema.prisma for why.

function toLead(row: PrismaLeadRow): Lead {
  return {
    id: row.id,
    scanId: row.scanId,
    createdAt: row.createdAt.toISOString(),
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    lat: row.lat,
    lng: row.lng,
    owner: row.ownerName
      ? {
          name: row.ownerName,
          phone: row.ownerPhone ?? "",
          email: row.ownerEmail ?? "",
          yearsOwned: row.ownerYearsOwned ?? 0,
          assessedValue: row.ownerAssessedValue ?? 0,
        }
      : undefined,
    roof: {
      areaSqFt: row.roofAreaSqFt,
      pitch: row.roofPitch,
      material: row.roofMaterial,
      estAgeYears: row.roofEstAgeYears,
      segments: row.roofSegments,
    },
    condition: {
      score: row.conditionScore,
      label: row.conditionLabel as ConditionLabel,
      issues: JSON.parse(row.conditionIssues) as string[],
      summary: row.conditionSummary,
      graded: row.conditionGraded,
    },
    status: row.status as LeadStatus,
    salesAngles: JSON.parse(row.salesAngles) as string[],
    imageUrl: row.imageUrl ?? undefined,
    source: (row.source as Lead["source"]) ?? undefined,
  };
}

function toScanRecord(row: PrismaScanRow): ScanRecord {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    label: row.label,
    bounds: { north: row.north, south: row.south, east: row.east, west: row.west },
    leadCount: row.leadCount,
    status: (row.status as ScanRecord["status"]) ?? "complete",
  };
}

function draftToCreateInput(draft: LeadDraft) {
  return {
    address: draft.address,
    city: draft.city,
    state: draft.state,
    zip: draft.zip,
    lat: draft.lat,
    lng: draft.lng,
    ownerName: draft.owner?.name,
    ownerPhone: draft.owner?.phone,
    ownerEmail: draft.owner?.email,
    ownerYearsOwned: draft.owner?.yearsOwned,
    ownerAssessedValue: draft.owner?.assessedValue,
    roofAreaSqFt: draft.roof.areaSqFt,
    roofPitch: draft.roof.pitch,
    roofMaterial: draft.roof.material,
    roofEstAgeYears: draft.roof.estAgeYears,
    roofSegments: draft.roof.segments,
    conditionScore: draft.condition.score,
    conditionLabel: draft.condition.label,
    conditionIssues: JSON.stringify(draft.condition.issues),
    conditionSummary: draft.condition.summary,
    conditionGraded: draft.condition.graded,
    salesAngles: JSON.stringify(draft.salesAngles),
    status: draft.status,
    imageUrl: draft.imageUrl,
    source: draft.source,
  };
}

// --- Org-scoped queries -----------------------------------------------------
// Every function takes `orgId` and filters by it — this is the entire
// multi-tenant isolation boundary. getLead/getLeadsByIds use `orgId` in the
// WHERE clause itself (not a post-fetch check), so a guessed/leaked lead id
// from another org resolves to "not found", not a data leak.

export async function getAllLeads(orgId: string): Promise<Lead[]> {
  const rows = await prisma.lead.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
  return rows.map(toLead);
}

export async function getAllScans(orgId: string): Promise<ScanRecord[]> {
  const rows = await prisma.scanRecord.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } });
  return rows.map(toScanRecord);
}

export async function getLead(orgId: string, id: string): Promise<Lead | undefined> {
  const row = await prisma.lead.findFirst({ where: { id, orgId } });
  return row ? toLead(row) : undefined;
}

export async function getLeadsByIds(orgId: string, ids: string[]): Promise<Lead[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.lead.findMany({ where: { orgId, id: { in: ids } } });
  return rows.map(toLead);
}

export async function updateLeadStatuses(orgId: string, ids: string[], status: LeadStatus): Promise<Lead[]> {
  if (ids.length === 0) return [];
  await prisma.lead.updateMany({ where: { orgId, id: { in: ids } }, data: { status } });
  return getLeadsByIds(orgId, ids);
}

// The two generic prefixes get a running number ("Area scan 5") so repeat
// scans stay distinguishable; a custom label (e.g. from the Storm Feed) is
// already a complete, distinct description and is used as-is.
const GENERIC_LABEL_PREFIXES = new Set(["Area scan", "Live scan"]);

async function resolveScanLabel(orgId: string, labelPrefix: string): Promise<string> {
  if (!GENERIC_LABEL_PREFIXES.has(labelPrefix)) return labelPrefix;
  const existingCount = await prisma.scanRecord.count({ where: { orgId } });
  return `${labelPrefix} ${existingCount + 1}`;
}

export async function createScanWithLeads(
  orgId: string,
  bounds: ScanBounds,
  labelPrefix: string,
  drafts: LeadDraft[]
): Promise<{ scan: ScanRecord; leads: Lead[] }> {
  const label = await resolveScanLabel(orgId, labelPrefix);

  const scanRow = await prisma.scanRecord.create({
    data: {
      orgId,
      label,
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      leadCount: drafts.length,
      leads: {
        create: drafts.map((d) => ({ orgId, ...draftToCreateInput(d) })),
      },
    },
    include: { leads: true },
  });

  return { scan: toScanRecord(scanRow), leads: scanRow.leads.map(toLead) };
}

// Live scans cover every building in the area, which can take well past a
// single request's lifetime — the route creates a "processing" scan
// immediately and returns it, then runs the actual analysis in the
// background (see /api/scan) before calling finalizeScan/failScan.
export async function createProcessingScan(
  orgId: string,
  bounds: ScanBounds,
  labelPrefix: string
): Promise<ScanRecord> {
  const label = await resolveScanLabel(orgId, labelPrefix);
  const scanRow = await prisma.scanRecord.create({
    data: {
      orgId,
      label,
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      leadCount: 0,
      status: "processing",
    },
  });
  return toScanRecord(scanRow);
}

export async function finalizeScan(
  orgId: string,
  scanId: string,
  drafts: LeadDraft[]
): Promise<void> {
  await prisma.scanRecord.update({
    where: { id: scanId, orgId },
    data: {
      leadCount: drafts.length,
      status: "complete",
      leads: { create: drafts.map((d) => ({ orgId, ...draftToCreateInput(d) })) },
    },
  });
}

export async function failScan(orgId: string, scanId: string): Promise<void> {
  await prisma.scanRecord.update({
    where: { id: scanId, orgId },
    data: { status: "failed" },
  });
}

export async function getScanWithLeads(
  orgId: string,
  scanId: string
): Promise<{ scan: ScanRecord; leads: Lead[] } | null> {
  const scanRow = await prisma.scanRecord.findUnique({
    where: { id: scanId, orgId },
    include: { leads: true },
  });
  if (!scanRow) return null;
  return { scan: toScanRecord(scanRow), leads: scanRow.leads.map(toLead) };
}

export async function runMockScan(
  orgId: string,
  bounds: ScanBounds,
  labelPrefix = "Area scan"
): Promise<{ scan: ScanRecord; leads: Lead[] }> {
  // Simulates the real pipeline: scan more candidates than we keep, drop any
  // that grade as healthy/new, so the result is neglected roofs only.
  const rand = mulberry32(Date.now() % 2147483647);
  const targetCount = 8 + Math.floor(rand() * 9);

  const drafts: LeadDraft[] = [];
  let attempts = 0;
  while (drafts.length < targetCount && attempts < targetCount * 3) {
    attempts++;
    const { lat, lng } = randomPointIn(rand, bounds);
    const draft = generateLead(rand, lat, lng);
    if (isNeglected(draft.condition)) drafts.push(draft);
  }

  return createScanWithLeads(orgId, bounds, labelPrefix, drafts);
}
