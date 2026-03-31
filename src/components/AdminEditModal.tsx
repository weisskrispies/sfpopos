"use client";

import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { POPOS } from "@/data/popos";

interface AdminEditModalProps {
  popos: POPOS | null; // null = create new
  onSave: (popos: POPOS | Partial<POPOS>, isNew?: boolean) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const emptyPopos: POPOS = {
  id: "",
  name: "",
  address: "",
  neighborhood: "Financial District",
  lat: 37.79,
  lng: -122.40,
  type: "Plaza",
  description: "",
  features: [],
  hours: "Mon-Fri, business hours",
  accessibility: "Unknown",
  images: [],
  transitNearby: [],
};

const TYPES = [
  "Plaza",
  "Park",
  "Garden",
  "Indoor Space",
  "Rooftop",
  "Terrace",
  "Walkway",
  "Snippet",
];

const NEIGHBORHOODS = [
  "Financial District",
  "SoMa",
  "Union Square",
  "Rincon Hill",
  "Mission Bay",
  "South Beach",
  "Embarcadero",
  "Civic Center",
];

export default function AdminEditModal({
  popos,
  onSave,
  onDelete,
  onClose,
}: AdminEditModalProps) {
  const isNew = popos === null;
  const initial = popos || emptyPopos;

  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [lat, setLat] = useState(String(initial.lat));
  const [lng, setLng] = useState(String(initial.lng));
  const [type, setType] = useState(initial.type);
  const [description, setDescription] = useState(initial.description);
  const [hours, setHours] = useState(initial.hours);
  const [howToFind, setHowToFind] = useState(initial.howToFind || "");
  const [accessibility, setAccessibility] = useState(initial.accessibility);
  const [features, setFeatures] = useState(initial.features.join(", "));
  const [images, setImages] = useState(initial.images.join("\n"));
  const [imageUrl, setImageUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageList = images
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (imageUrl.trim()) imageList.push(imageUrl.trim());

    const data: POPOS = {
      id: isNew
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
        : initial.id,
      name,
      address,
      neighborhood,
      lat: parseFloat(lat) || 37.79,
      lng: parseFloat(lng) || -122.4,
      type,
      description,
      hours,
      howToFind: howToFind || undefined,
      accessibility,
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      images: imageList,
      transitNearby: initial.transitNearby,
    };

    onSave(data, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">
            {isNew ? "Add New Space" : "Edit Space"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 space-y-4"
        >
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </Field>

          <Field label="Address">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Neighborhood">
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="input-field"
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {isNew && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="input-field"
                  type="number"
                  step="any"
                />
              </Field>
              <Field label="Longitude">
                <input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="input-field"
                  type="number"
                  step="any"
                />
              </Field>
            </div>
          )}

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field resize-y"
            />
          </Field>

          <Field label="How to Find It">
            <textarea
              value={howToFind}
              onChange={(e) => setHowToFind(e.target.value)}
              rows={2}
              placeholder="Directions, entrance info..."
              className="input-field resize-y"
            />
          </Field>

          <Field label="Hours">
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="input-field"
            />
          </Field>

          <Field label="Accessibility">
            <input
              value={accessibility}
              onChange={(e) => setAccessibility(e.target.value)}
              className="input-field"
            />
          </Field>

          <Field label="Features (comma-separated)">
            <input
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Seating, Garden, Water Feature, ..."
              className="input-field"
            />
          </Field>

          <Field label="Image URLs (one per line)">
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              rows={2}
              placeholder="https://example.com/photo.jpg"
              className="input-field resize-y font-mono text-xs"
            />
          </Field>

          <Field label="Add image URL">
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (imageUrl.trim()) {
                    setImages((prev) =>
                      prev
                        ? prev + "\n" + imageUrl.trim()
                        : imageUrl.trim()
                    );
                    setImageUrl("");
                  }
                }}
                className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Field>

          {/* Save / Delete */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Save className="w-4 h-4" />
              {isNew ? "Add Space" : "Save Changes"}
            </button>
            {!isNew && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initial.id);
                      onClose();
                    }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Confirm Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
