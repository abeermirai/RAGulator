import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Save, Send, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useAudit } from "@/lib/audit-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/report")({
  component: Report,
  head: () => ({ meta: [{ title: "مسودة التقرير النهائي · نظام الإنماء للتدقيق الذكي" }] }),
});

function Report() {
  const { t, dir } = useApp();
  const { report, loadReport, findings } = useAudit();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadReport()
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, []);

  const data = report;
  const checks = data?.checklist ?? [t("rpCheck1"), t("rpCheck2"), t("rpCheck3"), t("rpCheck4"), t("rpCheck5")];
  const confidence = data?.confidence ?? findings?.confidence ?? 95;

  const handleExport = () => {
    if (!data) return;
    const text = [
      data.title,
      data.meta,
      "",
      ...data.sections.flatMap((s) => [s.title, s.body, ""]),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ICAAP_Report_2026.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("rpExport"));
  };

  return (
    <>
      <TopBar title={t("rpTitle")} subtitle={t("rpSubtitle")} />
      <div className="p-8">
        {loading && <p className="text-sm text-muted-foreground mb-4">{t("processing")}...</p>}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-8">
          <Card className="border-border shadow-elegant">
            <CardContent className="p-0">
              <div className="p-10 lg:p-14 bg-card rounded-lg text-start leading-loose min-h-[70vh]">
                <div className="border-b-2 border-foreground pb-6 mb-8">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("rpDeptHeader")}</p>
                  <h1 className="mt-2 font-display text-3xl font-bold text-foreground leading-tight">
                    {data?.title ?? t("rpDocTitle")}
                  </h1>
                  <p className="mt-3 text-sm text-muted-foreground">{data?.meta ?? t("rpDocMeta")}</p>
                </div>

                {(data?.sections ?? fallbackSections(t)).map((section) => (
                  <Section key={section.title} title={section.title}>
                    {section.body}
                  </Section>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border shadow-elegant">
              <CardContent className="p-6 text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4">{t("rpConfidenceLabel")}</p>
                <ConfidenceRing value={confidence} />
                <p className="mt-4 text-sm text-foreground font-medium">{t("rpConfidenceHigh")}</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/50 shadow-elegant dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      {data?.compliant_title ?? t("rpCompliantTitle")}
                    </p>
                    <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80 leading-relaxed">
                      {data?.compliant_body ?? t("rpCompliantBody")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-elegant">
              <CardContent className="p-5 space-y-2.5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-foreground mb-1">{t("rpChecklist")}</p>
                {checks.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
                    {c}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sticky bottom-4 z-10">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-elegant">
            <Button className="bg-[#001827] hover:bg-[#0a2740] text-white h-11 px-5">
              <Send className={`me-2 h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} /> {t("rpSubmit")}
            </Button>
            <Button onClick={handleExport} className="bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white h-11 px-5">
              <Download className="me-2 h-4 w-4" /> {t("rpExport")}
            </Button>
            <Button variant="outline" className="h-11 px-5 border-border">
              <Save className="me-2 h-4 w-4" /> {t("rpSaveDraft")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function fallbackSections(t: ReturnType<typeof useApp>["t"]) {
  return [
    { title: t("rpSec1Title"), body: t("rpSec1Body") },
    { title: t("rpSec2Title"), body: t("rpSec2Body") },
    { title: t("rpSec3Title"), body: t("rpSec3Body") },
    { title: t("rpSec4Title"), body: t("rpSec4Body") },
    { title: t("rpSec5Title"), body: t("rpSec5Body") },
  ];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-xl font-bold text-foreground mb-3">{title}</h2>
      <p className="text-sm text-foreground/90 leading-loose">{children}</p>
    </div>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  const { t } = useApp();
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-border" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#5E6BB2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-foreground">{value}%</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">{t("rpAccuracy")}</span>
      </div>
    </div>
  );
}
