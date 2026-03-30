#!/usr/bin/env npx tsx
/**
 * POPOS Data Scraper
 *
 * Fetches the latest POPOS data from the SF Open Data portal and updates
 * the local dataset. Run monthly via cron or CI:
 *
 *   npx tsx scripts/scrape-popos.ts
 *
 * Data source: San Francisco Planning Department
 * API: https://data.sfgov.org/resource/rqhx-y39k.json (Socrata Open Data)
 */

const SF_OPEN_DATA_URL =
  "https://data.sfgov.org/resource/rqhx-y39k.json?$limit=500";

interface SocrataPopos {
  name?: string;
  popos_address?: string;
  the_geom?: { type: string; coordinates: [number, number] };
  type?: string;
  hours?: string;
  location_1?: { latitude: string; longitude: string };
  [key: string]: unknown;
}

async function main() {
  console.log("Fetching POPOS data from SF Open Data portal...");

  try {
    const response = await fetch(SF_OPEN_DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: SocrataPopos[] = await response.json();
    console.log(`Fetched ${data.length} records`);

    // Transform to our format
    const spaces = data
      .filter((d) => d.name && (d.the_geom || d.location_1))
      .map((d) => {
        const lat = d.the_geom
          ? d.the_geom.coordinates[1]
          : parseFloat(d.location_1?.latitude || "0");
        const lng = d.the_geom
          ? d.the_geom.coordinates[0]
          : parseFloat(d.location_1?.longitude || "0");

        return {
          name: d.name,
          address: d.popos_address || "",
          lat,
          lng,
          type: d.type || "Unknown",
          hours: d.hours || "Check on site",
        };
      });

    console.log(`Processed ${spaces.length} valid POPOS entries`);
    console.log("\nSample entries:");
    spaces.slice(0, 5).forEach((s) => {
      console.log(`  - ${s.name} (${s.type}) at ${s.address}`);
    });

    // In a full implementation, this would:
    // 1. Merge with existing data (preserving descriptions, images, etc.)
    // 2. Geocode any missing coordinates
    // 3. Fetch images from Google Places API or similar
    // 4. Write to src/data/popos.ts
    console.log(
      "\nTo update the app data, merge these results with src/data/popos.ts"
    );
    console.log("Full data written to stdout as JSON:");
    console.log(JSON.stringify(spaces, null, 2));
  } catch (error) {
    console.error("Failed to fetch POPOS data:", error);
    process.exit(1);
  }
}

main();
