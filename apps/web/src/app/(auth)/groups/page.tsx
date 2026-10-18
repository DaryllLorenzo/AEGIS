"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";
import NewGroupDialog from "@/components/aegis/NewGroupDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { useGroups } from "@/hooks/useGroups";
import { getFaculties } from "@aegis/api-client";
import type { FacultyDto } from "@aegis/domain";

const groupIcons = [Users];

const ALL = "__all__";

export default function GroupsPage() {
  const [nonce, setNonce] = useState(0);
  const [facultyId, setFacultyId] = useState("");
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const { data: facultyData } = useFetch(() => getFaculties(1, 50), []);
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
          <Button type="button" onClick={() => setNewGroupOpen(true)}>
            <Plus className="size-4" />
            New group
          </Button>
        }
        toolbar={
          <div className="grid w-full max-w-[220px] gap-2">
            <Label htmlFor="group-faculty-filter">Faculty</Label>
            <Select
              value={facultyId || ALL}
              onValueChange={(v) => setFacultyId(v === ALL ? "" : v)}
            >
              <SelectTrigger id="group-faculty-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All faculties</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                    {f.code ? ` (${f.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
