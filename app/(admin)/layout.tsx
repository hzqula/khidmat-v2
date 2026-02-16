import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AppBreadcrumb from "@/components/app-breadcrumb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col w-full">
        <header className="sticky top-0 w-full px-8 h-16 flex justify-between border-b items-center">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <AppBreadcrumb />
          </div>
        </header>
        <section>{children}</section>
      </main>
    </SidebarProvider>
  );
}
