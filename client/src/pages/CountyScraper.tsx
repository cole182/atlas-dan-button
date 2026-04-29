// County Scraper — shows pre-loaded counties, placeholder leads, scraper setup status
// Back-end scraper will be built and configured upon client transfer to Railway

import { useState } from "react";
import { MapPin, Clock, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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

const STATUS_COLORS = {
  new: "bg-emerald-500/20 text-emerald-400",
  reviewed: "bg-yellow-500/20 text-yellow-400",
  contacted: "bg-blue-500/20 text-blue-400",
};

const TYPE_COLORS: Record<string, string> = {
  "Pre-Foreclosure": "bg-red-500/20 text-red-400",
  "Tax Delinquent": "bg-orange-500/20 text-orange-400",
  "Probate": "bg-purple-500/20 text-purple-400",
  "Sheriff Sale": "bg-pink-500/20 text-pink-400",
};

interface CountyScraperProps {
  counties: County[];
  accentColor: string;
}

export default function CountyScraper({ counties, accentColor }: CountyScraperProps) {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [expandedSetup, setExpandedSetup] = useState(false);

  // Replace placeholder county names with real ones
  const leads = PLACEHOLDER_LEADS.map((lead, i) => ({
    ...lead,
    county: counties[i % counties.length]?.name || lead.county,
    address: lead.address + `, ${counties[i % counties.length]?.state || ""}`,
  }));

  const filtered = selectedCounty === "all"
    ? leads
    : leads.filter((l) => l.county === selectedCounty);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">County Scraper</h1>
        <p className="text-white/50 text-sm mt-1">
          Daily motivated seller leads pulled directly from your target counties.
        </p>
      </div>

      {/* Setup Status Banner */}
      <div
        className="rounded-xl border border-white/10 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f17 0%, #1a1a2e 100%)" }}
      >
        <button
          onClick={() => setExpandedSetup(!expandedSetup)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Scraper Setup Pending</div>
              <div className="text-white/40 text-xs">
                Live scraping activates upon transfer to your Railway account
              </div>
            </div>
          </div>
          {expandedSetup ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </button>

        {expandedSetup && (
          <div className="px-5 pb-5 border-t border-white/8">
            <div className="mt-4 space-y-3">
              <p className="text-white/60 text-sm">
                When you transfer Atlas to your Railway account, your dedicated scraper will be built and configured to pull the following lead types from your counties every day at 6:00 AM:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {["Pre-Foreclosure Filings", "Tax Delinquent Records", "Probate Filings", "Sheriff Sale Listings", "Lis Pendens", "Code Violations"].map((type) => (
                  <div key={type} className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
                    {type}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/8">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Target Counties</div>
                <div className="flex flex-wrap gap-2">
                  {counties.map((c) => (
                    <span key={c.name} className="px-2 py-1 rounded-md bg-white/8 text-white/60 text-xs">
                      {c.name}, {c.state}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* County Filter + Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSelectedCounty("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCounty === "all"
              ? "text-white"
              : "bg-white/5 text-white/50 hover:text-white"
          }`}
          style={selectedCounty === "all" ? { backgroundColor: accentColor + "33", color: accentColor } : {}}
        >
          All Counties ({leads.length})
        </button>
        {counties.map((c) => {
          const count = leads.filter((l) => l.county === c.name).length;
          return (
            <button
              key={c.name}
              onClick={() => setSelectedCounty(c.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCounty === c.name
                  ? "text-white"
                  : "bg-white/5 text-white/50 hover:text-white"
              }`}
              style={selectedCounty === c.name ? { backgroundColor: accentColor + "33", color: accentColor } : {}}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Sample Data Notice */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-blue-300/80 text-xs">
          Showing sample lead data. Live county leads will populate here daily once your scraper is activated.
        </p>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Address</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">County</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Lead Type</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Case #</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white text-sm font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-white/60 text-sm">{lead.address}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-white/60 text-sm">
                      <MapPin className="w-3 h-3" />
                      {lead.county}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_COLORS[lead.type] || "bg-white/10 text-white/60"}`}>
                      {lead.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs font-mono">{lead.caseNumber}</td>
                  <td className="px-4 py-3 text-white/40 text-sm">{lead.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
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
