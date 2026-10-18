"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
      setShow(remaining > 0 && remaining < 5 * 60 * 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  if (timeLeft <= 0) return null;

  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-warning/15 text-warning">
            <AlertTriangle className="size-6" />
          </span>
          <AlertDialogTitle className="font-heading">Session expiring soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in <strong>{formatTimeRemaining(timeLeft)}</strong>. Save any
            unsaved work before you are signed out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Dismiss</AlertDialogCancel>
          <AlertDialogAction onClick={logout}>Sign out now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
