// Settings — premium redesign
import { useState } from "react";
import { Key, Map, Brain, CheckCircle2, Eye, EyeOff, Save, Info, Wrench, MapPin } from "lucide-react";

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
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Settings & Configuration
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage API keys and review your Atlas setup workflow.</p>
      </div>

      {/* API Keys section */}
      <section
        className="rounded-2xl p-7 space-y-6"
        style={{ background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accentColor + "18", border: `1px solid ${accentColor}30` }}
          >
            <Key className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">API Keys</h2>
            <p className="text-white/35 text-xs">Add your keys to activate the Property Condition AI scoring tool.</p>
          </div>
        </div>

        {/* Google Maps */}
        <div>
          <label className="block text-white/45 text-[11px] font-bold uppercase tracking-[0.15em] mb-2.5">
            Google Maps API Key
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type={showGM ? "text" : "password"}
                value={googleMaps}
                onChange={(e) => setGoogleMaps(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-10 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
              />
              <button
                onClick={() => setShowGM(!showGM)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showGM ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {savedKeys.googleMaps && (
              <div className="flex items-center gap-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Active</span>
              </div>
            )}
          </div>
          <p className="text-white/25 text-xs mt-2 leading-relaxed">
            Required for satellite view and street view in Property Condition AI. Enable Maps JavaScript API, Street View API, and Geocoding API.
          </p>
        </div>

        {/* OpenAI */}
        <div>
          <label className="block text-white/45 text-[11px] font-bold uppercase tracking-[0.15em] mb-2.5">
            OpenAI API Key
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Brain className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type={showOA ? "text" : "password"}
                value={openAi}
                onChange={(e) => setOpenAi(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-10 pr-11 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
              />
              <button
                onClick={() => setShowOA(!showOA)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showOA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {savedKeys.openAi && (
              <div className="flex items-center gap-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Active</span>
              </div>
            )}
          </div>
          <p className="text-white/25 text-xs mt-2 leading-relaxed">
            Required for AI property condition analysis. Uses GPT-4 Vision to score satellite and street view images.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ backgroundColor: accentColor, boxShadow: `0 4px 16px ${accentColor}35` }}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved Successfully
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
      <section
        className="rounded-2xl p-7 space-y-6"
        style={{ background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accentColor + "18", border: `1px solid ${accentColor}30` }}
          >
            <Wrench className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">County Scraper — Activation Workflow</h2>
            <p className="text-white/35 text-xs">Built and activated upon Railway transfer</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/[0.08] border border-blue-500/[0.18]">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300/70 text-xs leading-relaxed">
            Your county scraper will be built and activated when Atlas is transferred to your Railway account. The scraper runs daily at 6:00 AM and pulls all available motivated seller leads from your target counties.
          </p>
        </div>

        {/* Target counties */}
        <div>
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">Target Counties</div>
          <div className="space-y-2">
            {counties.map((county) => (
              <div
                key={county.name}
                className="flex items-start gap-4 px-4 py-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{county.name} County, {county.state}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {county.leadTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-medium text-white/45"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activation steps */}
        <div>
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.18em] mb-4">Activation Steps (upon transfer)</div>
          <div className="space-y-3">
            {[
              "Transfer Atlas to your Railway account",
              "Manus builds county-specific scrapers for each of your target counties",
              "Scrapers are tested and verified against live county data",
              "Daily cron job activated — runs every morning at 6:00 AM",
              "New leads appear in your County Scraper dashboard automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: accentColor + "20", color: accentColor, border: `1px solid ${accentColor}30` }}
                >
                  {i + 1}
                </div>
                <span className="text-white/50 text-sm leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
