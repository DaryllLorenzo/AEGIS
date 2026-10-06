"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type UserDto,
} from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth-context";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data } = useFetch(
    () => getUsers(1, 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="page-container">
        <div className="page-heading">
          <h1 className="serif-title">User management</h1>
          <p>Administrador required to manage users.</p>
        </div>
      </div>
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
    <div className="page-container admin-page">
      <div className="breadcrumb">
        <span>Admin</span><span>/</span><span>Users</span>
      </div>
      <div className="page-heading">
        <p className="eyebrow">Administration</p>
        <h1 className="serif-title">User management</h1>
        <p>Create, update and deactivate accounts.</p>
      </div>

      <section className="content-panel">
        <h2>People</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Display name</th>
              <th>Email</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                {editing?.id === u.id ? (
                  <>
                    <td>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Display name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        aria-label="Email"
                        required
                      />
                    </td>
                    <td>{u.isAdmin ? <span className="role-badge role-badge--creator">Admin</span> : "Member"}</td>
                    <td>
                      <button className="icon-button" onClick={handleUpdate} aria-label="Save"><Check size={16} /></button>
                      <button className="icon-button" onClick={() => setEditing(null)} aria-label="Cancel"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{u.displayName}{u.isAdmin ? " · Admin" : ""}</td>
                    <td>{u.email}</td>
                    <td>{u.isActive ? "Active" : "Inactive"}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${u.displayName}`}
                        onClick={() => { setEditing(u); setEditName(u.displayName); setEditEmail(u.email); }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${u.displayName}`}
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="muted">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="content-panel">
        <h2>Create a user</h2>
        <form className="form-panel" onSubmit={handleCreate}>
          <div className="field__row">
            <div className="field">
              <label htmlFor="new-user-name">Display name</label>
              <input
                id="new-user-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-user-email">Email</label>
              <input
                id="new-user-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-user-password">Temporary password</label>
            <input
              id="new-user-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="form-actions">
            <button className="button button--primary" type="submit" disabled={busy}>
              <Plus size={16} /> Create user
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
