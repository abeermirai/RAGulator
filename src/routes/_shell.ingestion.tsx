import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Eye, FileSpreadsheet, FileText, Loader2, Lock, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/_shell/ingestion")({
  component: Ingestion,
  head: () => ({ meta: [{ title: "تجهيز بيئة التدقيق · نظام الإنماء للتدقيق الذكي" }] }),
});

function Ingestion() {
  const { t } = useApp();
  const zones = [
    { title: t("zone1Title"), icon: FileText, uploaded: true, file: "SAMA_AR_2797_VER1.pdf", hint: t("zone1Hint") },
    { title: t("zone2Title"), icon: FileSpreadsheet, uploaded: true, file: "361_1150_2026-02-05.xls", hint: t("zone2Hint") },
    { title: t("zone3Title"), icon: FileText, uploaded: false, file: null as string | null, hint: t("zone3Hint") },
  ];
  return (
    <>
      <TopBar title={t("ingTitle")} subtitle={t("ingSubtitle")} />
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-elegant">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#001827] text-white">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("ingSecureTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("ingSecureBody")}</p>
          </div>
        </div>

        {/* Drop zones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {zones.map((z) => {
            const Icon = z.icon;
            return (
              <Card key={z.title} className="border-border shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${z.uploaded ? "bg-emerald-500/10 text-emerald-600" : "bg-[#5E6BB2]/10 text-[#5E6BB2]"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground leading-tight">{z.title}</p>
                  </div>
                  <div
                    className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                      z.uploaded
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                        : "border-border bg-secondary/40 hover:border-[#5E6BB2]/60"
                    }`}
                  >
                    {z.uploaded ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
                        <p className="mt-2 text-sm font-medium text-foreground break-all">{z.file}</p>
                        <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">{t("uploadSuccess")}</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">{z.hint}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">{t("maxSize")}</p>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground text-center">{z.hint}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Vertical processing pipeline */}
        <Card className="border-border shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{t("plTitle")}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t("plSubtitle")}</p>
              </div>
              <span className="font-mono text-2xl font-bold text-[#5E6BB2]">62%</span>
            </div>
            <Progress value={62} className="h-2 mb-6 [&>div]:bg-[#5E6BB2]" />
            <PipelineTimeline />
          </CardContent>
        </Card>

        <DocumentInventory />
      </div>
    </>
  );
}

function DocumentInventory() {
  const { t } = useApp();
  const rows = [
    { name: t("invFile1"), type: t("invType1"), time: "09:38:12", status: "ready", progress: 100 },
    { name: t("invFile2"), type: t("invType2"), time: "09:39:04", status: "ready", progress: 100 },
    { name: t("invFile3"), type: t("invType3"), time: "09:40:21", status: "ready", progress: 100 },
    { name: t("invFile4"), type: t("invType4"), time: "09:41:47", status: "processing", progress: 62 },
    { name: t("invFile5"), type: t("invType5"), time: "09:42:10", status: "queued", progress: 0 },
    { name: t("invFile6"), type: t("invType2"), time: "09:42:33", status: "queued", progress: 0 },
  ] as const;
  const statusBadge = (s: string) => {
    if (s === "ready") return { cls: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25", label: t("invStatusReady") };
    if (s === "processing") return { cls: "bg-[#5E6BB2]/10 text-[#5E6BB2] border-[#5E6BB2]/20 dark:text-[#b3bbe4] dark:border-[#5E6BB2]/40", label: t("invStatusProcessing") };
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
              {rows.map((r) => {
                const b = statusBadge(r.status);
                return (
                  <tr key={r.name} className="border-t border-border hover:bg-secondary/30 transition">
                    <td className="px-6 py-3 font-medium text-foreground break-all">{r.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.type}</td>
                    <td className="px-6 py-3 font-mono text-muted-foreground tabular-nums text-xs">{r.time}</td>
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
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-red-600 hover:text-red-700" title={t("invActDelete")}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineTimeline() {
  const { t } = useApp();
  const stages: Array<{ key: string; label: string; state: "done" | "running" | "pending"; time: string }> = [
    { key: "up", label: t("plUploading"), state: "done", time: "09:41:02" },
    { key: "ex", label: t("plExtracting"), state: "done", time: "09:41:18" },
    { key: "ocr", label: t("plOcr"), state: "done", time: "09:41:47" },
    { key: "ch", label: t("plChunking"), state: "done", time: "09:42:11" },
    { key: "em", label: t("plEmbedding"), state: "running", time: "09:42:33" },
    { key: "ix", label: t("plIndexing"), state: "pending", time: "—" },
    { key: "kb", label: t("plKbUpdated"), state: "pending", time: "—" },
    { key: "rd", label: t("plReady"), state: "pending", time: "—" },
  ];
  return (
    <ol className="relative ms-3 border-s border-border">
      {stages.map((s, i) => (
        <li key={s.key} className="relative ps-6 pb-5 last:pb-0">
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
            <p
              className={`text-sm font-medium ${
                s.state === "pending" ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {s.label}
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
              <span className="font-mono text-muted-foreground tabular-nums">{s.time}</span>
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
