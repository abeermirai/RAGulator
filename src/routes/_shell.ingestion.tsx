import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Eye, FileSpreadsheet, FileText, Loader2, Lock, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { useAudit } from "@/lib/audit-context";
import type { DocumentZone } from "@/lib/types/audit";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/ingestion")({
  component: Ingestion,
  head: () => ({ meta: [{ title: "تجهيز بيئة التدقيق · نظام الإنماء للتدقيق الذكي" }] }),
});

const ZONE_MAP: Array<{ zone: DocumentZone; titleKey: "zone1Title" | "zone2Title" | "zone3Title"; hintKey: "zone1Hint" | "zone2Hint" | "zone3Hint"; icon: typeof FileText }> = [
  { zone: "previous_icaap", titleKey: "zone1Title", hintKey: "zone1Hint", icon: FileText },
  { zone: "financial_statements", titleKey: "zone2Title", hintKey: "zone2Hint", icon: FileSpreadsheet },
  { zone: "regulatory_policies", titleKey: "zone3Title", hintKey: "zone3Hint", icon: FileText },
];

function Ingestion() {
  const { t } = useApp();
  const { documents, pipeline, apiOnline, uploadFile, deleteDocument } = useAudit();
  const progress = pipeline?.progress ?? 0;

  return (
    <>
      <TopBar title={t("ingTitle")} subtitle={t("ingSubtitle")} />
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-elegant">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#001827] text-white">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{t("ingSecureTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("ingSecureBody")}</p>
          </div>
          {!apiOnline && (
            <span className="text-xs text-amber-600 dark:text-amber-300">Backend offline — start Python API</span>
          )}
        </div>

        <Card className="border-[#5E6BB2]/30 bg-[#5E6BB2]/5 shadow-elegant">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-foreground">{t("ragTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("ragSubtitle")}</p>
            <p className="text-xs text-[#5E6BB2] dark:text-[#b3bbe4] mt-2">{t("ragStep2")}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ZONE_MAP.map((z) => {
            const uploaded = documents.filter((d) => d.zone === z.zone);
            const latest = uploaded[uploaded.length - 1];
            return (
              <UploadZone
                key={z.zone}
                zone={z.zone}
                title={t(z.titleKey)}
                hint={t(z.hintKey)}
                icon={z.icon}
                uploaded={!!latest}
                file={latest?.filename ?? null}
                onUpload={uploadFile}
              />
            );
          })}
        </div>

        <Card className="border-border shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{t("plTitle")}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t("plSubtitle")}</p>
              </div>
              <span className="font-mono text-2xl font-bold text-[#5E6BB2]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-6 [&>div]:bg-[#5E6BB2]" />
            <PipelineTimeline stages={pipeline?.stages ?? []} />
            {pipeline?.ready && (
              <div className="mt-6 flex justify-end">
                <Link to="/workspace">
                  <Button className="bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white">{t("navWorkspace")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <DocumentInventory documents={documents} onDelete={deleteDocument} />
      </div>
    </>
  );
}

function UploadZone({
  zone,
  title,
  hint,
  icon: Icon,
  uploaded,
  file,
  onUpload,
}: {
  zone: DocumentZone;
  title: string;
  hint: string;
  icon: typeof FileText;
  uploaded: boolean;
  file: string | null;
  onUpload: (file: File, zone: DocumentZone) => Promise<void>;
}) {
  const { t } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      await onUpload(files[0], zone);
      toast.success(t("uploadSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <Card className="border-border shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${uploaded ? "bg-emerald-500/10 text-emerald-600" : "bg-[#5E6BB2]/10 text-[#5E6BB2]"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv"
          onChange={onChange}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
            uploaded
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
              : dragging
                ? "border-[#5E6BB2] bg-[#5E6BB2]/10"
                : "border-border bg-secondary/40 hover:border-[#5E6BB2]/60"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-[#5E6BB2] animate-spin" />
          ) : uploaded ? (
            <>
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
              <p className="mt-2 text-sm font-medium text-foreground break-all">{file}</p>
              <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">{t("uploadSuccess")}</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{t("dragDrop")}</p>
              <p className="mt-1 text-[11px] text-[#5E6BB2] dark:text-[#b3bbe4]">{t("browse")}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">{t("maxSize")}</p>
            </>
          )}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground text-center">{hint}</p>
      </CardContent>
    </Card>
  );
}

function DocumentInventory({
  documents,
  onDelete,
}: {
  documents: ReturnType<typeof useAudit>["documents"];
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useApp();

  const zoneLabel = (zone: DocumentZone) => {
    if (zone === "previous_icaap") return t("invType1");
    if (zone === "financial_statements") return t("invType2");
    if (zone === "regulatory_policies") return t("invType3");
    return t("invType5");
  };

  const statusBadge = (s: string) => {
    if (s === "ready") return { cls: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25", label: t("invStatusReady") };
    if (s === "processing") return { cls: "bg-[#5E6BB2]/10 text-[#5E6BB2] border-[#5E6BB2]/20 dark:text-[#b3bbe4] dark:border-[#5E6BB2]/40", label: t("invStatusProcessing") };
    if (s === "failed") return { cls: "bg-red-50 text-red-700 border-red-100", label: "Failed" };
    return { cls: "bg-secondary text-muted-foreground border-border", label: t("invStatusQueued") };
  };

  return (
    <Card className="border-border shadow-elegant">
      <CardContent className="p-0">
        <div className="p-6 pb-4">
          <h3 className="font-display text-lg font-bold text-foreground">{t("invTitle")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("invSubtitle")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium text-start">{t("invColName")}</th>
                <th className="px-6 py-3 font-medium text-start">{t("invColType")}</th>
                <th className="px-6 py-3 font-medium text-start">{t("invColTime")}</th>
                <th className="px-6 py-3 font-medium text-start">{t("invColStatus")}</th>
                <th className="px-6 py-3 font-medium text-start w-40">{t("invColProgress")}</th>
                <th className="px-6 py-3 font-medium text-start">{t("invColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    {t("dragDrop")}
                  </td>
                </tr>
              ) : (
                documents.map((r) => {
                  const b = statusBadge(r.status);
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-secondary/30 transition">
                      <td className="px-6 py-3 font-medium text-foreground break-all">{r.filename}</td>
                      <td className="px-6 py-3 text-muted-foreground">{zoneLabel(r.zone)}</td>
                      <td className="px-6 py-3 font-mono text-muted-foreground tabular-nums text-xs">{r.uploaded_at}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={r.progress} className="h-1.5 flex-1 [&>div]:bg-[#5E6BB2]" />
                          <span className="font-mono text-[11px] text-muted-foreground tabular-nums w-9 text-end">{r.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" title={t("invActPreview")}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" title={t("invActReindex")}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                            title={t("invActDelete")}
                            onClick={() => void onDelete(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineTimeline({ stages }: { stages: ReturnType<typeof useAudit>["pipeline"] extends infer P ? (P extends { stages: infer S } ? S : never) : never }) {
  const { t } = useApp();
  const labels: Record<string, string> = {
    uploading: t("plUploading"),
    extracting: t("plExtracting"),
    ocr: t("plOcr"),
    chunking: t("plChunking"),
    embedding: t("plEmbedding"),
    indexing: t("plIndexing"),
    kb_updated: t("plKbUpdated"),
    ready: t("plReady"),
  };

  const fallback = [
    "uploading",
    "extracting",
    "ocr",
    "chunking",
    "embedding",
    "indexing",
    "kb_updated",
    "ready",
  ].map((stage) => ({ stage, state: "pending" as const, progress: 0, timestamp: null }));

  const items = stages.length ? stages : fallback;

  return (
    <ol className="relative ms-3 border-s border-border">
      {items.map((s) => (
        <li key={s.stage} className="relative ps-6 pb-5 last:pb-0">
          <span className="absolute -start-[9px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-2 ring-border">
            {s.state === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            ) : s.state === "running" ? (
              <Loader2 className="h-3.5 w-3.5 text-[#5E6BB2] dark:text-[#b3bbe4] animate-spin" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground/40" />
            )}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`text-sm font-medium ${s.state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
              {labels[s.stage] ?? s.stage}
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
                  s.state === "done"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25"
                    : s.state === "running"
                      ? "bg-[#5E6BB2]/10 text-[#5E6BB2] border border-[#5E6BB2]/20 dark:text-[#b3bbe4] dark:border-[#5E6BB2]/40"
                      : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {s.state === "done" ? t("plStatusDone") : s.state === "running" ? t("plStatusRunning") : t("plStatusPending")}
              </span>
              <span className="font-mono text-muted-foreground tabular-nums">{s.timestamp ?? "—"}</span>
            </div>
          </div>
          {s.state === "running" && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 bg-[#5E6BB2] animate-pulse" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
