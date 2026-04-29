// Login page — branded per client

import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginProps {
  companyName: string;
  userEmail: string;
  userPassword: string;
  accentColor: string;
  onLogin: () => void;
}

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
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${accentColor} 0%, transparent 70%)`,
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              A
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Atlas</div>
              <div className="text-white/40 text-xs">{companyName}</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your full-time<br />
            <span style={{ color: accentColor }}>data team,</span><br />
            built into one app.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Atlas connects to county records, satellite imagery, and AI to surface motivated sellers in your market — every single day.
          </p>
        </div>
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            {["County Scraper", "Property Condition AI", "Insurance Gap", "Social Distress", "Obituary Monitor", "Fire Damage"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/8 text-white/40 text-xs border border-white/8">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-4">Atlas by {companyName} · Private Access Only</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              A
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Atlas</div>
              <div className="text-white/40 text-xs">{companyName}</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back.</h2>
          <p className="text-white/40 text-sm mb-8">
            I'm Atlas — <span style={{ color: accentColor }}>your full-time data agent.</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: accentColor }}
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
        </div>
      </div>
    </div>
  );
}
