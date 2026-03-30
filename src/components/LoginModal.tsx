"use client";

import { useState } from "react";
import { X, MapPin } from "lucide-react";

interface LoginModalProps {
  onLogin: (name: string, email: string) => void;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onLogin(name.trim(), email.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">
            SF <span className="text-[var(--primary)]">POPOS</span>
          </span>
        </div>

        <h2 className="text-lg font-bold mb-1">Welcome</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          Sign in to save your favorite spaces and track your visits.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-[11px] text-[var(--muted)] text-center mt-4">
          Your data is stored locally on this device.
        </p>
      </div>
    </div>
  );
}
