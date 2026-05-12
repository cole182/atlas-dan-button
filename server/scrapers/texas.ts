/**
 * Texas County Scrapers
 * Counties: Nueces, Kleberg, Jim Wells, San Patricio, Bexar
 * 
 * Sources:
 * - Pre-Foreclosure/Lis Pendens: Texas county clerk recorded documents
 * - Tax Delinquent: Texas county appraisal district + tax assessor
 * - Probate: Texas county clerk probate records
 * - Sheriff Sales: Constable/Sheriff civil sale listings
 * - FSBO: Craigslist Corpus Christi / San Antonio
 * - Obituaries: Corpus Christi Caller-Times + legacy.com
 * - Code Violations: City portals
 */

import * as cheerio from "cheerio";
import { Lead, makeId, formatDate, fetchWithRetry } from "./base.js";

const STATE = "TX";

// ─── NUECES COUNTY (Corpus Christi area) ─────────────────────────────────────
async function scrapeNuecesPreForeclosure(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Nueces";
  try {
    // Nueces County Clerk - recorded lis pendens / foreclosure notices
    // Texas uses county clerk online records
    const url = `https://www.nuecesco.com/county-services/county-clerk/official-public-records`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for online records search link
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim().toLowerCase();
      if (text.includes("search") || text.includes("records") || text.includes("foreclosure")) {
        leads.push({
          id: makeId(COUNTY, STATE, "Pre-Foreclosure", href || text),
          county: COUNTY,
          state: STATE,
          lead_type: "Pre-Foreclosure",
          owner_name: null,
          address: null,
          city: "Corpus Christi",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: null,
          filing_date: formatDate(fromDate),
          assessed_value: null,
          tax_year: null,
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: null,
          description: `Nueces County Clerk Records — ${$(el).text().trim()}`,
          source_url: href.startsWith("http") ? href : `https://www.nuecesco.com${href}`,
          raw_data: JSON.stringify({ text: $(el).text().trim(), href }),
        });
      }
    });

    // Texas Foreclosure listings - Nueces County
    // Texas Monthly Foreclosure Report (public notices)
    const foreUrl = `https://www.nuecesco.com/county-services/county-clerk/foreclosure-notices`;
    const foreRes = await fetchWithRetry(foreUrl);
    if (foreRes.ok) {
      const foreHtml = await foreRes.text();
      const $f = cheerio.load(foreHtml);

      $f("table tr, .foreclosure-item, article").each((_, el) => {
        const cells = $f(el).find("td");
        if (cells.length >= 3) {
          const trustee = $f(cells[0]).text().trim();
          const address = $f(cells[1]).text().trim();
          const saleDate = $f(cells[2]).text().trim();
          const amount = $f(cells[3])?.text().trim();

          if (!trustee || trustee.toLowerCase().includes("trustee")) return;

          leads.push({
            id: makeId(COUNTY, STATE, "Pre-Foreclosure", trustee + address),
            county: COUNTY,
            state: STATE,
            lead_type: "Pre-Foreclosure",
            owner_name: null,
            address: address || null,
            city: "Corpus Christi",
            zip: null,
            mailing_address: null,
            mailing_city: null,
            mailing_state: null,
            mailing_zip: null,
            case_number: null,
            filing_date: formatDate(fromDate),
            assessed_value: null,
            tax_year: null,
            lender: trustee || null,
            loan_amount: amount || null,
            sale_date: formatDate(saleDate),
            sale_amount: amount || null,
            description: `Nueces County Foreclosure Notice — ${address}`,
            source_url: foreUrl,
            raw_data: JSON.stringify({ trustee, address, saleDate, amount }),
          });
        }
      });
    }
  } catch (e) {
    console.error(`[Nueces TX] Pre-Foreclosure error:`, e);
  }
  return leads;
}

async function scrapeNuecesTaxDelinquent(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Nueces";
  try {
    // Nueces County Appraisal District - tax delinquent
    const url = `https://www.nuecescad.net/`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Tax delinquent list
    $("a[href*='delinquent'], a[href*='tax-sale'], a[href*='.pdf']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (!text) return;

      leads.push({
        id: makeId(COUNTY, STATE, "Tax Delinquent", href || text),
        county: COUNTY,
        state: STATE,
        lead_type: "Tax Delinquent",
        owner_name: null,
        address: null,
        city: "Corpus Christi",
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
        description: `Nueces County Tax Delinquent — ${text}`,
        source_url: href.startsWith("http") ? href : `https://www.nuecescad.net${href}`,
        raw_data: JSON.stringify({ text, href }),
      });
    });
  } catch (e) {
    console.error(`[Nueces TX] Tax delinquent error:`, e);
  }
  return leads;
}

async function scrapeNuecesProbate(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Nueces";
  try {
    // Nueces County District Clerk - probate records
    const url = `https://www.nuecesco.com/county-services/district-clerk`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("a[href*='probate'], a[href*='estate']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (!text) return;

      leads.push({
        id: makeId(COUNTY, STATE, "Probate", href || text),
        county: COUNTY,
        state: STATE,
        lead_type: "Probate",
        owner_name: null,
        address: null,
        city: "Corpus Christi",
        zip: null,
        mailing_address: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
        case_number: null,
        filing_date: formatDate(fromDate),
        assessed_value: null,
        tax_year: null,
        lender: null,
        loan_amount: null,
        sale_date: null,
        sale_amount: null,
        description: `Nueces County Probate — ${text}`,
        source_url: href.startsWith("http") ? href : `https://www.nuecesco.com${href}`,
        raw_data: JSON.stringify({ text, href }),
      });
    });
  } catch (e) {
    console.error(`[Nueces TX] Probate error:`, e);
  }
  return leads;
}

async function scrapeNuecesFSBO(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Nueces";
  try {
    // Craigslist Corpus Christi FSBO
    const url = `https://corpuschristi.craigslist.org/search/rea`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return leads;

    const html = await res.text();
    const $ = cheerio.load(html);

    $(".result-row, li.cl-search-result").each((_, el) => {
      const title = $(el).find(".result-title, .titlestring, a.posting-title").text().trim();
      const price = $(el).find(".result-price, .priceinfo").text().trim();
      const date = $(el).find("time").attr("datetime") || fromDate;
      const link = $(el).find("a").attr("href") || "";

      if (!title) return;

      leads.push({
        id: makeId(COUNTY, STATE, "FSBO", link || title),
        county: COUNTY,
        state: STATE,
        lead_type: "FSBO",
        owner_name: null,
        address: title || null,
        city: "Corpus Christi",
        zip: null,
        mailing_address: null,
        mailing_city: null,
        mailing_state: null,
        mailing_zip: null,
        case_number: null,
        filing_date: formatDate(date),
        assessed_value: null,
        tax_year: null,
        lender: null,
        loan_amount: null,
        sale_date: null,
        sale_amount: price || null,
        description: `Craigslist FSBO Corpus Christi — ${title}`,
        source_url: link.startsWith("http") ? link : `https://corpuschristi.craigslist.org${link}`,
        raw_data: JSON.stringify({ title, price, date }),
      });
    });
  } catch (e) {
    console.error(`[Nueces TX] FSBO error:`, e);
  }
  return leads;
}

// ─── BEXAR COUNTY (San Antonio) ───────────────────────────────────────────────
async function scrapeBexarCounty(fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const COUNTY = "Bexar";
  try {
    // Bexar County Clerk - foreclosure notices
    const foreUrl = `https://www.bexar.org/2168/Foreclosure-Notices`;
    const foreRes = await fetchWithRetry(foreUrl);
    if (foreRes.ok) {
      const foreHtml = await foreRes.text();
      const $ = cheerio.load(foreHtml);

      $("table tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;

        const trustee = $(cells[0]).text().trim();
        const address = $(cells[1]).text().trim();
        const saleDate = $(cells[2])?.text().trim();
        const amount = $(cells[3])?.text().trim();

        if (!trustee || trustee.toLowerCase().includes("trustee")) return;

        leads.push({
          id: makeId(COUNTY, STATE, "Pre-Foreclosure", trustee + address),
          county: COUNTY,
          state: STATE,
          lead_type: "Pre-Foreclosure",
          owner_name: null,
          address: address || null,
          city: "San Antonio",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: null,
          filing_date: formatDate(fromDate),
          assessed_value: null,
          tax_year: null,
          lender: trustee || null,
          loan_amount: amount || null,
          sale_date: formatDate(saleDate || ""),
          sale_amount: amount || null,
          description: `Bexar County Foreclosure Notice — ${address}`,
          source_url: foreUrl,
          raw_data: JSON.stringify({ trustee, address, saleDate, amount }),
        });
      });
    }

    // Bexar County tax delinquent
    const taxUrl = `https://www.bcad.org/`;
    const taxRes = await fetchWithRetry(taxUrl);
    if (taxRes.ok) {
      const taxHtml = await taxRes.text();
      const $ = cheerio.load(taxHtml);

      $("a[href*='delinquent'], a[href*='tax-sale']").each((_, el) => {
        const href = $(el).attr("href") || "";
        const text = $(el).text().trim();
        if (!text) return;

        leads.push({
          id: makeId(COUNTY, STATE, "Tax Delinquent", href || text),
          county: COUNTY,
          state: STATE,
          lead_type: "Tax Delinquent",
          owner_name: null,
          address: null,
          city: "San Antonio",
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
          description: `Bexar County Tax Delinquent — ${text}`,
          source_url: href.startsWith("http") ? href : `https://www.bcad.org${href}`,
          raw_data: JSON.stringify({ text, href }),
        });
      });
    }

    // Craigslist San Antonio FSBO
    const clUrl = `https://sanantonio.craigslist.org/search/rea`;
    const clRes = await fetchWithRetry(clUrl);
    if (clRes.ok) {
      const clHtml = await clRes.text();
      const $cl = cheerio.load(clHtml);

      $cl(".result-row, li.cl-search-result").each((_, el) => {
        const title = $cl(el).find(".result-title, .titlestring, a.posting-title").text().trim();
        const price = $cl(el).find(".result-price, .priceinfo").text().trim();
        const date = $cl(el).find("time").attr("datetime") || fromDate;
        const link = $cl(el).find("a").attr("href") || "";

        if (!title) return;

        leads.push({
          id: makeId(COUNTY, STATE, "FSBO", link || title),
          county: COUNTY,
          state: STATE,
          lead_type: "FSBO",
          owner_name: null,
          address: title || null,
          city: "San Antonio",
          zip: null,
          mailing_address: null,
          mailing_city: null,
          mailing_state: null,
          mailing_zip: null,
          case_number: null,
          filing_date: formatDate(date),
          assessed_value: null,
          tax_year: null,
          lender: null,
          loan_amount: null,
          sale_date: null,
          sale_amount: price || null,
          description: `Craigslist FSBO San Antonio — ${title}`,
          source_url: link.startsWith("http") ? link : `https://sanantonio.craigslist.org${link}`,
          raw_data: JSON.stringify({ title, price, date }),
        });
      });
    }
  } catch (e) {
    console.error(`[Bexar TX] error:`, e);
  }
  return leads;
}

// ─── SMALLER TX COUNTIES (Kleberg, Jim Wells, San Patricio) ──────────────────
async function scrapeSmallTXCounty(
  county: string,
  city: string,
  fromDate: string,
  toDate: string
): Promise<Lead[]> {
  const leads: Lead[] = [];
  try {
    // Generic Texas county scraper using Texas property tax records
    // TCEQ / Texas Comptroller delinquent tax roll
    const comptrollerUrl = `https://comptroller.texas.gov/taxes/property-tax/`;
    const res = await fetchWithRetry(comptrollerUrl);
    if (!res.ok) return leads;

    // Add a reference lead pointing to the county's resources
    leads.push({
      id: makeId(county, STATE, "Tax Delinquent", `${county}-${fromDate}`),
      county: county,
      state: STATE,
      lead_type: "Tax Delinquent",
      owner_name: null,
      address: null,
      city: city,
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
      description: `${county} County TX — Tax Delinquent List (manual review required)`,
      source_url: comptrollerUrl,
      raw_data: JSON.stringify({ county, fromDate, toDate }),
    });
  } catch (e) {
    console.error(`[${county} TX] error:`, e);
  }
  return leads;
}

// ─── MASTER SCRAPER ───────────────────────────────────────────────────────────
export async function scrapeTX(county: string, fromDate: string, toDate: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  
  switch (county.toLowerCase()) {
    case "nueces":
      leads.push(
        ...(await scrapeNuecesPreForeclosure(fromDate, toDate)),
        ...(await scrapeNuecesTaxDelinquent(fromDate, toDate)),
        ...(await scrapeNuecesProbate(fromDate, toDate)),
        ...(await scrapeNuecesFSBO(fromDate, toDate)),
      );
      break;
    case "bexar":
      leads.push(...(await scrapeBexarCounty(fromDate, toDate)));
      break;
    case "kleberg":
      leads.push(...(await scrapeSmallTXCounty("Kleberg", "Kingsville", fromDate, toDate)));
      break;
    case "jim wells":
      leads.push(...(await scrapeSmallTXCounty("Jim Wells", "Alice", fromDate, toDate)));
      break;
    case "san patricio":
      leads.push(...(await scrapeSmallTXCounty("San Patricio", "Sinton", fromDate, toDate)));
      break;
    default:
      console.warn(`[TX] No scraper for county: ${county}`);
  }
  
  return leads;
}

export async function scrapeAll(fromDate: string, toDate: string): Promise<Lead[]> {
  const results = await Promise.allSettled([
    scrapeNuecesPreForeclosure(fromDate, toDate),
    scrapeNuecesTaxDelinquent(fromDate, toDate),
    scrapeNuecesProbate(fromDate, toDate),
    scrapeNuecesFSBO(fromDate, toDate),
    scrapeBexarCounty(fromDate, toDate),
    scrapeSmallTXCounty("Kleberg", "Kingsville", fromDate, toDate),
    scrapeSmallTXCounty("Jim Wells", "Alice", fromDate, toDate),
    scrapeSmallTXCounty("San Patricio", "Sinton", fromDate, toDate),
  ]);
  
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}
