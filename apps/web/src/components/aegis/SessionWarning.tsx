"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function getTokenExpiry(token: string): number | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "less than a minute";
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}

export default function SessionWarning() {
  const { token, logout } = useAuth();
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const interval = setInterval(() => {
      const remaining = expiry - Date.now();
      setTimeLeft(remaining);

      // Show warning when less than 5 minutes remain
      if (remaining > 0 && remaining < 5 * 60 * 1000) {
        setShow(true);
      } else {
        setShow(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  if (!show || timeLeft <= 0) return null;

  return (
    <div className="session-warning-overlay" role="dialog" aria-modal="true" aria-label="Session expiring">
      <div className="session-warning-modal">
        <div className="session-warning-icon">
          <AlertTriangle size={24} />
        </div>
        <h3>Session expiring soon</h3>
        <p>
          Your session will expire in <strong>{formatTimeRemaining(timeLeft)}</strong>.
          Save any unsaved work before you are signed out.
        </p>
        <div className="session-warning-actions">
          <button className="button button--secondary" onClick={() => setShow(false)}>
            Dismiss
          </button>
          <button className="button button--primary" onClick={logout}>
            Sign out now
          </button>
        </div>
        <button className="session-warning-close" onClick={() => setShow(false)} aria-label="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
