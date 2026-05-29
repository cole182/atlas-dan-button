import { createHash } from "crypto";

export interface Lead {
  id: string;
  county: string;
  state: string;
  lead_type: string;
  owner_name: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  case_number: string | null;
  filing_date: string | null;
  assessed_value: string | null;
  tax_year: string | null;
  lender: string | null;
  loan_amount: string | null;
  sale_date: string | null;
  sale_amount: string | null;
  description: string | null;
  source_url: string | null;
  raw_data: string | null;
}

export function makeId(...parts: (string | null | undefined)[]): string {
  return createHash("sha256").update(parts.filter(Boolean).join("|")).digest("hex").slice(0, 16);
}

export function formatDate(d: string | null | undefined): string | null {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toISOString().split("T")[0];
}

// URLs that should NEVER go through ScraperAPI
const SKIP_SCRAPER_PATTERNS = [
  "uscourts.gov",      // PACER — requires court auth
  "craigslist.org",    // Craigslist — blocks ScraperAPI too
  "scraperapi.com",    // Already proxied
  "api.scraperapi",    // Already proxied
  "data.kcmo.org",     // Open data API — no bot blocking
  "data.cincinnati",   // Open data API — no bot blocking
  "opendata.",         // Open data APIs
  "/resource/",        // Socrata API endpoints
  ".json",             // JSON API calls
  ".xml",              // XML/RSS feeds
  "rss_outside",       // PACER RSS
];

function shouldSkipScraperAPI(url: string): boolean {
  return SKIP_SCRAPER_PATTERNS.some(p => url.includes(p));
}

/**
 * fetchWithRetry — standard HTML fetch, routes through ScraperAPI for
 * government/county sites that block server IPs (403/timeout).
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  const SCRAPER_KEY = process.env.SCRAPER_API_KEY;
  const useProxy = !!SCRAPER_KEY && !shouldSkipScraperAPI(url);
  const fetchUrl = useProxy
    ? `http://api.scraperapi.com?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(url)}&render=false`
    : url;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    ...options.headers,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s — ScraperAPI can be slow
      let res: Response;
      try {
        res = await fetch(fetchUrl, { ...options, headers, signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
      if (res.ok || res.status === 404) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

/**
 * fetchRendered — uses ScraperAPI with render=true for JavaScript-heavy pages
 * (e.g. React/Angular portals like RealAuction, some county sheriff sites).
 * Falls back to regular fetch if no ScraperAPI key.
 */
export async function fetchRendered(url: string, retries = 2): Promise<Response> {
  const SCRAPER_KEY = process.env.SCRAPER_API_KEY;
  if (!SCRAPER_KEY) {
    return fetchWithRetry(url, {}, retries);
  }
  const fetchUrl = `http://api.scraperapi.com?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(url)}&render=true`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  };
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // rendered pages take longer
      let res: Response;
      try {
        res = await fetch(fetchUrl, { headers, signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
      if (res.ok || res.status === 404) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error(`fetchRendered failed after ${retries} retries: ${url}`);
}

export interface CountyConfig {
  name: string;
  state: string;
  leadTypes: string[];
}
