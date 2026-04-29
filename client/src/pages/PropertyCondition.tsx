// Property Condition AI — Satellite + Street View scoring
// Activates when Google Maps API key + OpenAI API key are configured in Settings

import { useState } from "react";
import { Building2, Satellite, Eye, Star, AlertCircle, Settings, ArrowRight, CheckCircle2 } from "lucide-react";
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

const conditionColor = (score: number) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
};

const conditionBg = (score: number) => {
  if (score >= 75) return "bg-emerald-500/20";
  if (score >= 50) return "bg-yellow-500/20";
  return "bg-red-500/20";
};

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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Property Condition AI</h1>
        <p className="text-white/50 text-sm mt-1">
          Satellite and street-level AI scoring for any property address.
        </p>
      </div>

      {/* API Setup Status */}
      {!isReady && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-white font-semibold text-sm mb-2">API Keys Required to Activate</div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {googleMapsConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                  )}
                  <span className={googleMapsConfigured ? "text-emerald-400" : "text-white/40"}>
                    Google Maps API Key {googleMapsConfigured ? "— Connected" : "— Not configured"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {openAiConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                  )}
                  <span className={openAiConfigured ? "text-emerald-400" : "text-white/40"}>
                    OpenAI API Key {openAiConfigured ? "— Connected" : "— Not configured"}
                  </span>
                </div>
              </div>
              <Link href="/settings">
                <a
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  <Settings className="w-4 h-4" />
                  Configure API Keys
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={isReady ? "Enter a property address to analyze..." : "Configure API keys to enable scoring"}
          disabled={!isReady}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={!isReady || !address.trim() || isAnalyzing}
          className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: accentColor }}
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

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Satellite, label: "Satellite View", desc: "AI analyzes roof condition, lot maintenance, and structural integrity from above" },
          { icon: Eye, label: "Street View", desc: "Ground-level analysis of exterior condition, curb appeal, and visible damage" },
          { icon: Star, label: "Condition Score", desc: "0–100 score with detailed breakdown by category and actionable notes" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-white/3 p-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: accentColor + "22" }}
            >
              <Icon className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div className="text-white font-semibold text-sm mb-1">{label}</div>
            <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* Sample Results */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">Sample Results</div>
          <div className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs">Preview</div>
        </div>
        <div className="space-y-3">
          {SAMPLE_RESULTS.map((result) => (
            <div key={result.address} className="rounded-xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-white font-semibold text-sm">{result.address}</div>
                  <div className="text-white/40 text-xs mt-0.5">{result.notes}</div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${conditionBg(result.score)}`}>
                  <span className={`text-2xl font-bold ${conditionColor(result.score)}`}>{result.score}</span>
                  <div>
                    <div className={`text-xs font-semibold ${conditionColor(result.score)}`}>{result.condition}</div>
                    <div className="text-white/30 text-xs">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Roof", score: result.roofScore },
                  { label: "Exterior", score: result.exteriorScore },
                  { label: "Landscape", score: result.landscapeScore },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">{label}</span>
                      <span className={conditionColor(score)}>{score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171",
                        }}
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
