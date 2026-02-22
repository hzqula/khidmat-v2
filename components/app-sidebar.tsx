"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Banknote, LogOut } from "lucide-react";
import Link from "next/link";
import { RiSettings2Line } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegNewspaper } from "react-icons/fa6";
import { GoUpload } from "react-icons/go";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/logout";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <LuLayoutDashboard /> },
    {
      name: "Pengaturan",
      href: "/settings",
      icon: <RiSettings2Line />,
    },
    {
      name: "Unggah Gambar",
      href: "/images",
      icon: <GoUpload />,
    },
    {
      name: "Pengumuman",
      href: "/announcements",
      icon: <FaRegNewspaper />,
    },
    {
      name: "Catatan Keuangan",
      href: "/finance",
      icon: <Banknote />,
    },
  ];

  const isActive = links.find((link) => link.href === pathname);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-8 h-16 border-b justify-center">
        <h1 className="font-display font-bold italic text-gold text-2xl">
          Khidmat
        </h1>
      </SidebarHeader>
      <SidebarContent className="py-4 border-b">
        {links.map((link) => {
          return (
            <Link
              className={`px-8 py-2 text-sm font-medium flex items-center gap-2 ${isActive?.href === link.href ? "text-grass border-r-4 border-r-grass bg-green-50" : "text-black"}`}
              key={link.href}
              href={link.href}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{isPending ? "Keluar…" : "Keluar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
