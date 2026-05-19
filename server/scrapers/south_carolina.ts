/**
 * South Carolina County Scrapers
 * Counties: Horry, Georgetown, Marion
 *
 * Sources:
 * - Horry Pre-Foreclosure / Lis Pendens: AcclaimWeb ROD API (acclaimweb.horrycounty.org)
 * - Horry Foreclosure Notices: AcclaimWeb ROD API (doc type 137 = NOTICE OF FORECLOSURE)
 * - Georgetown / Marion Pre-Foreclosure: SC Public Index (publicindex.sccourts.org)
 * - Tax Delinquent: County treasurer portals
 * - Probate: SC Public Index estate cases
 * - Sheriff Sales: County Sheriff civil sale listings
 */

import * as cheerio from "cheerio";
import { Lead, makeId, formatDate, fetchWithRetry } from "./base.js";

const STATE = "SC";

// ─── ACCLAIM WEB HELPERS (Horry County ROD) ──────────────────────────────────

const ACCLAIM_BASE = "https://acclaimweb.horrycounty.org/AcclaimWeb";

// AcclaimWeb document type IDs confirmed working
const ACCLAIM_DOC_TYPES = {
  LIS_PENDENS_DEED: { id: 132, label: "LIS PENDENS DEED (135)" },
  LIS_PENDENS_MTG:  { id: 210, label: "LIS PENDENS MTG (138)" },
  NOTICE_OF_FORECLOSURE: { id: 137, label: "NOTICE OF FORECLOSURE (143)" },
};

async function acclaimWebSearch(
  docTypeId: number,
  docTypeLabel: string,
  acclaimFrom: string, // MM/DD/YYYY
  acclaimTo: string    // MM/DD/YYYY
): Promise<any[]> {
  try {
    // Step 1: Get session cookie from disclaimer page
    const initRes = await fetchWithRetry(
      `${ACCLAIM_BASE}/search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType`
    );
    if (!initRes.ok) return [];

    const setCookie = initRes.headers.get("set-cookie") || "";
    const sessionMatch = setCookie.match(/ASP\.NET_SessionId=([^;]+)/i);
    const sessionId = sessionMatch ? sessionMatch[1] : "";
    if (!sessionId) return [];

    const cookieHeader = `ASP.NET_SessionId=${sessionId}`;

    // Step 2: Accept disclaimer (POST)
    await fetchWithRetry(`${ACCLAIM_BASE}/search/Disclaimer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader,
        Referer: `${ACCLAIM_BASE}/search/Disclaimer`,
      },
      body: "btnButton=I+accept+the+conditions+above.",
      redirect: "manual",
    });

    // Step 3: Submit document type search (stores criteria in session)
    const searchBody = new URLSearchParams({
      DocTypes: String(docTypeId),
      DocTypesDisplay_input: docTypeLabel,
      DocTypesDisplay: String(docTypeId),
      DateRangeList: " ",
      RecordDateFrom: acclaimFrom,
      RecordDateTo: acclaimTo,
    });

    const searchRes = await fetchWithRetry(
      `${ACCLAIM_BASE}/search/SearchTypeDocType`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookieHeader,
          Referer: `${ACCLAIM_BASE}/search/SearchTypeDocType`,
        },
        body: searchBody.toString(),
      }
    );
    if (!searchRes.ok) return [];

    // Step 4: Fetch grid results via AJAX (session holds search criteria)
    const gridRes = await fetchWithRetry(`${ACCLAIM_BASE}/Search/GridResults`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeader,
        "X-Requested-With": "XMLHttpRequest",
        Referer: `${ACCLAIM_BASE}/search/SearchTypeDocType`,
      },
      body: "sort=&page=1&pageSize=500&group=&filter=",
    });
    if (!gridRes.ok) return [];

    const json = await gridRes.json();
    return json?.Data || [];
  } catch (e) {
    console.error("[AcclaimWeb] Error:", e);
    return [];
  }
}

/** Convert YYYY-MM-DD → MM/DD/YYYY for AcclaimWeb */
function toAcclaimDate(d: string): string {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${m}/${day}/${y}`;
}

/** Convert AcclaimWeb YYYY/MM/DD → YYYY-MM-DD */
function acclaimDateToIso(d: string): string {
  return d ? d.replace(/\//g, "-") : d;
}

// ─── HORRY COUNTY ─────────────────────────────────────────────────────────────

async function scrapeHorryPreForeclosure(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Horry";

  const acclaimFrom = toAcclaimDate(fromDate);
  const acclaimTo = toAcclaimDate(toDate);

  // Fetch LIS PENDENS DEED + LIS PENDENS MTG in parallel
  const [lisDeed, lisMtg] = await Promise.all([
    acclaimWebSearch(ACCLAIM_DOC_TYPES.LIS_PENDENS_DEED.id, ACCLAIM_DOC_TYPES.LIS_PENDENS_DEED.label, acclaimFrom, acclaimTo),
    acclaimWebSearch(ACCLAIM_DOC_TYPES.LIS_PENDENS_MTG.id, ACCLAIM_DOC_TYPES.LIS_PENDENS_MTG.label, acclaimFrom, acclaimTo),
  ]);

  for (const rec of [...lisDeed, ...lisMtg]) {
    const name = rec.DirectName || rec.IndirectName || null;
    const caseMatch = (rec.Comments || "").match(/(?:case|c\/a\s*no\.?|no\.?)\s*([\w\d\s\-]+)/i);
    const caseNumber = caseMatch ? caseMatch[1].trim() : (rec.BookPage || null);
    const recordDate = acclaimDateToIso(rec.RecordDate);

    leads.push({
      id: makeId(COUNTY, STATE, "Pre-Foreclosure", String(rec.TransactionItemId || name || "")),
      county: COUNTY,
      state: STATE,
      lead_type: "Pre-Foreclosure",
      owner_name: name,
      address: null,
      city: "Myrtle Beach",
      zip: null,
      mailing_address: null,
      mailing_city: null,
      mailing_state: null,
      mailing_zip: null,
      case_number: caseNumber,
      filing_date: recordDate,
      assessed_value: null,
      tax_year: null,
      lender: null,
      loan_amount: rec.Consideration ? String(Math.round(rec.Consideration)) : null,
      sale_date: null,
      sale_amount: null,
      description: rec.Comments || rec.DocTypeDescription || "Lis Pendens",
      source_url: `${ACCLAIM_BASE}/Document/GetDocumentForView?transactionItemId=${rec.TransactionItemId}`,
      raw_data: JSON.stringify({ bookPage: rec.BookPage, docType: rec.DocTypeDescription }),
    });
  }

  return leads;
}

async function scrapeHorryForeclosure(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Horry";

  const acclaimFrom = toAcclaimDate(fromDate);
  const acclaimTo = toAcclaimDate(toDate);

  const records = await acclaimWebSearch(
    ACCLAIM_DOC_TYPES.NOTICE_OF_FORECLOSURE.id,
    ACCLAIM_DOC_TYPES.NOTICE_OF_FORECLOSURE.label,
    acclaimFrom,
    acclaimTo
  );

  for (const rec of records) {
    const name = rec.DirectName || rec.IndirectName || null;
    const recordDate = acclaimDateToIso(rec.RecordDate);

    leads.push({
      id: makeId(COUNTY, STATE, "Foreclosure", String(rec.TransactionItemId || name || "")),
      county: COUNTY,
      state: STATE,
      lead_type: "Foreclosure",
      owner_name: name,
      address: null,
      city: "Myrtle Beach",
      zip: null,
      mailing_address: null,
      mailing_city: null,
      mailing_state: null,
      mailing_zip: null,
      case_number: rec.BookPage || null,
      filing_date: recordDate,
      assessed_value: null,
      tax_year: null,
      lender: null,
      loan_amount: rec.Consideration ? String(Math.round(rec.Consideration)) : null,
      sale_date: null,
      sale_amount: null,
      description: rec.Comments || "Notice of Foreclosure",
      source_url: `${ACCLAIM_BASE}/Document/GetDocumentForView?transactionItemId=${rec.TransactionItemId}`,
      raw_data: JSON.stringify({ bookPage: rec.BookPage }),
    });
  }

  return leads;
}

async function scrapeHorryTaxDelinquent(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Horry";
  try {
    const url = "https://www.horrycountysc.gov/Departments/Treasurer/Delinquent-Taxes";
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (href.match(/\.(pdf|xlsx?|csv)/i) && text.toLowerCase().match(/tax|delinquent|sale/)) {
        leads.push({
          id: makeId(COUNTY, STATE, "Tax Delinquent", href),
          county: COUNTY,
          state: STATE,
          lead_type: "Tax Delinquent",
          owner_name: null,
          address: null,
          city: "Myrtle Beach",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: null,
          filing_date: formatDate(fromDate),
          assessed_value: null,
          tax_year: new Date().getFullYear().toString(),
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: null,
          description: `Horry County Tax Delinquent — ${text}`,
          source_url: href.startsWith("http") ? href : `https://www.horrycountysc.gov${href}`,
          raw_data: null,
        });
      }
    });

    $("table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 3) return;
      const parcel = $(cells[0]).text().trim();
      const owner = $(cells[1]).text().trim();
      const address = $(cells[2]).text().trim();
      const amount = cells.length > 3 ? $(cells[3]).text().trim() : null;
      if (!parcel || /parcel|account|#/i.test(parcel)) return;
      leads.push({
        id: makeId(COUNTY, STATE, "Tax Delinquent", parcel),
        county: COUNTY,
        state: STATE,
        lead_type: "Tax Delinquent",
        owner_name: owner || null,
        address: address || null,
        city: "Myrtle Beach",
        zip: null,
        mailing_address: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
        case_number: parcel,
        filing_date: formatDate(fromDate),
        assessed_value: null,
        tax_year: new Date().getFullYear().toString(),
        lender: null,
        loan_amount: null,
        sale_date: null,
        sale_amount: amount || null,
        description: `Horry County Tax Delinquent — Parcel ${parcel}`,
        source_url: url,
        raw_data: JSON.stringify({ parcel, owner, address, amount }),
      });
    });
  } catch (e) {
    console.error("[Horry Tax] Error:", e);
  }
  return leads;
}

async function scrapeHorryProbate(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Horry";
  try {
    // Horry County Probate via AcclaimWeb - PROBATE doc type
    // Also try SC Public Index for estate cases
    const scUrl = "https://publicindex.sccourts.org/Horry/PublicIndex/PISearch.aspx";
    const scRes = await fetchWithRetry(scUrl);
    if (!scRes.ok) return leads;

    const scHtml = await scRes.text();
    const $sc = cheerio.load(scHtml);
    const viewstate = $sc("input[name='__VIEWSTATE']").val() as string;
    const eventvalidation = $sc("input[name='__EVENTVALIDATION']").val() as string;
    if (!viewstate) return leads;

    const searchRes = await fetchWithRetry(scUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        __VIEWSTATE: viewstate,
        __EVENTVALIDATION: eventvalidation || "",
        "ctl00$ContentPlaceHolder1$ddlCaseType": "ESTATE",
        "ctl00$ContentPlaceHolder1$txtFiledDateFrom": fromDate,
        "ctl00$ContentPlaceHolder1$txtFiledDateTo": toDate,
        "ctl00$ContentPlaceHolder1$btnSearch": "Search",
      }).toString(),
    });

    if (!searchRes.ok) return leads;
    const resultHtml = await searchRes.text();
    const $r = cheerio.load(resultHtml);

    $r("table tr").each((_, row) => {
      const cells = $r(row).find("td");
      if (cells.length < 3) return;
      const caseNum = $r(cells[0]).text().trim();
      const caption = $r(cells[1]).text().trim();
      const filedDate = $r(cells[2]).text().trim();
      if (!caseNum || caseNum === "Case Number") return;
      leads.push({
        id: makeId(COUNTY, STATE, "Probate", caseNum),
        county: COUNTY,
        state: STATE,
        lead_type: "Probate",
        owner_name: caption || null,
        address: null,
        city: "Myrtle Beach",
        zip: null,
        mailing_address: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
        case_number: caseNum,
        filing_date: formatDate(filedDate),
        assessed_value: null,
        tax_year: null,
        lender: null,
        loan_amount: null,
        sale_date: null,
        sale_amount: null,
        description: `Horry County Probate — ${caption}`,
        source_url: scUrl,
        raw_data: JSON.stringify({ caseNum, caption, filedDate }),
      });
    });
  } catch (e) {
    console.error("[Horry Probate] Error:", e);
  }
  return leads;
}

async function scrapeHorrySheriffSales(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Horry";
  try {
    // Horry County Sheriff civil sales
    const url = "https://www.hcso.net/civil-process/sheriff-sales";
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 3) return;
      const caseNum = $(cells[0]).text().trim();
      const defendant = $(cells[1]).text().trim();
      const saleDate = $(cells[2]).text().trim();
      const address = cells.length > 3 ? $(cells[3]).text().trim() : null;
      if (!caseNum || /case|#/i.test(caseNum)) return;
      leads.push({
        id: makeId(COUNTY, STATE, "Sheriff Sale", caseNum),
        county: COUNTY,
        state: STATE,
        lead_type: "Sheriff Sale",
        owner_name: defendant || null,
        address: address || null,
        city: "Myrtle Beach",
        zip: null,
        mailing_address: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
        case_number: caseNum,
        filing_date: formatDate(fromDate),
        assessed_value: null,
        tax_year: null,
        lender: null,
        loan_amount: null,
        sale_date: formatDate(saleDate),
        sale_amount: null,
        description: `Horry County Sheriff Sale — ${defendant}`,
        source_url: url,
        raw_data: JSON.stringify({ caseNum, defendant, saleDate, address }),
      });
    });
  } catch (e) {
    console.error("[Horry Sheriff] Error:", e);
  }
  return leads;
}

// ─── GEORGETOWN COUNTY ────────────────────────────────────────────────────────

async function scrapeGeorgetownCounty(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Georgetown";

  // SC Public Index for foreclosure and estate cases
  const scUrl = "https://publicindex.sccourts.org/Georgetown/PublicIndex/PISearch.aspx";

  for (const caseType of ["FORECLOSURE", "ESTATE"]) {
    try {
      const initRes = await fetchWithRetry(scUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!initRes.ok) continue;

      const initHtml = await initRes.text();
      const $sc = cheerio.load(initHtml);
      const viewstate = $sc("input[name='__VIEWSTATE']").val() as string;
      const eventvalidation = $sc("input[name='__EVENTVALIDATION']").val() as string;
      if (!viewstate) continue;

      const searchRes = await fetchWithRetry(scUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: scUrl,
        },
        body: new URLSearchParams({
          __VIEWSTATE: viewstate,
          __EVENTVALIDATION: eventvalidation || "",
          "ctl00$ContentPlaceHolder1$ddlCaseType": caseType,
          "ctl00$ContentPlaceHolder1$txtFiledDateFrom": fromDate,
          "ctl00$ContentPlaceHolder1$txtFiledDateTo": toDate,
          "ctl00$ContentPlaceHolder1$btnSearch": "Search",
        }).toString(),
      });

      if (!searchRes.ok) continue;
      const resultHtml = await searchRes.text();
      const $r = cheerio.load(resultHtml);
      const leadType = caseType === "FORECLOSURE" ? "Pre-Foreclosure" : "Probate";

      $r("table tr").each((_, row) => {
        const cells = $r(row).find("td");
        if (cells.length < 3) return;
        const caseNum = $r(cells[0]).text().trim();
        const caption = $r(cells[1]).text().trim();
        const filedDate = $r(cells[2]).text().trim();
        if (!caseNum || caseNum === "Case Number") return;
        leads.push({
          id: makeId(COUNTY, STATE, leadType, caseNum),
          county: COUNTY,
          state: STATE,
          lead_type: leadType,
          owner_name: caption || null,
          address: null,
          city: "Georgetown",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: caseNum,
          filing_date: formatDate(filedDate),
          assessed_value: null,
          tax_year: null,
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: null,
          description: `Georgetown County ${leadType} — ${caption}`,
          source_url: scUrl,
          raw_data: JSON.stringify({ caseNum, caption, filedDate, caseType }),
        });
      });
    } catch (e) {
      console.error(`[Georgetown SC] ${caseType} error:`, e);
    }
  }

  // Georgetown County tax delinquent
  try {
    const taxUrl = "https://www.gtcountysc.gov/departments/treasurer";
    const taxRes = await fetchWithRetry(taxUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (taxRes.ok) {
      const taxHtml = await taxRes.text();
      const $ = cheerio.load(taxHtml);
      $("table tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;
        const parcel = $(cells[0]).text().trim();
        const owner = $(cells[1]).text().trim();
        const address = cells.length > 2 ? $(cells[2]).text().trim() : null;
        const amount = cells.length > 3 ? $(cells[3]).text().trim() : null;
        if (!parcel || /parcel|account/i.test(parcel)) return;
        leads.push({
          id: makeId(COUNTY, STATE, "Tax Delinquent", parcel),
          county: COUNTY,
          state: STATE,
          lead_type: "Tax Delinquent",
          owner_name: owner || null,
          address: address || null,
          city: "Georgetown",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: parcel,
          filing_date: formatDate(fromDate),
          assessed_value: null,
          tax_year: new Date().getFullYear().toString(),
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: amount || null,
          description: `Georgetown County Tax Delinquent — ${parcel}`,
          source_url: taxUrl,
          raw_data: JSON.stringify({ parcel, owner, address, amount }),
        });
      });
    }
  } catch (e) {
    console.error("[Georgetown Tax] Error:", e);
  }

  return leads;
}

// ─── MARION COUNTY ────────────────────────────────────────────────────────────

async function scrapeMarionCounty(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Marion";

  const scUrl = "https://publicindex.sccourts.org/Marion/PublicIndex/PISearch.aspx";

  for (const caseType of ["FORECLOSURE", "ESTATE"]) {
    try {
      const initRes = await fetchWithRetry(scUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!initRes.ok) continue;

      const initHtml = await initRes.text();
      const $sc = cheerio.load(initHtml);
      const viewstate = $sc("input[name='__VIEWSTATE']").val() as string;
      const eventvalidation = $sc("input[name='__EVENTVALIDATION']").val() as string;
      if (!viewstate) continue;

      const searchRes = await fetchWithRetry(scUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: scUrl,
        },
        body: new URLSearchParams({
          __VIEWSTATE: viewstate,
          __EVENTVALIDATION: eventvalidation || "",
          "ctl00$ContentPlaceHolder1$ddlCaseType": caseType,
          "ctl00$ContentPlaceHolder1$txtFiledDateFrom": fromDate,
          "ctl00$ContentPlaceHolder1$txtFiledDateTo": toDate,
          "ctl00$ContentPlaceHolder1$btnSearch": "Search",
        }).toString(),
      });

      if (!searchRes.ok) continue;
      const resultHtml = await searchRes.text();
      const $r = cheerio.load(resultHtml);
      const leadType = caseType === "FORECLOSURE" ? "Pre-Foreclosure" : "Probate";

      $r("table tr").each((_, row) => {
        const cells = $r(row).find("td");
        if (cells.length < 3) return;
        const caseNum = $r(cells[0]).text().trim();
        const caption = $r(cells[1]).text().trim();
        const filedDate = $r(cells[2]).text().trim();
        if (!caseNum || caseNum === "Case Number") return;
        leads.push({
          id: makeId(COUNTY, STATE, leadType, caseNum),
          county: COUNTY,
          state: STATE,
          lead_type: leadType,
          owner_name: caption || null,
          address: null,
          city: "Marion",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: caseNum,
          filing_date: formatDate(filedDate),
          assessed_value: null,
          tax_year: null,
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: null,
          description: `Marion County ${leadType} — ${caption}`,
          source_url: scUrl,
          raw_data: JSON.stringify({ caseNum, caption, filedDate, caseType }),
        });
      });
    } catch (e) {
      console.error(`[Marion SC] ${caseType} error:`, e);
    }
  }

  return leads;
}

// ─── MASTER SCRAPER ───────────────────────────────────────────────────────────

export async function scrapeSC(county: string, fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];

  switch (county.toLowerCase()) {
    case "horry":
      leads.push(
        ...(await scrapeHorryPreForeclosure(fromDate, toDate)),
        ...(await scrapeHorryForeclosure(fromDate, toDate)),
        ...(await scrapeHorryTaxDelinquent(fromDate, toDate)),
        ...(await scrapeHorryProbate(fromDate, toDate)),
        ...(await scrapeHorrySheriffSales(fromDate, toDate)),
      );
      break;
    case "georgetown":
      leads.push(...(await scrapeGeorgetownCounty(fromDate, toDate)));
      break;
    case "marion":
      leads.push(...(await scrapeMarionCounty(fromDate, toDate)));
      break;
    default:
      console.warn(`[SC] No scraper for county: ${county}`);
  }

  return leads;
}

export async function scrapeAll(fromDate: string, toDate: string): Promise<Lead[]> {
  const results = await Promise.allSettled([
    scrapeHorryPreForeclosure(fromDate, toDate),
    scrapeHorryForeclosure(fromDate, toDate),
    scrapeHorryTaxDelinquent(fromDate, toDate),
    scrapeHorryProbate(fromDate, toDate),
    scrapeHorrySheriffSales(fromDate, toDate),
    scrapeGeorgetownCounty(fromDate, toDate),
    scrapeMarionCounty(fromDate, toDate),
  ]);

  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
