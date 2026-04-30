// Login page — premium split-screen design, branded per client
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, MapPin, Brain, TrendingUp, Shield } from "lucide-react";

interface LoginProps {
  companyName: string;
  userEmail: string;
  userPassword: string;
  accentColor: string;
  onLogin: () => void;
}

const FEATURE_ITEMS = [
  { icon: MapPin, label: "County Scraper", desc: "Daily motivated seller leads from your target counties" },
  { icon: Brain, label: "Property Condition AI", desc: "Satellite + street view scoring with GPT-4 Vision" },
  { icon: TrendingUp, label: "Insurance Gap Finder", desc: "Underinsured properties under financial pressure" },
  { icon: Shield, label: "Distress Signals", desc: "Social, obituary, and fire damage monitoring" },
];

export default function Login({ companyName, userEmail, userPassword, accentColor, onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === userEmail.toLowerCase() && password === userPassword) {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col md:flex-row">
      {/* Left panel */}
      <div className="relative hidden md:flex flex-col w-[52%] flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 60%, #0d0d1a 100%)" }} />
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 20% 40%, ${accentColor} 0%, transparent 55%)` }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#080810]" />
        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-wide">Atlas</div>
              <div className="text-white/40 text-xs">{companyName}</div>
            </div>
          </div>
          <div className="mt-16 mb-12">
            <div
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-5 px-3 py-1.5 rounded-full border"
              style={{ color: accentColor, borderColor: accentColor + "40", backgroundColor: accentColor + "12" }}
            >
              Private Access Only
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Your full-time<br />
              <span style={{ color: accentColor }}>data team,</span><br />
              built into one app.
            </h1>
            <p className="text-white/45 text-base leading-relaxed max-w-[380px]">
              Atlas connects to county records, satellite imagery, and AI to surface motivated sellers in your market — every single day.
            </p>
          </div>
          <div className="space-y-4 mb-12">
            {FEATURE_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: accentColor + "18", border: `1px solid ${accentColor}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <div className="text-white/80 text-sm font-semibold">{label}</div>
                  <div className="text-white/35 text-xs mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-white/20 text-xs">Atlas by {companyName} · Confidential</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 md:px-16 bg-[#080810]">
        <div className="md:hidden flex items-center gap-3 mb-10 self-start">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: accentColor }}
          >
            A
          </div>
          <div>
            <div className="text-white font-bold text-sm">Atlas</div>
            <div className="text-white/40 text-xs">{companyName}</div>
          </div>
        </div>
        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Welcome back.
            </h2>
            <p className="text-white/40 text-sm">
              I&apos;m Atlas &mdash;{" "}
              <span className="font-medium" style={{ color: accentColor }}>
                your full-time data agent.
              </span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="username"
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
              />
            </div>
            <div>
              <label className="block text-white/50 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 mt-1"
              style={{ backgroundColor: accentColor, boxShadow: `0 4px 24px ${accentColor}40` }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Atlas
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/[0.07]">
            <p className="text-white/20 text-xs text-center">
              Secure private access &middot; {companyName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
