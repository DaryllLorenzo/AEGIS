"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";

import {
  createFaculty,
  deleteFaculty,
  getFaculties,
  updateFaculty,
  type FacultyDto,
} from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth-context";

export default function AdminFacultiesPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data } = useFetch(
    () => getFaculties(1, 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="page-container">
        <div className="page-heading">
          <h1 className="serif-title">Faculty management</h1>
          <p>Administrador required to manage faculties.</p>
        </div>
      </div>
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
    <div className="page-container admin-page">
      <div className="breadcrumb">
        <span>Admin</span><span>/</span><span>Faculties</span>
      </div>
      <div className="page-heading">
        <p className="eyebrow">Administration</p>
        <h1 className="serif-title">Faculty management</h1>
        <p>Create, update and delete faculties.</p>
      </div>

      <section className="content-panel">
        <h2>Faculties</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => (
              <tr key={f.id}>
                {editing?.id === f.id ? (
                  <>
                    <td>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        aria-label="Code"
                      />
                    </td>
                    <td>
                      <button className="icon-button" onClick={handleUpdate} aria-label="Save"><Check size={16} /></button>
                      <button className="icon-button" onClick={() => setEditing(null)} aria-label="Cancel"><X size={16} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <strong>{f.name}</strong>
                      {f.description ? <small className="muted"> — {f.description}</small> : null}
                    </td>
                    <td>{f.code ?? "—"}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${f.name}`}
                        onClick={() => {
                          setEditing(f);
                          setEditName(f.name);
                          setEditCode(f.code ?? "");
                          setEditDescription(f.description ?? "");
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${f.name}`}
                        onClick={() => handleDelete(f.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {faculties.length === 0 && (
              <tr><td colSpan={3} className="muted">No faculties found.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="content-panel">
        <h2>Create a faculty</h2>
        <form className="form-panel" onSubmit={handleCreate}>
          <div className="field__row">
            <div className="field">
              <label htmlFor="new-faculty-name">Name</label>
              <input
                id="new-faculty-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-faculty-code">Code</label>
              <input
                id="new-faculty-code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-faculty-description">Description</label>
            <textarea
              id="new-faculty-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="form-actions">
            <button className="button button--primary" type="submit" disabled={busy}>
              <Plus size={16} /> Create faculty
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
