#!/usr/bin/env npx tsx

/**
 * Fetches POPOS data from the DataSF SODA API and merges it with existing
 * hand-curated data, then writes the result back to src/data/popos.ts.
 *
 * Usage:  npx tsx scripts/update-popos-data.ts
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface POPOS {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  features: string[];
  hours: string;
  accessibility: string;
  images: string[];
  yearOpened?: string;
  transitNearby: string[];
  howToFind?: string;
}

/** Shape of a row returned by the DataSF SODA API */
interface DataSFRecord {
  NAME?: string;
  name?: string;
  POPOS_ADDRESS?: string;
  popos_address?: string;
  HOURS?: string;
  hours?: string;
  TYPE?: string;
  type?: string;
  LANDSCAPING?: string;
  landscaping?: string;
  SEATING_No?: string;
  seating_no?: string;
  FOOD_SERVICE?: string;
  food_service?: string;
  Art?: string;
  art?: string;
  RESTROOMS?: string;
  restrooms?: string;
  Accessibility?: string;
  accessibility?: string;
  YEAR?: string;
  year?: string;
  latitude?: string;
  longitude?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function field(record: DataSFRecord, ...keys: string[]): string {
  for (const k of keys) {
    const val = record[k] ?? record[k.toUpperCase()] ?? record[k.toLowerCase()];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
}

function deriveNeighborhood(lat: number, lng: number): string {
  if (lng > -122.395) {
    if (lat < 37.789) return "Rincon Hill";
    return "Rincon Hill";
  }
  if (lat < 37.775) return "Mission Bay";
  if (lat < 37.780) return "Civic Center";
  if (lat < 37.789 && lng < -122.400) return "SoMa";
  if (lat < 37.789) return "SoMa";
  if (lat > 37.788 && lng > -122.405) return "Financial District";
  return "Financial District";
}

function deriveFeatures(record: DataSFRecord): string[] {
  const features: string[] = [];

  const seating = field(record, "SEATING_No", "seating_no");
  if (seating && seating !== "0") features.push("Seating");

  const landscaping = field(record, "LANDSCAPING", "landscaping");
  if (landscaping) features.push(landscaping);

  const food = field(record, "FOOD_SERVICE", "food_service");
  if (food && food.toLowerCase() !== "none" && food.toLowerCase() !== "no") {
    features.push("Food Nearby");
  }

  const art = field(record, "Art", "art");
  if (art && art.toLowerCase() !== "none" && art.toLowerCase() !== "no") {
    features.push("Public Art");
  }

  const restrooms = field(record, "RESTROOMS", "restrooms");
  if (restrooms && restrooms.toLowerCase() !== "none" && restrooms.toLowerCase() !== "no") {
    features.push("Restrooms");
  }

  return features;
}

function deriveTransit(lat: number, lng: number): string[] {
  const transit: string[] = [];

  // Rough proximity heuristics for SF downtown transit
  if (lat > 37.789 && lng < -122.400) {
    transit.push("BART - Montgomery");
  }
  if (lat > 37.792 && lng > -122.400) {
    transit.push("BART - Embarcadero");
  }
  if (lat < 37.789) {
    if (lng > -122.400) {
      transit.push("BART - Embarcadero");
    } else {
      transit.push("BART - Montgomery");
    }
  }

  return transit.length > 0 ? transit : ["BART - Montgomery"];
}

function mapRecordToPOPOS(record: DataSFRecord): POPOS | null {
  const name = field(record, "NAME", "name");
  if (!name) return null;

  const latStr = field(record, "latitude");
  const lngStr = field(record, "longitude");
  const lat = latStr ? parseFloat(latStr) : 0;
  const lng = lngStr ? parseFloat(lngStr) : 0;

  if (lat === 0 || lng === 0) return null;

  const poposType = field(record, "TYPE", "type") || "Plaza";
  const hours = field(record, "HOURS", "hours") || "Mon-Fri 8:00 AM - 6:00 PM";
  const accessibilityInfo = field(record, "Accessibility", "accessibility") || "Contact building for details";
  const year = field(record, "YEAR", "year");

  return {
    id: slugify(name),
    name,
    address: field(record, "POPOS_ADDRESS", "popos_address") || "Unknown",
    neighborhood: deriveNeighborhood(lat, lng),
    lat,
    lng,
    type: poposType,
    description: "",
    features: deriveFeatures(record),
    hours,
    accessibility: accessibilityInfo,
    images: ["/images/placeholder.jpg"],
    ...(year ? { yearOpened: year } : {}),
    transitNearby: deriveTransit(lat, lng),
  };
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchJSON(url: string): Promise<unknown> {
  console.log(`  Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.json();
}

async function fetchFromDataSF(): Promise<DataSFRecord[]> {
  const primaryURL = "https://data.sfgov.org/resource/65ik-7wqd.json?$limit=500";
  const fallbackURL = "https://data.sfgov.org/api/v3/views/65ik-7wqd/query.json";

  // Try the primary SODA endpoint first
  try {
    console.log("Trying primary SODA API endpoint...");
    const data = await fetchJSON(primaryURL);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  Got ${data.length} records from primary endpoint.`);
      return data as DataSFRecord[];
    }
    console.log("  Primary endpoint returned empty data, trying fallback...");
  } catch (err) {
    console.warn(`  Primary endpoint failed: ${(err as Error).message}`);
  }

  // Try the v3 views/query fallback
  try {
    console.log("Trying fallback v3 API endpoint...");
    const data = await fetchJSON(fallbackURL);

    // The v3 endpoint may wrap rows in a different structure
    if (Array.isArray(data)) {
      console.log(`  Got ${data.length} records from fallback endpoint.`);
      return data as DataSFRecord[];
    }

    // Handle wrapped response: { data: [...] } or { rows: [...] }
    const wrapped = data as Record<string, unknown>;
    const rows = (wrapped.data ?? wrapped.rows ?? []) as DataSFRecord[];
    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`  Got ${rows.length} records from fallback endpoint.`);
      return rows;
    }

    console.log("  Fallback endpoint returned no usable data.");
  } catch (err) {
    console.warn(`  Fallback endpoint failed: ${(err as Error).message}`);
  }

  return [];
}

// ---------------------------------------------------------------------------
// Merge logic
// ---------------------------------------------------------------------------

function mergeData(existing: POPOS[], incoming: POPOS[]): POPOS[] {
  const existingById = new Map<string, POPOS>();
  for (const p of existing) {
    existingById.set(p.id, p);
  }

  const merged = new Map<string, POPOS>();

  // Start with existing entries (preserves ordering)
  for (const p of existing) {
    merged.set(p.id, p);
  }

  // Merge incoming on top — preserve hand-written fields from existing
  for (const inc of incoming) {
    const prev = existingById.get(inc.id);
    if (prev) {
      // Update fields from API but keep hand-curated content
      merged.set(inc.id, {
        ...inc,
        // Preserve hand-written fields
        description: prev.description || inc.description,
        images: prev.images.some((i) => i !== "/images/placeholder.jpg")
          ? prev.images
          : inc.images,
        howToFind: prev.howToFind ?? inc.howToFind,
        // Keep richer data if existing has it
        features: prev.features.length >= inc.features.length ? prev.features : inc.features,
        transitNearby:
          prev.transitNearby.length >= inc.transitNearby.length
            ? prev.transitNearby
            : inc.transitNearby,
        neighborhood: prev.neighborhood || inc.neighborhood,
        accessibility: prev.accessibility || inc.accessibility,
      });
    } else {
      // Brand-new entry from API
      merged.set(inc.id, inc);
    }
  }

  return Array.from(merged.values());
}

// ---------------------------------------------------------------------------
// Serializer
// ---------------------------------------------------------------------------

function serializeValue(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  const innerPad = "  ".repeat(indent + 1);

  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every((v) => typeof v === "string")) {
      const items = value.map((v) => JSON.stringify(v)).join(", ");
      if (items.length < 80) return `[${items}]`;
    }
    const items = value.map((v) => `${innerPad}${serializeValue(v, indent + 1)}`).join(",\n");
    return `[\n${items}\n${pad}]`;
  }

  return JSON.stringify(value);
}

function serializePOPOS(p: POPOS): string {
  const lines: string[] = [];
  lines.push("  {");
  lines.push(`    id: ${JSON.stringify(p.id)},`);
  lines.push(`    name: ${JSON.stringify(p.name)},`);
  lines.push(`    address: ${JSON.stringify(p.address)},`);
  lines.push(`    neighborhood: ${JSON.stringify(p.neighborhood)},`);
  lines.push(`    lat: ${p.lat},`);
  lines.push(`    lng: ${p.lng},`);
  lines.push(`    type: ${JSON.stringify(p.type)},`);
  lines.push(`    description: ${JSON.stringify(p.description)},`);
  lines.push(`    features: ${serializeValue(p.features, 2)},`);
  lines.push(`    hours: ${JSON.stringify(p.hours)},`);
  lines.push(`    accessibility: ${JSON.stringify(p.accessibility)},`);
  lines.push(`    images: ${serializeValue(p.images, 2)},`);
  if (p.yearOpened !== undefined) {
    lines.push(`    yearOpened: ${JSON.stringify(p.yearOpened)},`);
  }
  lines.push(`    transitNearby: ${serializeValue(p.transitNearby, 2)}`);
  if (p.howToFind !== undefined) {
    // Replace last line's trailing content to add comma
    lines[lines.length - 1] = lines[lines.length - 1] + ",";
    lines.push(`    howToFind: ${JSON.stringify(p.howToFind)}`);
  }
  lines.push("  }");
  return lines.join("\n");
}

function generateFileContent(data: POPOS[]): string {
  const entries = data.map(serializePOPOS).join(",\n");

  return `export interface POPOS {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  features: string[];
  hours: string;
  accessibility: string;
  images: string[];
  yearOpened?: string;
  transitNearby: string[];
  howToFind?: string;
}

export const poposData: POPOS[] = [
${entries}
];

export const neighborhoods = [...new Set(poposData.map(p => p.neighborhood))].sort();
export const types = [...new Set(poposData.map(p => p.type))].sort();
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== POPOS Data Updater ===\n");

  // 1. Load existing data
  const dataFilePath = path.resolve(__dirname, "../src/data/popos.ts");
  console.log(`Data file: ${dataFilePath}`);

  let existingData: POPOS[] = [];
  try {
    // Dynamic import of the existing TypeScript data file
    const mod = await import(dataFilePath);
    existingData = mod.poposData ?? [];
    console.log(`Loaded ${existingData.length} existing POPOS entries.\n`);
  } catch (err) {
    console.warn(`Could not load existing data: ${(err as Error).message}`);
    console.log("Starting from scratch.\n");
  }

  // 2. Fetch from DataSF
  console.log("Fetching data from DataSF...");
  const rawRecords = await fetchFromDataSF();

  if (rawRecords.length === 0) {
    console.log("\nNo data fetched from DataSF. Keeping existing data unchanged.");
    return;
  }

  console.log(`\nFetched ${rawRecords.length} raw records.`);

  // 3. Map to POPOS format
  const incoming = rawRecords
    .map(mapRecordToPOPOS)
    .filter((p): p is POPOS => p !== null);

  console.log(`Mapped ${incoming.length} valid POPOS entries.\n`);

  if (incoming.length === 0) {
    console.log("No valid entries after mapping. Keeping existing data unchanged.");
    return;
  }

  // 4. Merge with existing data
  const merged = mergeData(existingData, incoming);
  console.log(
    `Merged result: ${merged.length} entries ` +
      `(${merged.length - existingData.length} new, ${existingData.length} existing).\n`
  );

  // 5. Write to file
  const content = generateFileContent(merged);
  fs.writeFileSync(dataFilePath, content, "utf-8");
  console.log(`Written updated data to ${dataFilePath}`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
