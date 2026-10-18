"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { createFaculty, deleteFaculty, getFaculties, updateFaculty } from "@aegis/api-client";
import type { FacultyDto } from "@aegis/domain";
import PageContainer from "@/components/aegis/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth-context";

export default function AdminFacultiesPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data } = useFetch(
    () => getFaculties(1, 100),

    [nonce],
  );
  const faculties = data?.items ?? [];

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editing, setEditing] = useState<FacultyDto | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user && !user.isAdmin) {
    return (
      <PageContainer>
        <div>
          <h1 className="font-heading">Faculty management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Administrador required to manage faculties.
          </p>
        </div>
      </PageContainer>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await createFaculty({
        name: newName,
        code: newCode || undefined,
        description: newDescription || undefined,
      });
      setNewName("");
      setNewCode("");
      setNewDescription("");
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create faculty");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!editing || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await updateFaculty(editing.id, {
        name: editName,
        code: editCode || undefined,
        description: editDescription || undefined,
      });
      setEditing(null);
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update faculty");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (busy) return;
    if (!window.confirm("Delete this faculty? This action cannot be undone.")) return;
    setBusy(true);
    setFormError(null);
    try {
      await deleteFaculty(id);
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete faculty");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Admin</span>
        <span>/</span>
        <span>Faculties</span>
      </div>
      <div className="mb-7">
        <p className="eyebrow">Administration</p>
        <h1 className="font-heading mt-1">Faculty management</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create, update and delete faculties.</p>
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Faculties</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map((f) => (
                <TableRow key={f.id}>
                  {editing?.id === f.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Name"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          aria-label="Code"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleUpdate}
                          aria-label="Save"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(null)}
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <strong>{f.name}</strong>
                        {f.description ? (
                          <small className="ml-1 text-muted-foreground">— {f.description}</small>
                        ) : null}
                      </TableCell>
                      <TableCell>{f.code ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${f.name}`}
                          onClick={() => {
                            setEditing(f);
                            setEditName(f.name);
                            setEditCode(f.code ?? "");
                            setEditDescription(f.description ?? "");
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${f.name}`}
                          onClick={() => handleDelete(f.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {faculties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No faculties found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Create a faculty</h2>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-faculty-name">Name</Label>
              <Input
                id="new-faculty-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-faculty-code">Code</Label>
              <Input
                id="new-faculty-code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-faculty-description">Description</Label>
            <Textarea
              id="new-faculty-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
          </div>
          {formError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {formError}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              <Plus className="size-4" /> Create faculty
            </Button>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
