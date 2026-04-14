"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineMail,
  HiOutlineTemplate,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineCreditCard,
  HiOutlineLogout,
} from "react-icons/hi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { href: "/campaigns", label: "Campaigns", icon: HiOutlineMail },
  { href: "/email-builder", label: "Email Builder", icon: HiOutlineTemplate },
  { href: "/analytics", label: "Analytics", icon: HiOutlineChartBar },
  { href: "/pricing", label: "Plans", icon: HiOutlineCreditCard },
  { href: "/payment-gateway", label: "Payment", icon: HiOutlineCreditCard },
  { href: "/settings", label: "Settings", icon: HiOutlineCog },
  { href: "/profile", label: "Profile", icon: HiOutlineUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1a2e1c] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Campaign<span className="text-brand-light">IQ</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-brand-dark/60 text-white shadow-md"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                className={`text-xl transition-colors ${
                  isActive ? "text-brand-light" : "text-gray-400 group-hover:text-brand-light"
                }`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-1"
        >
          <HiOutlineLogout className="text-xl" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
