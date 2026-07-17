import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Database,
  Bot,
  FileText,
  LogOut,
  ShieldCheck,
  UploadCloud,
  Search,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, dir } = useApp();

  const nav = [
    { to: "/dashboard", label: t("navDashboard"), icon: LayoutDashboard },
    {
      to: "/ingestion",
      label: t("navIngestion"),
      icon: Database,
      children: [
        { to: "/ingestion", label: t("uploadWorkspace"), icon: UploadCloud },
        { to: "/workspace", label: t("workflowReviewAndAnalyze"), icon: Search },
        { to: "/report", label: t("workflowFinalReport"), icon: FileText },
      ],
    },
    { to: "/workspace", label: t("navWorkspace"), icon: Bot },
    { to: "/report", label: t("navReport"), icon: FileText },
  ] as const;

  const side = dir === "rtl" ? "right-0 border-l" : "left-0 border-r";
  return (
    <aside
      className={cn(
        "hidden lg:flex fixed inset-y-0 z-30 w-72 flex-col bg-sidebar text-sidebar-foreground border-sidebar-border",
        side,
      )}
    >
      <div className="px-4 py-4 border-b border-sidebar-border">
        <BrandLogo variant="light" size="compact" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <p className="px-3 pb-2 text-[11px] tracking-wider text-white/60">{t("navMain")}</p>
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          const children = "children" in item ? item.children : undefined;
          return (
            <div key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-[#5E6BB2] text-white shadow-elegant"
                    : "text-white/85 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="font-medium">{item.label}</span>
              {active && (
                  <span className={cn("h-1.5 w-1.5 rounded-full bg-[#E28A6D]", dir === "rtl" ? "mr-auto" : "ml-auto")} />
                )}
              </Link>
              {children && active && (
                <ul
                  className={cn(
                    "mt-1 mb-1 space-y-0.5 border-white/10",
                    dir === "rtl"
                      ? "mr-[22px] pr-3 border-r"
                      : "ml-[22px] pl-3 border-l",
                  )}
                >
                  {children.map((c) => {
                    const ChildIcon = c.icon;
                    const childActive = pathname === c.to || pathname.startsWith(c.to + "/");
                    return (
                      <li key={c.to}>
                        <a
                          href={c.to}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors",
                            childActive
                              ? "bg-sidebar-accent text-white font-medium"
                              : "text-white/80 hover:bg-sidebar-accent hover:text-white",
                          )}
                        >
                          <ChildIcon className="h-3.5 w-3.5" />
                          <span>{c.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="rounded-xl bg-sidebar-accent/70 p-3">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#E28A6D]" />
            <span className="text-white/90">{t("secureConn")}</span>
          </div>
          <p className="mt-1 text-[11px] text-white/65">{t("lastSync")}</p>
        </div>
        <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/80 hover:bg-sidebar-accent hover:text-white">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>
    </aside>
  );
}