import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, FileCheck, ShieldAlert, TrendingUp, Search } from "lucide-react";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/_shell/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "لوحة التحكم · نظام الإنماء للتدقيق الذكي" }] }),
});

function Dashboard() {
  const { t, dir } = useApp();
  const stats = [
    {
      label: t("statReportsLabel"),
      value: "12",
      icon: FileCheck,
      tint: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
      trend: t("statReportsTrend"),
    },
    {
      label: t("statComplianceLabel"),
      value: "98%",
      icon: TrendingUp,
      tint: "bg-[#fdf2ec] text-[#a94f2f] border-[#f4dcd0] dark:bg-[#E28A6D]/15 dark:text-[#f0b599] dark:border-[#E28A6D]/30",
      iconBg: "bg-[#E28A6D]/15 text-[#c86b47] dark:bg-[#E28A6D]/20 dark:text-[#f0b599]",
      trend: t("statComplianceTrend"),
    },
    {
      label: t("statAlertsLabel"),
      value: t("statAlertsValue"),
      icon: ShieldAlert,
      tint: "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25",
      iconBg: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300",
      trend: t("statAlertsTrend"),
    },
  ];
  const rows = [
    { name: t("row1Name"), date: t("row1Date"), type: t("row1Type"), completed: true },
    { name: t("row2Name"), date: t("row2Date"), type: t("row2Type"), completed: false },
    { name: t("row3Name"), date: t("row3Date"), type: t("row3Type"), completed: true },
    { name: t("row4Name"), date: t("row4Date"), type: t("row4Type"), completed: false },
    { name: t("row5Name"), date: t("row5Date"), type: t("row5Type"), completed: true },
  ];
  return (
    <>
      <TopBar title={t("dashTitle")} subtitle={t("dashSubtitle")} />
      <div className="p-8 space-y-6">
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border shadow-elegant overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className={`text-[11px] font-medium ${s.tint}`} variant="outline">{s.trend}</Badge>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-4xl font-bold text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alert banner */}
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5 shadow-elegant dark:border-red-500/30 dark:bg-red-500/10">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="font-bold text-red-800 dark:text-red-200">{t("alertTitle")}</p>
                <p className="mt-1 text-sm text-red-900/80 dark:text-red-100/80 leading-relaxed">{t("alertBody")}</p>
              </div>
            </div>
            <Button className="bg-[#5E6BB2] hover:bg-[#4d5aa1] text-white shadow-elegant shrink-0">
              <Search className="me-2 h-4 w-4" /> {t("alertCta")}
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center py-4">
          <Link to="/ingestion">
            <Button className="h-14 px-10 text-base bg-steel-gradient hover:opacity-95 text-white shadow-elegant rounded-xl transition-all hover:scale-[1.02]">
              {t("startNewAudit")}
            </Button>
          </Link>
        </div>

        {/* Recent projects table */}
        <Card className="border-border shadow-elegant">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="font-display text-lg font-bold text-foreground">{t("recentProjects")}</h2>
              <button className="text-xs text-[#5E6BB2] hover:underline">{t("viewAll")}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-secondary/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium text-start">{t("colName")}</th>
                    <th className="px-6 py-3 font-medium text-start">{t("colDate")}</th>
                    <th className="px-6 py-3 font-medium text-start">{t("colType")}</th>
                    <th className="px-6 py-3 font-medium text-start">{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.map((r) => (
                    <tr key={r.name} className="border-t border-border hover:bg-secondary/30 transition">
                      <td className="px-6 py-4 font-medium text-foreground">{r.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-secondary text-foreground font-normal">{r.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {r.completed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("statusCompleted")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25">
                            <Clock className="h-3.5 w-3.5" /> {t("statusInReview")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
