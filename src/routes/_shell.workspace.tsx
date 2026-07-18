import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Bot, CheckCircle2, ChevronDown, Copy, Download, FileText, Lightbulb, MessageSquare, Quote, Send, ShieldCheck, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { useAudit } from "@/lib/audit-context";
import type { QueryResponse } from "@/lib/types/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/workspace")({
  component: Workspace,
  head: () => ({ meta: [{ title: "مساحة عمل التدقيق · نظام الإنماء للتدقيق الذكي" }] }),
});

function Workspace() {
  const { t, dir } = useApp();
  const { messages, findings, askQuestion, documents, pipeline, analyzing, apiOnline, runAnalysis } = useAudit();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const latestResponse = [...messages].reverse().find((m) => m.role === "assistant")?.response;
  const primaryCitation = latestResponse?.citations[0];
  const readyDocs = documents.filter((d) => d.status === "ready");
  const hasDocs = readyDocs.length > 0 && pipeline?.ready;

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setLoading(true);
    setInput("");
    try {
      await askQuestion(q);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title={t("wsTitle")} subtitle={t("wsSubtitle")} />
      <div className="p-6">
        {!apiOnline && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            Backend غير متصل — شغّل Python API على المنفذ 8000 ثم ارفع المستندات من جديد.
          </div>
        )}
        {!hasDocs && apiOnline && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {t("ragStep1")} — <Link to="/ingestion" className="underline font-medium">{t("navIngestion")}</Link>
          </div>
        )}
        {hasDocs && (
          <div className="mb-4 rounded-xl border border-[#5E6BB2]/25 bg-[#5E6BB2]/5 p-4">
            <p className="text-xs font-bold text-foreground mb-2">المستندات المفهرسة ({readyDocs.length})</p>
            <div className="flex flex-wrap gap-2">
              {readyDocs.map((d) => (
                <span key={d.id} className="rounded-full border border-[#5E6BB2]/30 bg-card px-3 py-1 text-[11px] text-foreground">
                  {d.filename}
                </span>
              ))}
            </div>
          </div>
        )}
        {analyzing && (
          <div className="mb-4 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
            {t("processing")} — {t("ragSubtitle")}
          </div>
        )}
        {hasDocs && !findings && !analyzing && (
          <div className="mb-4 flex justify-end">
            <Button onClick={() => void runAnalysis()} className="bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white">
              {t("ragTitle")}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          <Card className="border-border shadow-elegant flex flex-col overflow-hidden order-2 lg:order-1">
            <div className="border-b border-border p-4 flex items-center gap-2 bg-[#001827] text-white">
              <MessageSquare className="h-4.5 w-4.5 text-[#E28A6D]" />
              <h3 className="font-bold">{t("wsChatHeader")}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-secondary/20">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-10">
                  {analyzing ? t("processing") : hasDocs ? t("wsInputPh") : t("ragStep1")}
                </div>
              ) : (
                messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex gap-3 justify-start">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5E6BB2] text-white">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="max-w-[80%]">
                        <p className="text-[11px] text-muted-foreground mb-1">{t("wsAuditor")}</p>
                        <div className="rounded-2xl rounded-tr-sm bg-card border border-border p-4 shadow-sm">
                          <p className="text-sm text-foreground leading-relaxed">{m.content}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3 justify-start">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                        <Bot className="h-4 w-4 text-[#E28A6D]" />
                      </div>
                      <div className="max-w-[85%]">
                        <p className="text-[11px] text-muted-foreground mb-1">{t("wsAssistant")}</p>
                        {m.response ? <AiAnswerCard response={m.response} /> : <p className="text-sm">{m.content}</p>}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            <div className="border-t border-border p-4 bg-card">
              <div className="flex gap-2 items-center rounded-full border border-border bg-secondary/40 ps-1 pe-4 py-1">
                <Input
                  placeholder={t("wsInputPh")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSend()}
                  disabled={loading || !hasDocs}
                  className="border-0 bg-transparent focus-visible:ring-0 h-10 text-start"
                />
                <Button
                  size="icon"
                  disabled={loading || !hasDocs}
                  onClick={() => void handleSend()}
                  className={`h-10 w-10 rounded-full bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-border shadow-elegant flex flex-col overflow-hidden order-1 lg:order-2">
            <div className="border-b border-border p-4 flex items-center gap-2 bg-[#001827] text-white">
              <FileText className="h-4.5 w-4.5 text-[#E28A6D]" />
              <h3 className="font-bold truncate">
                {primaryCitation ? `${t("wsSourceHeader").split(":")[0]}: ${primaryCitation.filename}` : t("wsSourceHeader")}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-muted">
              <div className="mx-auto max-w-2xl rounded-lg bg-card border border-border p-8 shadow-lg text-start leading-loose text-[13px] text-foreground">
                {primaryCitation ? (
                  <>
                    <h4 className="font-bold text-lg mb-4 text-foreground pb-2 border-b border-border">
                      {primaryCitation.filename}
                    </h4>
                    <p className="mb-4 whitespace-pre-wrap">
                      <mark className="bg-[#E28A6D]/25 px-1 rounded">{primaryCitation.quote.slice(0, 280)}</mark>
                    </p>
                    <p className="text-xs text-muted-foreground mt-8 pt-4 border-t border-border">
                      {t("wsPageNo")} {primaryCitation.page} · Chunk {primaryCitation.chunk_id.slice(0, 8)}
                    </p>
                  </>
                ) : hasDocs ? (
                  <div className="text-center text-muted-foreground py-16">
                    <p className="text-sm">{t("wsInputPh")}</p>
                    <p className="text-xs mt-2">{readyDocs.map((d) => d.filename).join(" · ")}</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-lg mb-4 text-foreground pb-2 border-b border-border">{t("wsPdfTitle")}</h4>
                    <p className="mb-4">{t("wsPdfP1")}</p>
                    <p className="text-xs text-muted-foreground mt-8 pt-4 border-t border-border">{t("wsPdfFooter")}</p>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
        <FindingsPanel findings={findings} analyzing={analyzing} hasDocs={hasDocs} />
      </div>
    </>
  );
}

function FindingsPanel({
  findings,
  analyzing,
  hasDocs,
}: {
  findings: ReturnType<typeof useAudit>["findings"];
  analyzing: boolean;
  hasDocs: boolean;
}) {
  const { t } = useApp();
  const f = findings;
  const pending = analyzing || (hasDocs && !f);
  const body = (value: string | undefined, emptyLabel: string) =>
    pending ? `${t("processing")}...` : value ?? (hasDocs ? emptyLabel : t("ragStep1"));

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <div className="rounded-2xl border border-border bg-card shadow-elegant p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">{t("fpTitle")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("fpSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FindingItem icon={CheckCircle2} tone="emerald" title={t("fpFindings")} body={body(f?.findings[0]?.body, t("fpFinding1"))} />
          <FindingItem icon={ShieldCheck} tone="steel" title={t("fpCompliance")} body={body(f?.compliance[0]?.body, t("fpCompliance1"))} />
          <FindingItem icon={AlertCircle} tone="amber" title={t("fpMissing")} body={body(f?.missing[0]?.body, t("fpMissing1"))} />
          <FindingItem icon={Lightbulb} tone="copper" title={t("fpSuggestions")} body={body(f?.suggestions[0]?.body, t("fpSuggestion1"))} />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-[#001827] text-white shadow-elegant p-6 flex flex-col justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/60">ICAAP 2026</p>
          <p className="mt-2 text-sm text-white/85 leading-relaxed">{t("fpSubtitle")}</p>
        </div>
        <Link to="/report">
          <button className="mt-6 w-full rounded-lg bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white font-medium text-sm py-3 transition">
            {t("fpApprove")}
          </button>
        </Link>
      </div>
    </div>
  );
}

function FindingItem({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: typeof CheckCircle2;
  tone: "emerald" | "steel" | "amber" | "copper";
  title: string;
  body: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/25 dark:text-emerald-300",
    steel: "bg-[#5E6BB2]/8 border-[#5E6BB2]/20 text-[#3d4a8a] dark:bg-[#5E6BB2]/15 dark:border-[#5E6BB2]/40 dark:text-[#b3bbe4]",
    amber: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-300",
    copper: "bg-[#E28A6D]/10 border-[#E28A6D]/25 text-[#a05a3d] dark:bg-[#E28A6D]/15 dark:border-[#E28A6D]/35 dark:text-[#f0b599]",
  }[tone];
  return (
    <div className="rounded-xl border border-border p-4 bg-secondary/20">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${tones}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-bold text-foreground">{title}</p>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed">{body}</p>
    </div>
  );
}

function AiAnswerCard({ response }: { response: QueryResponse }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const citation = response.citations[0];

  return (
    <div className="rounded-2xl rounded-tr-sm bg-card border border-border p-4 shadow-sm">
      <p className="text-sm text-foreground leading-loose">{response.answer}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetaChip label={t("wsConfidence")} value={`${response.confidence}%`} tone="emerald" />
        <MetaChip label={t("wsSourceDoc")} value={citation?.filename ?? "—"} tone="steel" />
        <MetaChip label={t("wsPageNo")} value={citation ? String(citation.page) : "—"} tone="steel" />
        <MetaChip label={t("wsChunk")} value={citation ? `Chunk #${citation.chunk_id.slice(0, 6)}` : "—"} tone="copper" />
      </div>

      {citation && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5E6BB2] dark:text-[#b3bbe4] hover:underline"
          >
            <Quote className="h-3 w-3" />
            {open ? t("wsHideQuote") : t("wsShowQuote")}
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <blockquote className="mt-2 rounded-lg border-s-2 border-[#E28A6D] bg-secondary/50 p-3 text-xs leading-loose text-foreground/85 animate-fade-in">
              {citation.quote}
            </blockquote>
          )}
        </>
      )}

      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2">
        {response.citations.slice(0, 2).map((c) => (
          <SourceBadge key={c.chunk_id} label={`${c.filename} (p.${c.page})`} />
        ))}
        <div className="ms-auto flex items-center gap-1">
          <button
            onClick={() => void navigator.clipboard.writeText(response.answer)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <Copy className="h-3 w-3" /> {t("copy")}
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <Download className="h-3 w-3" /> {t("export")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-[#5E6BB2]/30 bg-[#5E6BB2]/8 px-3 py-1.5 text-xs text-[#5E6BB2] dark:text-[#b3bbe4] dark:border-[#5E6BB2]/45 font-medium hover:bg-[#5E6BB2]/15 transition">
      {label}
    </button>
  );
}

function MetaChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "steel" | "copper";
}) {
  const tones = {
    emerald: "border-emerald-200/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    steel: "border-[#5E6BB2]/25 bg-[#5E6BB2]/8 text-[#3d4a8a] dark:text-[#b3bbe4]",
    copper: "border-[#E28A6D]/30 bg-[#E28A6D]/10 text-[#a05a3d] dark:text-[#f0b599]",
  }[tone];
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-1.5 ${tones}`}>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span className="text-[11px] font-bold truncate max-w-[55%]">{value}</span>
    </div>
  );
}
