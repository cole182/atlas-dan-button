// County Scraper — premium redesign
import { useState } from "react";
import { MapPin, Clock, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Database, Zap } from "lucide-react";

interface County {
  name: string;
  state: string;
  leadTypes: string[];
}

interface Lead {
  id: string;
  name: string;
  address: string;
  county: string;
  type: string;
  date: string;
  caseNumber: string;
  status: "new" | "reviewed" | "contacted";
}

const PLACEHOLDER_LEADS: Lead[] = [
  { id: "1", name: "Sample Owner A", address: "123 Main St", county: "COUNTY_1", type: "Pre-Foreclosure", date: "2026-04-28", caseNumber: "XXXX-CP-26-01234", status: "new" },
  { id: "2", name: "Sample Owner B", address: "456 Oak Ave", county: "COUNTY_1", type: "Tax Delinquent", date: "2026-04-27", caseNumber: "XXXX-TD-26-00891", status: "new" },
  { id: "3", name: "Sample Owner C", address: "789 Pine Rd", county: "COUNTY_2", type: "Probate", date: "2026-04-26", caseNumber: "XXXX-PR-26-00445", status: "reviewed" },
  { id: "4", name: "Sample Owner D", address: "321 Elm Blvd", county: "COUNTY_1", type: "Pre-Foreclosure", date: "2026-04-25", caseNumber: "XXXX-CP-26-01189", status: "new" },
  { id: "5", name: "Sample Owner E", address: "654 Cedar Ln", county: "COUNTY_2", type: "Sheriff Sale", date: "2026-04-24", caseNumber: "XXXX-SS-26-00312", status: "contacted" },
];

const STATUS_CONFIG = {
  new: { label: "New", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" },
  reviewed: { label: "Reviewed", className: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
  contacted: { label: "Contacted", className: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
};

const TYPE_CONFIG: Record<string, string> = {
  "Pre-Foreclosure": "bg-red-500/15 text-red-400 border border-red-500/20",
  "Tax Delinquent": "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  "Probate": "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  "Sheriff Sale": "bg-pink-500/15 text-pink-400 border border-pink-500/20",
  "Lis Pendens": "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
  "Code Violations": "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
};

interface CountyScraperProps {
  counties: County[];
  accentColor: string;
}

export default function CountyScraper({ counties, accentColor }: CountyScraperProps) {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [expandedSetup, setExpandedSetup] = useState(false);

  const leads = PLACEHOLDER_LEADS.map((lead, i) => ({
    ...lead,
    county: counties[i % counties.length]?.name || lead.county,
    address: lead.address + `, ${counties[i % counties.length]?.state || ""}`,
  }));

  const filtered = selectedCounty === "all"
    ? leads
    : leads.filter((l) => l.county === selectedCounty);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            County Scraper
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Daily motivated seller leads pulled directly from your target counties.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: accentColor + "15", color: accentColor, border: `1px solid ${accentColor}30` }}>
          <Clock className="w-3 h-3" />
          Runs daily 6:00 AM
        </div>
      </div>

      {/* Setup Status Banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0e0e1c 0%, #12121f 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
          onClick={() => setExpandedSetup(!expandedSetup)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor + "20", border: `1px solid ${accentColor}30` }}>
              <Database className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Scraper Setup Pending</div>
              <div className="text-white/40 text-xs mt-0.5">
                Live scraping activates upon transfer to your Railway account
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              Pending Setup
            </span>
            {expandedSetup ? (
              <ChevronUp className="w-4 h-4 text-white/30" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/30" />
            )}
          </div>
        </button>

        {expandedSetup && (
          <div className="px-6 pb-6 border-t border-white/[0.06]">
            <div className="mt-5 space-y-3">
              <div className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-4">Activation Steps</div>
              {[
                { n: 1, label: "Transfer Atlas to your Railway account", done: false },
                { n: 2, label: "Manus builds county-specific scrapers for each target county", done: false },
                { n: 3, label: "Scrapers tested and verified against live county data", done: false },
                { n: 4, label: "Daily cron job activated — runs every morning at 6:00 AM", done: false },
                { n: 5, label: "New leads appear in your dashboard automatically", done: false },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: accentColor + "20", color: accentColor, border: `1px solid ${accentColor}30` }}>
                    {n}
                  </div>
                  <span className="text-white/60 text-sm">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] mb-3">Target Counties</div>
              <div className="flex flex-wrap gap-2">
                {counties.map((c) => (
                  <span key={c.name} className="px-3 py-1 rounded-lg text-xs font-medium text-white/60" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {c.name}, {c.state}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* County filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCounty("all")}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={selectedCounty === "all"
            ? { backgroundColor: accentColor + "20", color: accentColor, border: `1px solid ${accentColor}35` }
            : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }
          }
        >
          All Counties ({leads.length})
        </button>
        {counties.map((c) => {
          const count = leads.filter((l) => l.county === c.name).length;
          const isSelected = selectedCounty === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setSelectedCounty(c.name)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={isSelected
                ? { backgroundColor: accentColor + "20", color: accentColor, border: `1px solid ${accentColor}35` }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Sample data notice */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/[0.18]">
        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-blue-300/70 text-xs">
          Showing sample lead data. Live county leads will populate here daily once your scraper is activated.
        </p>
      </div>

      {/* Leads table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Owner</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Address</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">County</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Lead Type</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Case #</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Date</th>
                <th className="text-left px-5 py-3.5 text-white/30 text-[11px] font-bold uppercase tracking-[0.12em]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, idx) => (
                <tr
                  key={lead.id}
                  className="transition-colors hover:bg-white/[0.025]"
                  style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <td className="px-5 py-4 text-white text-sm font-semibold">{lead.name}</td>
                  <td className="px-5 py-4 text-white/50 text-sm">{lead.address}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-white/50 text-sm">
                      <MapPin className="w-3 h-3" />
                      {lead.county}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_CONFIG[lead.type] || "bg-white/10 text-white/60"}`}>
                      {lead.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/35 text-xs font-mono">{lead.caseNumber}</td>
                  <td className="px-5 py-4 text-white/40 text-sm">{lead.date}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_CONFIG[lead.status].className}`}>
                      {STATUS_CONFIG[lead.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
