"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";
import NewGroupDialog from "@/components/aegis/NewGroupDialog";
import { useFetch } from "@/hooks/useFetch";
import { useGroups } from "@/hooks/useGroups";
import { getFaculties, type FacultyDto } from "@/lib/api";

const groupIcons = [Users];

export default function GroupsPage() {
  const [nonce, setNonce] = useState(0);
  const [facultyId, setFacultyId] = useState("");
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const { data: facultyData } = useFetch(
    () => getFaculties(1, 50),
    [],
  );
  const faculties: FacultyDto[] = (facultyData?.items ?? []).filter((f) => f.isActive);

  const { data } = useGroups(1, 50, { mine: true, facultyId: facultyId || undefined }, nonce);
  const groups = data?.items ?? [];

  const items = groups.map((group, i) => ({
    href: `/groups/${group.id}`,
    title: group.name,
    description: group.description ?? "Research group",
    meta: `Created ${new Date(group.createdAt).toLocaleDateString()}`,
    icon: groupIcons[i % groupIcons.length],
  }));

  return (
    <>
      <NavigationPage
        eyebrow="Research collectives"
        title="My groups"
        description="Groups you belong to. Roles are scoped per group — submitters, reviewers, and creators."
        items={items}
        action={
          <button className="button button--primary" type="button" onClick={() => setNewGroupOpen(true)}>
            <Plus size={16} />
            New group
          </button>
        }
        toolbar={
          <div className="field doc-toolbar__filter">
            <label htmlFor="group-faculty-filter">Faculty</label>
            <select
              id="group-faculty-filter"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            >
              <option value="">All faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.code ? ` (${f.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        }
      />
      <NewGroupDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onCreated={() => setNonce((n) => n + 1)}
      />
    </>
  );
}
