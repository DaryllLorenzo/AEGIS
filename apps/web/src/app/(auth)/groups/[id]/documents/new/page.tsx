"use client";

import { ArrowLeft, FileUp, FolderTree, Info, Loader2, Tag, Upload, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import {
  uploadDocument,
  createReview,
  getGroups,
  getDocuments,
  getDocumentById,
  getUserSelect,
} from "@aegis/api-client";
import type { GroupDto, DocumentDto, DocumentType, SelectItem } from "@aegis/domain";
import PageContainer from "@/components/aegis/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem as SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";

const NONE = "__none__";

function StepCard({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-3.5 border-b bg-muted/40 px-4 py-3.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </span>
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <span className="text-primary">{icon}</span>
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="grid gap-4 p-4">{children}</div>
    </section>
  );
}

function NewReviewForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const preParentId = searchParams.get("parentId") ?? "";
  const groupIdParam = (params?.id as string) ?? "";

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [groupId] = useState(groupIdParam);
  const [documentId, setDocumentId] = useState("");
  const [docType, setDocType] = useState<DocumentType>("Thesis");
  const [mode, setMode] = useState<"upload" | "existing">("upload");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<SelectItem[]>([]);
  const [parent, setParent] = useState<DocumentDto | null>(null);

  // A new version is created from a parent document and always
  // requires a fresh PDF upload.
  const isVersion = !!preParentId;

  // Reset dependent state during render when the branch flips; setState
  // synchronously inside an effect is not allowed.
  const needsDocReset = !groupId || isVersion;
  const [prevDocReset, setPrevDocReset] = useState(needsDocReset);
  if (needsDocReset !== prevDocReset) {
    setPrevDocReset(needsDocReset);
    if (needsDocReset) setDocuments([]);
  }

  const noGroup = !groupId;
  const [prevNoGroup, setPrevNoGroup] = useState(noGroup);
  if (noGroup !== prevNoGroup) {
    setPrevNoGroup(noGroup);
    if (noGroup) {
      setAssigneeOptions([]);
      setAssigneeId("");
    }
  }

  useEffect(() => {
    getGroups(1, 50)
      .then((r) => setGroups(r.items))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (!groupId || isVersion) return;
    getDocuments(1, 50, groupId)
      .then((r) => setDocuments(r.items))
      .catch(() => setDocuments([]));
  }, [groupId, isVersion]);

  // New version: load the parent so its name, type, and version
  // number can be shown (both are inherited/derived server-side).
  useEffect(() => {
    if (!preParentId) return;
    let cancelled = false;
    getDocumentById(preParentId)
      .then((d) => {
        if (!cancelled) setParent(d);
      })
      .catch(() => {
        if (!cancelled) setParent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [preParentId]);

  // Assignee picker: only members of the selected group may be
  // assigned (enforced by the backend; the picker lists them).
  // The no-group reset happens during render (see prevNoGroup above).
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    getUserSelect(groupId)
      .then((items) => {
        if (!cancelled) setAssigneeOptions(items);
      })
      .catch(() => {
        if (!cancelled) setAssigneeOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      setFile(null);
      setFileError("Only PDF files are accepted.");
      return;
    }
    setFileError(null);
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (fileError) return;

    const needsUploadCheck = isVersion || mode === "upload";
    if (needsUploadCheck && (!file || !groupId)) return;
    if (!isVersion && mode === "existing" && !documentId) return;

    setSubmitting(true);
    setError(null);

    try {
      let docId = documentId;

      if (needsUploadCheck && file && groupId) {
        const doc = await uploadDocument(
          file,
          title,
          groupId,
          isVersion ? preParentId : undefined,
          docType,
        );
        docId = doc.id;
      }

      const review = await createReview({
        documentId: docId,
        title,
        kind: kind || undefined,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      router.push(`/groups/${groupId}/reviews/${review.id}/workspace`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGroup = groups.find((g) => g.id === groupId);
  const needsUpload = isVersion || mode === "upload";
  const canSubmit =
    !submitting &&
    !!title.trim() &&
    !fileError &&
    (needsUpload ? !!file && !!groupId : !!documentId);

  return (
    <form className="grid max-w-3xl gap-5" onSubmit={handleSubmit}>
      {isVersion && (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-primary"
          role="status"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-success" />
          <p>
            Creating a new version. A fresh PDF is required — the new document inherits its
            parent&apos;s name and the next version number.
          </p>
        </div>
      )}

      <StepCard
        number="1"
        icon={<FolderTree className="size-4" />}
        title="Choose a group"
        description="Groups keep documents, versions, and reviews together."
      >
        <div className="grid gap-2">
          <Label htmlFor="review-group">Group</Label>
          <Select value={groupId} disabled>
            <SelectTrigger id="review-group" className="w-full">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectOption key={g.id} value={g.id}>
                  {g.name}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
          {selectedGroup && (
            <p className="text-xs text-muted-foreground">
              Being created in {selectedGroup.name}; members are validated for this group.
            </p>
          )}
        </div>
      </StepCard>

      <StepCard
        number="2"
        icon={<FileUp className="size-4" />}
        title="Add the document"
        description={
          isVersion
            ? "Upload the new PDF for this version."
            : "Upload a new PDF or review a document that already exists in the group."
        }
      >
        {isVersion ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="review-file">
                PDF file <span className="text-destructive">Required</span>
              </Label>
              <Input
                id="review-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-semibold"
              />
              {fileError ? (
                <p className="text-xs text-destructive" role="alert">
                  {fileError}
                </p>
              ) : (
                file && <p className="text-xs text-muted-foreground">{file.name}</p>
              )}
            </div>
            {parent && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Document name</Label>
                  <p className="rounded-md bg-muted px-3 py-2 text-sm font-semibold">
                    {parent.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Inherited from v{parent.version}</p>
                </div>
                <div className="grid gap-2">
                  <Label>Version</Label>
                  <p className="rounded-md bg-muted px-3 py-2 text-sm font-semibold">
                    v{parent.version + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">Auto-incremented, not editable</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className="inline-flex w-full gap-1 rounded-lg bg-muted p-1"
              role="group"
              aria-label="Document source"
            >
              {(
                [
                  { key: "upload", label: "Upload new file", icon: Upload },
                  { key: "existing", label: "Use existing document", icon: FileUp },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors",
                    mode === key
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {mode === "upload" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="review-file">PDF file</Label>
                  <Input
                    id="review-file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                    className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-semibold"
                  />
                  {fileError && (
                    <p className="text-xs text-destructive" role="alert">
                      {fileError}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="review-type">Document type</Label>
                  <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                    <SelectTrigger id="review-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectOption value="Thesis">Thesis</SelectOption>
                      <SelectOption value="Article">Article</SelectOption>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {mode === "existing" && (
              <div className="grid gap-2">
                <Label htmlFor="review-document">Document</Label>
                <Select value={documentId} onValueChange={setDocumentId} disabled={!groupId}>
                  <SelectTrigger id="review-document" className="w-full">
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((d) => (
                      <SelectOption key={d.id} value={d.id}>
                        {d.name} (v{d.version})
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
                {!groupId && (
                  <p className="text-xs text-muted-foreground">
                    Choose a group first to see its documents.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </StepCard>

      <StepCard
        number="3"
        icon={<Tag className="size-4" />}
        title="Review details"
        description="Name the review round and set expectations for the reviewer."
      >
        <div className="grid gap-2">
          <Label htmlFor="review-title">Document title</Label>
          <Input
            id="review-title"
            placeholder="e.g. Adaptive Learning Thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {isVersion && (
            <p className="text-xs text-muted-foreground">
              Names the review round. The document keeps its inherited name.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="review-kind">
              Kind <span className="font-normal text-muted-foreground">Optional</span>
            </Label>
            <Input
              id="review-kind"
              placeholder="e.g. Initial review, revision..."
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="review-assignee">Assignee</Label>
            <Select
              value={assigneeId || NONE}
              onValueChange={(v) => setAssigneeId(v === NONE ? "" : v)}
              disabled={!groupId}
            >
              <SelectTrigger id="review-assignee" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectOption value={NONE}>Unassigned</SelectOption>
                {assigneeOptions.map((u) => (
                  <SelectOption key={u.id} value={u.id}>
                    {u.label}
                  </SelectOption>
                ))}
              </SelectContent>
            </Select>
            {!groupId ? (
              <p className="text-xs text-muted-foreground">
                Choose a group first to assign a reviewer.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserRound className="size-3.5" /> Only members of this group can be assigned.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:max-w-[50%]">
          <Label htmlFor="review-due">Due date</Label>
          <Input
            id="review-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </StepCard>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2.5">
        <Button variant="outline" asChild>
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="size-4" /> Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating...
            </>
          ) : isVersion ? (
            <>
              <Upload className="size-4" /> Create new version
            </>
          ) : (
            <>
              <Upload className="size-4" /> Create document
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function NewReviewPage() {
  return (
    <PageContainer>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary">
          My Groups
        </Link>
        <span>/</span>
        <span>New document</span>
      </div>
      <div className="mb-7">
        <p className="eyebrow">Create document</p>
        <h1 className="mt-1">New document</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a document or select an existing one inside this group to start a review round.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <NewReviewForm />
      </Suspense>
    </PageContainer>
  );
}
