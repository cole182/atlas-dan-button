// LockedModule — shown for upsell modules (Insurance Gap, Social Distress, Obituary, Fire Damage)

import { Lock, ArrowRight } from "lucide-react";

interface LockedModuleProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export default function LockedModule({ title, description, features, icon: Icon, accentColor }: LockedModuleProps) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: accentColor + "18" }}
        >
          <Icon className="w-8 h-8" style={{ color: accentColor }} />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10">
            <Lock className="w-3 h-3 text-white/40" />
            <span className="text-white/40 text-xs">Locked</span>
          </div>
        </div>

        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
          {description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
              <span className="text-white/60 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => alert("Contact your Atlas provider to unlock this module.")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Unlock This Module
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
