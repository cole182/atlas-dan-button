// LockedModule — premium upsell card for locked modules
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";

interface LockedModuleProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export default function LockedModule({ title, description, features, icon: Icon, accentColor }: LockedModuleProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <div
        className="w-full rounded-2xl p-10 text-center"
        style={{
          background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            backgroundColor: accentColor + "18",
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 0 30px ${accentColor}15`,
          }}
        >
          <Icon className="w-8 h-8" style={{ color: accentColor }} />
        </div>

        {/* Lock badge + title */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            {title}
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/[0.10]">
            <Lock className="w-3 h-3 text-white/35" />
            <span className="text-white/35 text-xs font-semibold">Locked</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/45 text-sm leading-relaxed max-w-md mx-auto mb-8">
          {description}
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
              <span className="text-white/60 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => alert("Contact your Atlas provider to unlock this module.")}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}
        >
          Unlock This Module
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-white/20 text-xs mt-5">
          Contact your Atlas provider to add this module to your plan.
        </p>
      </div>
    </div>
  );
}
