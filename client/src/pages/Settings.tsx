// Settings — API key configuration hub + scraper workflow documentation
// This page documents what will be built upon Railway transfer

import { useState } from "react";
import { Key, Map, Brain, CheckCircle2, Eye, EyeOff, Save, Info, Wrench } from "lucide-react";

interface County {
  name: string;
  state: string;
  leadTypes: string[];
}

interface SettingsProps {
  counties: County[];
  accentColor: string;
  onSaveKeys: (keys: { googleMaps: string; openAi: string }) => void;
  savedKeys: { googleMaps: string; openAi: string };
}

export default function Settings({ counties, accentColor, onSaveKeys, savedKeys }: SettingsProps) {
  const [googleMaps, setGoogleMaps] = useState(savedKeys.googleMaps);
  const [openAi, setOpenAi] = useState(savedKeys.openAi);
  const [showGM, setShowGM] = useState(false);
  const [showOA, setShowOA] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveKeys({ googleMaps, openAi });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings & Configuration</h1>
        <p className="text-white/50 text-sm mt-1">Manage API keys and review your Atlas setup workflow.</p>
      </div>

      {/* API Keys */}
      <section className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4" style={{ color: accentColor }} />
          <h2 className="text-white font-semibold">API Keys</h2>
        </div>
        <p className="text-white/40 text-sm">
          Add your API keys below to activate the Property Condition AI scoring tool.
        </p>

        {/* Google Maps */}
        <div>
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
            Google Maps API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showGM ? "text" : "password"}
                value={googleMaps}
                onChange={(e) => setGoogleMaps(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => setShowGM(!showGM)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showGM ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {savedKeys.googleMaps && (
              <div className="flex items-center gap-1 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs">Active</span>
              </div>
            )}
          </div>
          <p className="text-white/30 text-xs mt-1.5">
            Required for satellite view and street view in Property Condition AI. Enable Maps JavaScript API, Street View API, and Geocoding API.
          </p>
        </div>

        {/* OpenAI */}
        <div>
          <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Brain className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showOA ? "text" : "password"}
                value={openAi}
                onChange={(e) => setOpenAi(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => setShowOA(!showOA)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showOA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {savedKeys.openAi && (
              <div className="flex items-center gap-1 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs">Active</span>
              </div>
            )}
          </div>
          <p className="text-white/30 text-xs mt-1.5">
            Required for AI property condition analysis. Uses GPT-4 Vision to score satellite and street view images.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: accentColor }}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save API Keys
            </>
          )}
        </button>
      </section>

      {/* County Scraper Workflow */}
      <section className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-4 h-4" style={{ color: accentColor }} />
          <h2 className="text-white font-semibold">County Scraper — Activation Workflow</h2>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300/80 text-xs leading-relaxed">
            Your county scraper will be built and activated when Atlas is transferred to your Railway account. The scraper runs daily at 6:00 AM and pulls all available motivated seller leads from your target counties.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">Target Counties</div>
          <div className="space-y-2">
            {counties.map((county) => (
              <div key={county.name} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/8">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{county.name} County, {county.state}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {county.leadTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 rounded-md bg-white/8 text-white/40 text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">Activation Steps (upon transfer)</div>
          {[
            "Transfer Atlas to your Railway account",
            "Manus builds county-specific scrapers for each of your target counties",
            "Scrapers are tested and verified against live county data",
            "Daily cron job activated — runs every morning at 6:00 AM",
            "New leads appear in your County Scraper dashboard automatically",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor + "33", color: accentColor }}
              >
                {i + 1}
              </div>
              <span className="text-white/50 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
