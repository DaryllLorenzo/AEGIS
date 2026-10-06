"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

import { getUserSelect, type SelectItem } from "@/lib/api";

export type MemberRole = "Submitter" | "Reviewer";
export type MemberSelection = { id: string; label: string; role: MemberRole };

type Props = {
  members: MemberSelection[];
  onChange: (members: MemberSelection[]) => void;
  /** Users hidden from the picker (e.g. the current creator). */
  excludeUserIds?: string[];
};

const SEARCH_DEBOUNCE_MS = 250;

export default function MemberAutocomplete({ members, onChange, excludeUserIds = [] }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const excludeSet = useMemo(() => new Set(excludeUserIds), [excludeUserIds]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed && !open) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      getUserSelect(undefined, trimmed || undefined)
        .then((items) => {
          if (!cancelled) setResults(items);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const selectedIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);
  const visibleResults = useMemo(
    () => results.filter((r) => !selectedIds.has(r.id) && !excludeSet.has(r.id)),
    [results, selectedIds, excludeSet],
  );

  function addMember(item: SelectItem) {
    onChange([...members, { id: item.id, label: item.label, role: "Submitter" }]);
    setQuery("");
    setOpen(false);
  }

  function removeMember(id: string) {
    onChange(members.filter((m) => m.id !== id));
  }

  function setMemberRole(id: string, role: MemberRole) {
    onChange(members.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  return (
    <div className="member-autocomplete">
      <label className="field">
        <input
          type="text"
          value={query}
          placeholder="Type a name or email to search..."
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          role="combobox"
          aria-expanded={open}
          aria-controls="member-autocomplete-options"
          aria-autocomplete="list"
          onKeyDown={(e) => {
            if (e.key === "Enter" && visibleResults.length > 0) {
              e.preventDefault();
              addMember(visibleResults[0]);
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </label>

      {loading && (
        <p className="field__hint member-autocomplete__hint">
          <Loader2 size={13} className="animate-spin" /> Searching users...
        </p>
      )}

      {open && !loading && (
        <ul
          id="member-autocomplete-options"
          className="member-autocomplete__results"
          role="listbox"
        >
          {visibleResults.length === 0 ? (
            <li className="member-autocomplete__empty" role="option" aria-selected="false">
              No users found.
            </li>
          ) : (
            visibleResults.map((r) => (
              <li key={r.id} role="option" aria-selected="false">
                <button
                  type="button"
                  className="member-autocomplete__option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addMember(r);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {members.length > 0 && (
        <ul className="member-chips" aria-label="Selected members">
          {members.map((m) => (
            <li key={m.id} className="member-chip">
              <span className="member-chip__label">{m.label}</span>
              <select
                value={m.role}
                onChange={(e) => setMemberRole(m.id, e.target.value as MemberRole)}
                className="member-chip__role"
                aria-label={`Role for ${m.label}`}
              >
                <option value="Submitter">Submitter</option>
                <option value="Reviewer">Reviewer</option>
              </select>
              <button
                type="button"
                className="member-chip__remove"
                aria-label={`Remove ${m.label}`}
                onClick={() => removeMember(m.id)}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
