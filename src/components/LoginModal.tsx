"use client";

import { useState } from "react";
import { X, MapPin } from "lucide-react";

interface LoginModalProps {
  onLoginWithGoogle?: () => void;
  onLoginWithEmail: (name: string, email: string) => void;
  googleAvailable: boolean;
  onClose: () => void;
}

export default function LoginModal({
  onLoginWithGoogle,
  onLoginWithEmail,
  googleAvailable,
  onClose,
}: LoginModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onLoginWithEmail(name.trim(), email.trim());
      onClose();
    }
  };

  const handleGoogleClick = () => {
    if (onLoginWithGoogle) {
      onLoginWithGoogle();
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
          <img src="/logo.svg" alt="SF POPOS" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg">
            SF <span className="text-[#4A7C10]">POPOS</span>
          </span>
        </div>

        <h2 className="text-lg font-bold mb-1">Welcome</h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          Sign in to save your favorite spaces and track your visits.
        </p>

        <div className="space-y-3">
          {/* Google Sign-In */}
          {googleAvailable && (
            <>
              <button
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-[var(--border)] rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--muted)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
            </>
          )}

          {/* Email form - always visible */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <p className="text-xs text-[var(--muted)] text-center">
              No account needed &mdash; your data stays on this device
            </p>
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
        </div>

        <p className="text-[11px] text-[var(--muted)] text-center mt-4">
          Your data is stored locally on this device.
        </p>
      </div>
    </div>
  );
}
