"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  ImagePlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { POPOS } from "@/data/popos";
import { uploadPoposPhoto, isStorageConfigured, getStorageDebugInfo } from "@/lib/storage";

interface AdminEditModalProps {
  popos: POPOS | null;
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
  const [imageList, setImageList] = useState<string[]>([...initial.images]);
  const [imageUrl, setImageUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const poposId = isNew
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "new-space"
    : initial.id;

  const storageReady = isStorageConfigured();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const images = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name)
      );
      if (images.length === 0) {
        setUploadError("No image files selected.");
        return;
      }

      if (!storageReady) {
        setUploadError(
          "Photo upload not configured. Supabase credentials missing."
        );
        return;
      }

      setUploading(true);
      setUploadError(null);
      setUploadCount({ done: 0, total: images.length });

      const newUrls: string[] = [];
      const errors: string[] = [];

      for (const file of images) {
        try {
          const url = await uploadPoposPhoto(poposId, file);
          newUrls.push(url);
        } catch (err) {
          errors.push(
            err instanceof Error ? err.message : `Failed to upload ${file.name}`
          );
        }
        setUploadCount((prev) => ({ ...prev, done: prev.done + 1 }));
      }

      if (newUrls.length > 0) {
        setImageList((prev) => [...prev, ...newUrls]);
      }
      if (errors.length > 0) {
        setUploadError(`${errors.join("; ")} [${getStorageDebugInfo()}]`);
      }
      setUploading(false);
    },
    [poposId, storageReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= imageList.length) return;
    setImageList((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = [...imageList];
    if (imageUrl.trim()) finalImages.push(imageUrl.trim());

    const data: POPOS = {
      id: poposId,
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
      images: finalImages,
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

          {/* Photos section */}
          <Field label={`Photos (${imageList.length})`}>
            <div className="space-y-3">
              {/* Existing photos grid */}
              {imageList.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageList.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Controls overlay */}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveImage(i, -1)}
                            disabled={i === 0}
                            className="p-1 text-white/80 hover:text-white disabled:text-white/30 transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(i, 1)}
                            disabled={i === imageList.length - 1}
                            className="p-1 text-white/80 hover:text-white disabled:text-white/30 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="p-1 text-red-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Position badge */}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded-full">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  dragActive
                    ? "border-[var(--primary)] bg-red-50"
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                } ${uploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                    <p className="text-sm text-[var(--muted)]">
                      Uploading {uploadCount.done}/{uploadCount.total}...
                    </p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-[var(--muted)]">
                      Tap to add photos
                    </p>
                    <p className="text-[10px] text-gray-400">JPG, PNG, WebP</p>
                  </>
                )}
              </div>

              {/* Upload error */}
              {uploadError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Upload failed</p>
                    <p className="mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* URL fallback */}
              <div className="flex gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste an image URL..."
                  className="input-field flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageUrl.trim()) {
                      setImageList((prev) => [...prev, imageUrl.trim()]);
                      setImageUrl("");
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Field>

          {/* Save / Delete */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
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
