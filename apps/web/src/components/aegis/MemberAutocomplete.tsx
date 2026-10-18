"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";

import { getUserSelect } from "@aegis/api-client";
import type { SelectItem } from "@aegis/domain";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

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
    if (!open) return;
    let cancelled = false;
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
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
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal text-muted-foreground"
          >
            <span className="truncate">Type a name or email to search...</span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search users..." value={query} onValueChange={setQuery} />
            <CommandList>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
              ) : (
                <>
                  <CommandEmpty>No users found.</CommandEmpty>
                  {visibleResults.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.id}
                      onSelect={() => addMember(r)}
                      className="cursor-pointer"
                    >
                      {r.label}
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {members.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected members">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-1.5 rounded-full border bg-muted/60 py-1 pr-1.5 pl-3"
            >
              <span className="text-xs font-semibold">{m.label}</span>
              <select
                value={m.role}
                onChange={(e) => setMemberRole(m.id, e.target.value as MemberRole)}
                className="rounded border bg-card px-1.5 py-0.5 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={`Role for ${m.label}`}
              >
                <option value="Submitter">Submitter</option>
                <option value="Reviewer">Reviewer</option>
              </select>
              <button
                type="button"
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors",
                  "hover:bg-foreground/10 hover:text-foreground",
                )}
                aria-label={`Remove ${m.label}`}
                onClick={() => removeMember(m.id)}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
