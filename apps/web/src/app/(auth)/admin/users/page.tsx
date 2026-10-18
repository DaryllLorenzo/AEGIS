"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { createUser, deleteUser, getUsers, updateUser } from "@aegis/api-client";
import type { UserDto } from "@aegis/domain";
import PageContainer from "@/components/aegis/PageContainer";
import { Badge } from "@/components/ui/badge";
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
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth-context";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data } = useFetch(
    () => getUsers(1, 100),

    [nonce],
  );
  const users = data?.items ?? [];

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user && !user.isAdmin) {
    return (
      <PageContainer>
        <div>
          <h1 className="font-heading">User management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Administrador required to manage users.
          </p>
        </div>
      </PageContainer>
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await createUser({ email: newEmail, displayName: newName, password: newPassword });
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!editing || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await updateUser(editing.id, { email: editEmail, displayName: editName });
      setEditing(null);
      setEditEmail("");
      setEditName("");
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (busy) return;
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    setBusy(true);
    setFormError(null);
    try {
      await deleteUser(id);
      setNonce((n) => n + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Admin</span>
        <span>/</span>
        <span>Users</span>
      </div>
      <div className="mb-7">
        <p className="eyebrow">Administration</p>
        <h1 className="font-heading mt-1">User management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create, update and deactivate accounts.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">People</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  {editing?.id === u.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Display name"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          aria-label="Email"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        {u.isAdmin ? (
                          <Badge
                            variant="outline"
                            className="border-warning/40 bg-warning/15 font-bold text-warning uppercase"
                          >
                            Admin
                          </Badge>
                        ) : (
                          "Member"
                        )}
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
                        {u.displayName}
                        {u.isAdmin ? " · Admin" : ""}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${u.displayName}`}
                          onClick={() => {
                            setEditing(u);
                            setEditName(u.displayName);
                            setEditEmail(u.email);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${u.displayName}`}
                          onClick={() => handleDelete(u.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Create a user</h2>
        <form className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-user-name">Display name</Label>
              <Input
                id="new-user-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-user-password">Temporary password</Label>
            <Input
              id="new-user-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
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
              <Plus className="size-4" /> Create user
            </Button>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
