import type { Lead } from "./types";
import { defaultQuoteForLead } from "./quote";

const COLUMNS = [
  "lead_id",
  "status",
  "address",
  "city",
  "state",
  "zip",
  "latitude",
  "longitude",
  "condition_label",
  "condition_score",
  "condition_summary",
  "roof_area_sqft",
  "roof_pitch",
  "roof_material_existing",
  "quote_low_usd",
  "quote_high_usd",
  "owner_name",
  "owner_phone",
  "owner_email",
  "top_sales_angle",
  "scan_id",
  "found_at",
] as const;

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Flat CSV export for handing a lead list to a marketing team — importable
// into Mailchimp, Constant Contact, a CRM, or a direct-mail vendor.
export function leadsToCsv(leads: Lead[]): string {
  const rows = leads.map((lead) => {
    const q = defaultQuoteForLead(lead);
    const row: Record<(typeof COLUMNS)[number], string | number> = {
      lead_id: lead.id,
      status: lead.status,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      latitude: lead.lat,
      longitude: lead.lng,
      condition_label: lead.condition.label,
      condition_score: lead.condition.graded ? lead.condition.score : "",
      condition_summary: lead.condition.summary,
      roof_area_sqft: lead.roof.areaSqFt,
      roof_pitch: lead.roof.pitch,
      roof_material_existing: lead.roof.material,
      quote_low_usd: q.low,
      quote_high_usd: q.high,
      owner_name: lead.owner?.name ?? "",
      owner_phone: lead.owner?.phone ?? "",
      owner_email: lead.owner?.email ?? "",
      top_sales_angle: lead.salesAngles[0] ?? "",
      scan_id: lead.scanId,
      found_at: lead.createdAt,
    };
    return COLUMNS.map((c) => csvEscape(row[c])).join(",");
  });

  return [COLUMNS.join(","), ...rows].join("\r\n");
}
