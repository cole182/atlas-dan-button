// Property Condition AI — premium redesign
import { useState } from "react";
import { Building2, Satellite, Eye, Star, AlertCircle, Settings, CheckCircle2, Zap } from "lucide-react";
import { Link } from "wouter";

interface PropertyConditionProps {
  googleMapsConfigured: boolean;
  openAiConfigured: boolean;
  accentColor: string;
}

const SAMPLE_RESULTS = [
  { address: "123 Main St", score: 87, condition: "Good", roofScore: 90, exteriorScore: 85, landscapeScore: 88, notes: "Well-maintained property, minor wear on siding" },
  { address: "456 Oak Ave", score: 42, condition: "Poor", roofScore: 35, exteriorScore: 48, landscapeScore: 44, notes: "Significant deferred maintenance, potential roof damage" },
  { address: "789 Pine Rd", score: 65, condition: "Fair", roofScore: 70, exteriorScore: 60, landscapeScore: 68, notes: "Average condition, some cosmetic repairs needed" },
];

const scoreColor = (score: number) =>
  score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

const scoreBg = (score: number) =>
  score >= 75 ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
  : score >= 50 ? "bg-amber-500/15 border-amber-500/20 text-amber-400"
  : "bg-red-500/15 border-red-500/20 text-red-400";

export default function PropertyCondition({ googleMapsConfigured, openAiConfigured, accentColor }: PropertyConditionProps) {
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isReady = googleMapsConfigured && openAiConfigured;

  const handleAnalyze = () => {
    if (!isReady || !address.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Property Condition AI
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Satellite and street-level AI scoring for any property address.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={isReady
            ? { backgroundColor: "#34d39920", color: "#34d399", border: "1px solid #34d39930" }
            : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.09)" }
          }
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-400" : "bg-white/30"}`} />
          {isReady ? "Ready" : "Setup Required"}
        </div>
      </div>

      {/* API Setup Status */}
      {!isReady && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
        >
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm mb-3">API Keys Required to Activate</div>
              <div className="space-y-2 mb-5">
                {[
                  { label: "Google Maps API Key", configured: googleMapsConfigured },
                  { label: "OpenAI API Key", configured: openAiConfigured },
                ].map(({ label, configured }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    {configured ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    <span className={configured ? "text-emerald-400" : "text-white/40"}>
                      {label} {configured ? "— Connected" : "— Not configured"}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/settings">
                <a className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: accentColor }}>
                  <Settings className="w-3.5 h-3.5" />
                  Configure in Settings
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isReady ? "Enter a property address to analyze..." : "Configure API keys in Settings to enable scoring"}
          disabled={!isReady}
          className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl px-5 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={!isReady || !address.trim() || isAnalyzing}
          className="px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 hover:opacity-90"
          style={{ backgroundColor: accentColor, boxShadow: isReady ? `0 4px 16px ${accentColor}35` : "none" }}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Satellite className="w-4 h-4" />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Satellite, label: "Satellite View", desc: "AI analyzes roof condition, lot maintenance, and structural integrity from above" },
          { icon: Eye, label: "Street View", desc: "Ground-level analysis of exterior condition, curb appeal, and visible damage" },
          { icon: Star, label: "Condition Score", desc: "0–100 score with detailed breakdown by category and actionable notes" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: accentColor + "18", border: `1px solid ${accentColor}30` }}
            >
              <Icon className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="text-white font-bold text-sm mb-1.5">{label}</div>
            <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* Sample results */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.18em]">Sample Results</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap className="w-3 h-3" />
            Preview
          </div>
        </div>
        <div className="space-y-4">
          {SAMPLE_RESULTS.map((result) => (
            <div
              key={result.address}
              className="rounded-2xl p-6"
              style={{ background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-white font-bold text-sm">{result.address}</div>
                  <div className="text-white/40 text-xs mt-1 leading-relaxed">{result.notes}</div>
                </div>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-shrink-0 ${scoreBg(result.score)}`}>
                  <span className="text-2xl font-black" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: scoreColor(result.score) }}>{result.condition}</div>
                    <div className="text-white/25 text-xs">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Roof", score: result.roofScore },
                  { label: "Exterior", score: result.exteriorScore },
                  { label: "Landscape", score: result.landscapeScore },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white/35 font-medium">{label}</span>
                      <span className="font-bold" style={{ color: scoreColor(score) }}>{score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
