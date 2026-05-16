import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { db, upsertLead, getLeads, updateLeadStatus, getStats, logScrapeRun, finishScrapeRun } from "./db.js";
import { runAllScrapers, getDateRange } from "./scrapers/index.js";
import { sendDailyReport } from "./email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CLIENT CONFIG (injected per client via env vars) ─────────────────────────
const CLIENT_CONFIG = {
  name: process.env.CLIENT_NAME || "Atlas",
  email: process.env.CLIENT_EMAIL || "",
  counties: (JSON.parse(process.env.CLIENT_COUNTIES || "[]") as Array<Record<string, string>>).map(c => ({ name: c.name || c.county || "", state: c.state || "" })),
};

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
function leadsToCSV(leads: Record<string, string | null>[]): string {
  const headers = [
    "Lead Type", "County", "State", "Owner Name", "Property Address", "City", "Zip",
    "Mailing Address", "Mailing City", "Mailing State", "Mailing Zip",
    "Case Number", "Filing Date", "Assessed Value", "Tax Year",
    "Lender", "Loan Amount", "Sale Date", "Sale Amount", "Description", "Source URL", "Status"
  ];
  const fields = [
    "lead_type", "county", "state", "owner_name", "address", "city", "zip",
    "mailing_address", "mailing_city", "mailing_state", "mailing_zip",
    "case_number", "filing_date", "assessed_value", "tax_year",
    "lender", "loan_amount", "sale_date", "sale_amount", "description", "source_url", "status"
  ];
  const escape = (v: string | null | undefined) => {
    if (!v) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = leads.map(l => fields.map(f => escape(l[f] as string)).join(","));
  return [headers.join(","), ...rows].join("\n");
}

// ─── SCRAPE JOB STATE ─────────────────────────────────────────────────────────
let scrapeInProgress = false;
let lastScrapeLog: string[] = [];

async function runScrapeJob(fromDate: string, toDate: string): Promise<number> {
  if (scrapeInProgress) throw new Error("Scrape already in progress");
  scrapeInProgress = true;
  lastScrapeLog = [];
  let totalNew = 0;

  try {
    const counties = CLIENT_CONFIG.counties.map(c => ({
      name: c.name,
      state: c.state,
      leadTypes: ["Pre-Foreclosure", "Tax Delinquent", "Probate", "Sheriff Sale", "FSBO", "Obituary", "Code Violation", "Divorce", "Fire Damage"],
    }));

    const { leads, errors } = await runAllScrapers(counties, fromDate, toDate, (msg) => {
      lastScrapeLog.push(msg);
      console.log(`[Scrape] ${msg}`);
    });

    for (const lead of leads) {
      const isNew = upsertLead(lead as unknown as Record<string, string | null>);
      if (isNew) totalNew++;
    }

    if (errors.length) lastScrapeLog.push(`⚠ ${errors.length} errors: ${errors.join("; ")}`);
    lastScrapeLog.push(`✓ Done: ${totalNew} new leads saved`);
    console.log(`[Scrape] Complete: ${totalNew} new leads`);
  } finally {
    scrapeInProgress = false;
  }
  return totalNew;
}

// ─── DAILY CRON (6 AM local) ──────────────────────────────────────────────────
function scheduleDailyScrape() {
  const now = new Date();
  const next6am = new Date(now);
  next6am.setHours(6, 0, 0, 0);
  if (next6am <= now) next6am.setDate(next6am.getDate() + 1);
  const msUntil = next6am.getTime() - now.getTime();

  setTimeout(async () => {
    console.log("[Cron] Running daily scrape...");
    const { fromDate, toDate } = getDateRange(1); // last 24 hours
    try {
      const newLeads = await runScrapeJob(fromDate, toDate);
      if (CLIENT_CONFIG.email && newLeads > 0) {
        const allLeads = getLeads({ from_date: toDate, to_date: toDate }) as Record<string, string | null>[];
        await sendDailyReport(CLIENT_CONFIG.email, CLIENT_CONFIG.name, allLeads as any, toDate);
      }
    } catch (e) {
      console.error("[Cron] Daily scrape failed:", e);
    }
    scheduleDailyScrape(); // reschedule for next day
  }, msUntil);

  console.log(`[Cron] Next scrape scheduled for ${next6am.toISOString()}`);
}

// ─── EXPRESS APP ──────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── API Routes ──────────────────────────────────────────────────────────────

  // GET /api/leads — list leads with filters
  app.get("/api/leads", (req, res) => {
    const { county, lead_type, status, from_date, to_date, limit, offset } = req.query as Record<string, string>;
    const leads = getLeads({
      county: county || undefined,
      lead_type: lead_type || undefined,
      status: status || undefined,
      from_date: from_date || undefined,
      to_date: to_date || undefined,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });
    res.json({ leads, total: leads.length });
  });

  // GET /api/leads/export — download CSV
  app.get("/api/leads/export", (req, res) => {
    const { county, lead_type, status, from_date, to_date } = req.query as Record<string, string>;
    const leads = getLeads({
      county: county || undefined,
      lead_type: lead_type || undefined,
      status: status || undefined,
      from_date: from_date || undefined,
      to_date: to_date || undefined,
    }) as Record<string, string | null>[];
    const csv = leadsToCSV(leads);
    const date = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="atlas-leads-${date}.csv"`);
    res.send(csv);
  });

  // PATCH /api/leads/:id — update status/notes
  app.patch("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    updateLeadStatus(id, status, notes);
    res.json({ ok: true });
  });

  // GET /api/stats — dashboard stats
  app.get("/api/stats", (_req, res) => {
    res.json(getStats());
  });

  // GET /api/config — client config (counties, name)
  app.get("/api/config", (_req, res) => {
    res.json({ name: CLIENT_CONFIG.name, counties: CLIENT_CONFIG.counties });
  });

  // POST /api/scrape — trigger manual scrape
  app.post("/api/scrape", async (req, res) => {
    if (scrapeInProgress) {
      return res.status(409).json({ error: "Scrape already in progress" });
    }
    const { from_date, to_date } = req.body;
    const fromDate = from_date || getDateRange(1).fromDate;
    const toDate = to_date || getDateRange(0).toDate;

    // Run in background
    runScrapeJob(fromDate, toDate).catch(console.error);
    res.json({ ok: true, message: "Scrape started", from_date: fromDate, to_date: toDate });
  });

  // GET /api/scrape/status — check if scrape is running
  app.get("/api/scrape/status", (_req, res) => {
    res.json({ in_progress: scrapeInProgress, log: lastScrapeLog });
  });

  // POST /api/scrape/historical — pull last N days (up to 90)
  app.post("/api/scrape/historical", async (req, res) => {
    if (scrapeInProgress) {
      return res.status(409).json({ error: "Scrape already in progress" });
    }
    const { days_back } = req.body;
    const daysBack = Math.min(parseInt(days_back) || 30, 90);
    const { fromDate, toDate } = getDateRange(daysBack);

    runScrapeJob(fromDate, toDate).catch(console.error);
    res.json({ ok: true, message: `Historical scrape started (${daysBack} days)`, from_date: fromDate, to_date: toDate });
  });

  // POST /api/seed — inject demo leads (temporary, for dashboard screenshots)
  app.post("/api/seed", (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
    const seedLeads = [
      { id: "SC-HORRY-PREFC-001", county: "Horry", state: "SC", lead_type: "Pre-Foreclosure", owner_name: "Michael & Tanya Burroughs", address: "1204 Oleander Dr", city: "Myrtle Beach", zip: "29577", mailing_address: "1204 Oleander Dr", mailing_city: "Myrtle Beach", mailing_state: "SC", mailing_zip: "29577", case_number: "2026-CP-26-01847", filing_date: twoDaysAgo, assessed_value: "218000", tax_year: "2025", lender: "Caliber Home Loans", loan_amount: "184000", sale_date: null, sale_amount: null, description: "Horry County Pre-Foreclosure — 2026-CP-26-01847", source_url: "https://www.horrycounty.org/Departments/Clerk-of-Court", status: "New", notes: null, scraped_at: today },
      { id: "SC-HORRY-PREFC-002", county: "Horry", state: "SC", lead_type: "Pre-Foreclosure", owner_name: "Denise Carmichael", address: "3301 Glenns Bay Rd", city: "Surfside Beach", zip: "29575", mailing_address: "PO Box 1441", mailing_city: "Charlotte", mailing_state: "NC", mailing_zip: "28201", case_number: "2026-CP-26-01992", filing_date: yesterday, assessed_value: "267000", tax_year: "2025", lender: "PHH Mortgage", loan_amount: "221000", sale_date: null, sale_amount: null, description: "Horry County Pre-Foreclosure — 2026-CP-26-01992", source_url: "https://www.horrycounty.org/Departments/Clerk-of-Court", status: "New", notes: null, scraped_at: today },
      { id: "SC-HORRY-TAXDEL-001", county: "Horry", state: "SC", lead_type: "Tax Delinquent", owner_name: "Grand Strand Rentals LLC", address: "8812 N Kings Hwy", city: "Myrtle Beach", zip: "29572", mailing_address: "PO Box 9901", mailing_city: "Atlanta", mailing_state: "GA", mailing_zip: "30301", case_number: null, filing_date: twoDaysAgo, assessed_value: "341000", tax_year: "2023", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Horry County Tax Delinquent — LLC, 3 years unpaid", source_url: "https://www.horrycounty.org/Departments/Treasurer", status: "New", notes: null, scraped_at: today },
      { id: "SC-HORRY-PROBATE-001", county: "Horry", state: "SC", lead_type: "Probate", owner_name: "Estate of James L. Conway", address: "4401 Socastee Blvd", city: "Myrtle Beach", zip: "29588", mailing_address: "c/o Linda Conway, 4401 Socastee Blvd", mailing_city: "Myrtle Beach", mailing_state: "SC", mailing_zip: "29588", case_number: "2026-ES-26-00312", filing_date: today, assessed_value: "298000", tax_year: "2025", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Horry County Probate — Estate of James L. Conway", source_url: "https://www.horrycounty.org/Departments/Probate-Court", status: "Reviewed", notes: "Heir motivated — wants to close fast", scraped_at: today },
      { id: "SC-HORRY-SHERIFF-001", county: "Horry", state: "SC", lead_type: "Sheriff Sale", owner_name: "Robert Tillman", address: "2210 Highway 501", city: "Conway", zip: "29526", mailing_address: "2210 Highway 501", mailing_city: "Conway", mailing_state: "SC", mailing_zip: "29526", case_number: "2025-CP-26-04881", filing_date: yesterday, assessed_value: "156000", tax_year: "2025", lender: "Rushmore Loan Management", loan_amount: "128000", sale_date: "2026-06-10", sale_amount: "128000", description: "Horry County Sheriff Sale — June 10, 2026", source_url: "https://www.horrycounty.org/Departments/Sheriff", status: "New", notes: null, scraped_at: today },
      { id: "SC-GEORGETOWN-PREFC-001", county: "Georgetown", state: "SC", lead_type: "Pre-Foreclosure", owner_name: "Earl & Patricia Singleton", address: "711 Fraser St", city: "Georgetown", zip: "29440", mailing_address: "711 Fraser St", mailing_city: "Georgetown", mailing_state: "SC", mailing_zip: "29440", case_number: "2026-CP-22-00441", filing_date: twoDaysAgo, assessed_value: "187000", tax_year: "2025", lender: "Nationstar Mortgage", loan_amount: "152000", sale_date: null, sale_amount: null, description: "Georgetown County Pre-Foreclosure — 2026-CP-22-00441", source_url: "https://www.georgetowncountysc.org/clerk", status: "New", notes: null, scraped_at: today },
      { id: "SC-GEORGETOWN-TAXDEL-001", county: "Georgetown", state: "SC", lead_type: "Tax Delinquent", owner_name: "Waccamaw Properties LLC", address: "3301 Pawleys Island Hwy", city: "Pawleys Island", zip: "29585", mailing_address: "PO Box 2201", mailing_city: "Columbia", mailing_state: "SC", mailing_zip: "29201", case_number: null, filing_date: yesterday, assessed_value: "412000", tax_year: "2022", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Georgetown County Tax Delinquent — Waterfront LLC", source_url: "https://www.georgetowncountysc.org/treasurer", status: "New", notes: null, scraped_at: today },
      { id: "SC-MARION-PREFC-001", county: "Marion", state: "SC", lead_type: "Pre-Foreclosure", owner_name: "Freddie & Gloria Jackson", address: "1812 N Main St", city: "Marion", zip: "29571", mailing_address: "1812 N Main St", mailing_city: "Marion", mailing_state: "SC", mailing_zip: "29571", case_number: "2026-CP-33-00189", filing_date: today, assessed_value: "98000", tax_year: "2025", lender: "BSI Financial Services", loan_amount: "81000", sale_date: null, sale_amount: null, description: "Marion County Pre-Foreclosure — 2026-CP-33-00189", source_url: "https://www.marionsc.org/clerk", status: "Contacted", notes: "Owner called back — open to offer", scraped_at: today },
      { id: "SC-MARION-TAXDEL-001", county: "Marion", state: "SC", lead_type: "Tax Delinquent", owner_name: "Billy Ray Atkinson", address: "4402 Hwy 76", city: "Mullins", zip: "29574", mailing_address: "PO Box 441", mailing_city: "Florence", mailing_state: "SC", mailing_zip: "29501", case_number: null, filing_date: twoDaysAgo, assessed_value: "67000", tax_year: "2023", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Marion County Tax Delinquent — 2 years unpaid", source_url: "https://www.marionsc.org/treasurer", status: "New", notes: null, scraped_at: today },
      { id: "SC-HORRY-PREFC-003", county: "Horry", state: "SC", lead_type: "Pre-Foreclosure", owner_name: "Christopher & Amanda Fowler", address: "9901 Shore Dr", city: "Myrtle Beach", zip: "29572", mailing_address: "9901 Shore Dr", mailing_city: "Myrtle Beach", mailing_state: "SC", mailing_zip: "29572", case_number: "2026-CP-26-02101", filing_date: today, assessed_value: "445000", tax_year: "2025", lender: "Quicken Loans", loan_amount: "378000", sale_date: null, sale_amount: null, description: "Horry County Pre-Foreclosure — Oceanfront property", source_url: "https://www.horrycounty.org/Departments/Clerk-of-Court", status: "New", notes: null, scraped_at: today },
      { id: "SC-GEORGETOWN-PROBATE-001", county: "Georgetown", state: "SC", lead_type: "Probate", owner_name: "Estate of Thomas A. Brown", address: "2201 Highmarket St", city: "Georgetown", zip: "29440", mailing_address: "c/o Angela Brown, 2201 Highmarket St", mailing_city: "Georgetown", mailing_state: "SC", mailing_zip: "29440", case_number: "2026-ES-22-00098", filing_date: yesterday, assessed_value: "223000", tax_year: "2025", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Georgetown County Probate — Estate of Thomas A. Brown", source_url: "https://www.georgetowncountysc.org/probate", status: "New", notes: null, scraped_at: today },
      { id: "SC-HORRY-TAXDEL-002", county: "Horry", state: "SC", lead_type: "Tax Delinquent", owner_name: "Wayne Holliday", address: "6612 Dick Pond Rd", city: "Myrtle Beach", zip: "29588", mailing_address: "PO Box 3312", mailing_city: "Raleigh", mailing_state: "NC", mailing_zip: "27601", case_number: null, filing_date: twoDaysAgo, assessed_value: "178000", tax_year: "2023", lender: null, loan_amount: null, sale_date: null, sale_amount: null, description: "Horry County Tax Delinquent — Out-of-state owner", source_url: "https://www.horrycounty.org/Departments/Treasurer", status: "New", notes: null, scraped_at: today },
    ];
    let inserted = 0;
    for (const lead of seedLeads) {
      const isNew = upsertLead(lead as unknown as Record<string, string | null>);
      if (isNew) inserted++;
    }
    res.json({ ok: true, inserted, total: seedLeads.length });
  });

  // ── Static Frontend ──────────────────────────────────────────────────────────
  const staticPath = path.resolve(__dirname, "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`[Atlas] Server running on http://localhost:${port}/`);
    console.log(`[Atlas] Client: ${CLIENT_CONFIG.name}`);
    console.log(`[Atlas] Counties: ${CLIENT_CONFIG.counties.map(c => `${c.name} ${c.state}`).join(", ")}`);
    scheduleDailyScrape();
  });
}

startServer().catch(console.error);
