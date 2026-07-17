import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { AppProvider, useApp } from "@/lib/app-context";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <AppProvider>
      <ShellInner />
    </AppProvider>
  );
}

function ShellInner() {
  const { dir } = useApp();
  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <AppSidebar />
      <div className={dir === "rtl" ? "lg:pr-72" : "lg:pl-72"}>
        <Outlet />
      </div>
    </div>
  );
}