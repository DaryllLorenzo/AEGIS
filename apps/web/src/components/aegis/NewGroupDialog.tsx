"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import {
  createGroup,
  getFaculties,
  getUserSelect,
  type FacultyDto,
  type SelectItem,
} from "@/lib/api";

type NewGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function NewGroupDialog({ open, onClose, onCreated }: NewGroupDialogProps) {
  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [faculties, setFaculties] = useState<FacultyDto[]>([]);
  const [users, setUsers] = useState<SelectItem[]>([]);
  const [facultiesError, setFacultiesError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getFaculties(1, 50)
      .then((r) => {
        if (!cancelled) setFaculties(r.items.filter((f) => f.isActive));
      })
      .catch(() => {
        if (!cancelled) setFacultiesError(true);
      });
    getUserSelect()
      .then((items) => {
        if (!cancelled) setUsers(items);
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setName("");
      setFacultyId("");
      setDescription("");
      setMemberIds(new Set());
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleMember(id: string) {
    setMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !facultyId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createGroup({
        name: name.trim(),
        facultyId,
        description: description.trim() || undefined,
        userIds: memberIds.size > 0 ? [...memberIds] : undefined,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create the group.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-group-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <p className="eyebrow">Step 1 · Group</p>
            <h2 id="new-group-title">Create a research group</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="group-name">Group name</label>
            <input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adaptive Learning Lab"
              required
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="group-faculty">Faculty</label>
            <select
              id="group-faculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
            >
              <option value="">Select a faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.code ? ` (${f.code})` : ""}
                </option>
              ))}
            </select>
            {facultiesError && (
              <p className="field__hint">Could not load faculties. Try again in a moment.</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="group-description">
              Description <span className="field__optional">Optional</span>
            </label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What does this group research?"
            />
          </div>
          <div className="field">
            <label>
              Members <span className="field__optional">Optional</span>
            </label>
            <p className="field__hint">
              Link members now so they can submit documents and be
              assigned as reviewers.
            </p>
            <div className="member-picker">
              {users.length === 0 ? (
                <p className="field__hint">No users available.</p>
              ) : (
                users.map((u) => (
                  <label key={u.id} className="member-picker__option">
                    <input
                      type="checkbox"
                      checked={memberIds.has(u.id)}
                      onChange={() => toggleMember(u.id)}
                    />
                    <span>{u.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">{error}</p>
          )}
          <div className="modal__footer">
            <button className="button button--secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={submitting || !name.trim() || !facultyId}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Creating...</>
              ) : (
                "Create group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
