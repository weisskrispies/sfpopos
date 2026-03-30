"use client";

import { useState } from "react";
import { X, Save, Plus, Trash2, Download } from "lucide-react";
import { POPOS } from "@/data/popos";

interface AdminEditModalProps {
  popos: POPOS;
  onSave: (updates: Partial<POPOS>) => void;
  onClose: () => void;
}

export default function AdminEditModal({
  popos,
  onSave,
  onClose,
}: AdminEditModalProps) {
  const [name, setName] = useState(popos.name);
  const [description, setDescription] = useState(popos.description);
  const [hours, setHours] = useState(popos.hours);
  const [howToFind, setHowToFind] = useState(popos.howToFind || "");
  const [accessibility, setAccessibility] = useState(popos.accessibility);
  const [features, setFeatures] = useState(popos.features.join(", "));
  const [images, setImages] = useState(popos.images.join("\n"));
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageList = images
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (imageUrl.trim()) imageList.push(imageUrl.trim());

    onSave({
      name,
      description,
      hours,
      howToFind: howToFind || undefined,
      accessibility,
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      images: imageList,
    });
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
          <h2 className="text-lg font-bold">Edit Space</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 space-y-4">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-y"
            />
          </Field>

          <Field label="How to Find It">
            <textarea
              value={howToFind}
              onChange={(e) => setHowToFind(e.target.value)}
              rows={3}
              placeholder="Directions, entrance info, what to look for..."
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
              rows={3}
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
                      prev ? prev + "\n" + imageUrl.trim() : imageUrl.trim()
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

          {/* Save */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-[var(--border)] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
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
