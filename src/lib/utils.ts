import { POPOS } from "@/data/popos";

export function filterPopos(
  data: POPOS[],
  query: string,
  type: string | null,
  neighborhood: string | null,
  saved: Set<string>,
  visited: Set<string>,
  showSavedOnly: boolean,
  showVisitedOnly: boolean
): POPOS[] {
  let filtered = data;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  if (type) {
    filtered = filtered.filter((p) => p.type === type);
  }

  if (neighborhood) {
    filtered = filtered.filter((p) => p.neighborhood === neighborhood);
  }

  if (showSavedOnly) {
    filtered = filtered.filter((p) => saved.has(p.id));
  }

  if (showVisitedOnly) {
    filtered = filtered.filter((p) => visited.has(p.id));
  }

  return filtered;
}

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(1)} mi`;
}

const gradients = [
  "img-placeholder",
  "img-placeholder-alt",
  "img-placeholder-green",
  "img-placeholder-warm",
  "img-placeholder-cool",
];

export function getPlaceholderGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    "Plaza": "🏛️",
    "Rooftop Terrace": "🌇",
    "Rooftop Garden": "🌿",
    "Indoor Atrium": "✨",
    "Park": "🌳",
    "Garden": "🌺",
    "Elevated Park": "⛅",
    "Waterfront Park": "🌊",
    "Sun Terrace": "☀️",
    "Terrace": "🌤️",
    "Promenade": "🚶",
    "Steps & Seating": "📐",
    "Courtyard": "🏰",
    "Community Garden": "🥕",
    "Urban Farm": "🌱",
    "Elevated Plaza": "🏙️",
    "Conservatory": "🏛️",
    "Urban Garden": "🌿",
    "Pedestrian Walkway": "🚶",
    "Snippet": "📐",
    "Indoor Park": "🌳",
    "Greenhouse": "🌿",
  };
  return map[type] || "📍";
}
