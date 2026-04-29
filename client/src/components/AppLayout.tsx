// Atlas UI — Design: Dark intelligence dashboard
// Active modules: County Scraper, Property Condition Scoring
// Locked modules (upsell): Insurance Gap, Social Distress, Obituary Monitor, Fire Damage
// Settings: API key configuration hub

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Map,
  Building2,
  Shield,
  Users,
  BookOpen,
  Flame,
  Settings,
  LogOut,
  ChevronRight,
  Lock,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "County Scraper",
    icon: Map,
    href: "/county-scraper",
    active: true,
  },
  {
    label: "Property Condition AI",
    icon: Building2,
    href: "/property-condition",
    active: true,
  },
  {
    label: "Insurance Gap Finder",
    icon: Shield,
    href: "/insurance-gap",
    active: false,
    locked: true,
    lockReason: "Identify properties with coverage gaps — upgrade to unlock",
  },
  {
    label: "Social Distress Signal",
    icon: Users,
    href: "/social-distress",
    active: false,
    locked: true,
    lockReason: "Monitor social platforms for motivated seller signals — upgrade to unlock",
  },
  {
    label: "Obituary Monitor",
    icon: BookOpen,
    href: "/obituary-monitor",
    active: false,
    locked: true,
    lockReason: "Track probate leads from public obituaries — upgrade to unlock",
  },
  {
    label: "Fire Damage Monitor",
    icon: Flame,
    href: "/fire-damage",
    active: false,
    locked: true,
    lockReason: "Track fire-damaged properties in your market — upgrade to unlock",
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  companyName: string;
  userEmail: string;
  accentColor: string;
}

export default function AppLayout({ children, companyName, userEmail, accentColor }: AppLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("atlas_auth");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: accentColor }}
          >
            A
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Atlas</div>
            <div className="text-white/40 text-xs leading-tight">{companyName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Active Modules
        </div>
        {NAV_ITEMS.filter((i) => !i.locked).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                style={isActive ? { backgroundColor: accentColor + "22", color: accentColor } : {}}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </a>
            </Link>
          );
        })}

        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mt-6 mb-3">
          Upgrade to Unlock
        </div>
        {NAV_ITEMS.filter((i) => i.locked).map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/25 cursor-not-allowed select-none"
              title={item.lockReason}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <Lock className="w-3 h-3" />
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link href="/settings">
          <a
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location === "/settings"
                ? "text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            style={location === "/settings" ? { backgroundColor: accentColor + "22", color: accentColor } : {}}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & API Keys</span>
          </a>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
        <div className="px-3 pt-2">
          <div className="text-white/25 text-xs truncate">{userEmail}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-[#0f0f17] border-r border-white/8 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f17] border-r border-white/8 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#0f0f17]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">Atlas</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
