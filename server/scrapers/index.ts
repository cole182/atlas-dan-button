import { Lead, CountyConfig } from "./base.js";
import * as suffolkNY from "./suffolk_ny.js";
import * as missouri from "./missouri.js";
import * as wisconsin from "./wisconsin.js";
import { scrapeAlabama, scrapeBankruptcy as scrapeAlabamaBankruptcy } from "./alabama.js";
import { scrapeOhio, scrapeBankruptcy as scrapeOhioBankruptcy, scrapeObituaries as scrapeOhioObituaries } from "./ohio.js";
import { scrapeSC, scrapeBankruptcy as scrapeSCBankruptcy, scrapeObituaries as scrapeSCObituaries } from "./south_carolina.js";
import { scrapeTX } from "./texas.js";

// Run all scrapers for the configured counties
export async function runAllScrapers(
  counties: CountyConfig[],
  fromDate: string,
  toDate: string,
  onProgress?: (msg: string) => void
): Promise<{ leads: Lead[]; errors: string[] }> {
  const allLeads: Lead[] = [];
  const errors: string[] = [];

  // Group counties by state
  const stateGroups = new Map<string, CountyConfig[]>();
  for (const county of counties) {
    const key = county.state;
    if (!stateGroups.has(key)) stateGroups.set(key, []);
    stateGroups.get(key)!.push(county);
  }

  for (const [state, stateCounties] of stateGroups) {
    // States with a single scrapeAll function
    if (state === "MO") {
      try {
        onProgress?.(`Scraping MO counties: ${stateCounties.map(c => c.name).join(", ")}...`);
        const leads = await missouri.scrapeAll(fromDate, toDate);
        const configuredNames = new Set(stateCounties.map(c => c.name));
        const filtered = leads.filter(l => configuredNames.has(l.county));
        allLeads.push(...filtered);
        onProgress?.(`✓ MO: ${filtered.length} leads found`);
      } catch (e) {
        const msg = `Error scraping MO: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      // Also run MO state-wide bankruptcy
      try {
        onProgress?.(`Scraping MO bankruptcy (state-wide)...`);
        const bkLeads = await missouri.scrapeBankruptcy(fromDate, toDate);
        allLeads.push(...bkLeads);
        onProgress?.(`✓ MO Bankruptcy: ${bkLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping MO bankruptcy: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      continue;
    }

    if (state === "WI") {
      try {
        onProgress?.(`Scraping WI counties: ${stateCounties.map(c => c.name).join(", ")}...`);
        const leads = await wisconsin.scrapeAll(fromDate, toDate);
        const configuredNames = new Set(stateCounties.map(c => c.name));
        const filtered = leads.filter(l => configuredNames.has(l.county));
        allLeads.push(...filtered);
        onProgress?.(`✓ WI: ${filtered.length} leads found`);
      } catch (e) {
        const msg = `Error scraping WI: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      // Also run WI state-wide bankruptcy
      try {
        onProgress?.(`Scraping WI bankruptcy (state-wide)...`);
        const bkLeads = await wisconsin.scrapeBankruptcy(fromDate, toDate);
        allLeads.push(...bkLeads);
        onProgress?.(`✓ WI Bankruptcy: ${bkLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping WI bankruptcy: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      continue;
    }

    if (state === "NY") {
      try {
        onProgress?.(`Scraping NY counties: ${stateCounties.map(c => c.name).join(", ")}...`);
        const leads = await suffolkNY.scrapeAll(fromDate, toDate);
        allLeads.push(...leads);
        onProgress?.(`✓ NY: ${leads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping NY: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      continue;
    }

    // States with county-by-county scrapers
    for (const county of stateCounties) {
      try {
        onProgress?.(`Scraping ${county.name}, ${county.state}...`);
        let leads: Lead[] = [];

        if (state === "AL") {
          leads = await scrapeAlabama(county.name, fromDate, toDate);
        } else if (state === "OH") {
          leads = await scrapeOhio(county.name, fromDate, toDate);
        } else if (state === "SC") {
          leads = await scrapeSC(county.name, fromDate, toDate);
        } else if (state === "TX") {
          leads = await scrapeTX(county.name, fromDate, toDate);
        } else {
          const msg = `No scraper registered for ${county.name}, ${county.state}`;
          errors.push(msg);
          onProgress?.(`✗ ${msg}`);
          continue;
        }

        allLeads.push(...leads);
        onProgress?.(`✓ ${county.name} ${county.state}: ${leads.length} leads`);
      } catch (e) {
        const msg = `Error scraping ${county.name} ${county.state}: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
    }

    // State-wide bankruptcy + obituaries (run once per state, after county loop)
    if (state === "AL") {
      try {
        onProgress?.(`Scraping AL bankruptcy (state-wide)...`);
        const bkLeads = await scrapeAlabamaBankruptcy(fromDate, toDate);
        allLeads.push(...bkLeads);
        onProgress?.(`✓ AL Bankruptcy: ${bkLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping AL bankruptcy: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
    }

    if (state === "OH") {
      try {
        onProgress?.(`Scraping OH bankruptcy (state-wide)...`);
        const bkLeads = await scrapeOhioBankruptcy(fromDate, toDate);
        allLeads.push(...bkLeads);
        onProgress?.(`✓ OH Bankruptcy: ${bkLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping OH bankruptcy: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      try {
        onProgress?.(`Scraping OH obituaries (state-wide)...`);
        const obLeads = await scrapeOhioObituaries(fromDate, toDate);
        allLeads.push(...obLeads);
        onProgress?.(`✓ OH Obituaries: ${obLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping OH obituaries: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
    }

    if (state === "SC") {
      try {
        onProgress?.(`Scraping SC bankruptcy (state-wide)...`);
        const bkLeads = await scrapeSCBankruptcy(fromDate, toDate);
        allLeads.push(...bkLeads);
        onProgress?.(`✓ SC Bankruptcy: ${bkLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping SC bankruptcy: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
      try {
        onProgress?.(`Scraping SC obituaries (state-wide)...`);
        const obLeads = await scrapeSCObituaries(fromDate, toDate);
        allLeads.push(...obLeads);
        onProgress?.(`✓ SC Obituaries: ${obLeads.length} leads found`);
      } catch (e) {
        const msg = `Error scraping SC obituaries: ${(e as Error).message}`;
        errors.push(msg);
        onProgress?.(`✗ ${msg}`);
      }
    }
  }

  return { leads: allLeads, errors };
}

export function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const toDate = new Date().toISOString().split("T")[0];
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { fromDate, toDate };
}

export function getDateRange(daysBack: number): { fromDate: string; toDate: string } {
  const toDate = new Date().toISOString().split("T")[0];
  const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { fromDate, toDate };
}
