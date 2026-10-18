"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createGroup, getFaculties } from "@aegis/api-client";
import type { FacultyDto } from "@aegis/domain";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import MemberAutocomplete, { type MemberSelection } from "./MemberAutocomplete";

type NewGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function NewGroupDialog({ open, onClose, onCreated }: NewGroupDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<MemberSelection[]>([]);
  const [creatorRole, setCreatorRole] = useState<"Submitter" | "Reviewer">("Submitter");
  const [faculties, setFaculties] = useState<FacultyDto[]>([]);
  const [facultiesError, setFacultiesError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form during render when the dialog opens; setState
  // synchronously inside an effect is not allowed.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName("");
      setFacultyId("");
      setDescription("");
      setMembers([]);
      setCreatorRole("Submitter");
      setError(null);
    }
  }

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
    return () => {
      cancelled = true;
    };
  }, [open]);

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
        members:
          members.length > 0 ? members.map((m) => ({ userId: m.id, roles: [m.role] })) : undefined,
        creatorRole,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create the group.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[calc(100vh-3rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <p className="eyebrow">Step 1 · Group</p>
          <DialogTitle className="font-heading text-xl">Create a research group</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in the details to create a new research group.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adaptive Learning Lab"
              required
              maxLength={200}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group-faculty">Faculty</Label>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger id="group-faculty" className="w-full">
                <SelectValue placeholder="Select a faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                    {f.code ? ` (${f.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {facultiesError && (
              <p className="text-xs text-muted-foreground">
                Could not load faculties. Try again in a moment.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group-description">
              Description <span className="font-normal text-muted-foreground">Optional</span>
            </Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What does this group research?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group-creator-role">Your role in this group</Label>
            <Select
              value={creatorRole}
              onValueChange={(v) => setCreatorRole(v as "Submitter" | "Reviewer")}
            >
              <SelectTrigger id="group-creator-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Submitter">Submitter</SelectItem>
                <SelectItem value="Reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You always hold the Creator role as well; this is your operational group role.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Members</Label>
            <p className="text-xs text-muted-foreground">
              Find users by name or email. Each member gets exactly one role in this group.
            </p>
            <MemberAutocomplete
              members={members}
              onChange={setMembers}
              excludeUserIds={user?.userId ? [user.userId] : []}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter className="mt-1">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim() || !facultyId}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
