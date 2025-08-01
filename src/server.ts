/**
 * Minimal Express server.
 * TODO markers highlight the areas the candidate must implement.
 */

import express from 'express';
import { loadDeals } from './scripts/loadDeals';
import type { ContinentSummary, Deal, PublicDeal } from './types';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;


/* ── Load data at boot ─────────────────────────────────────── */
import path from 'path';
const DATA_FILE = path.resolve(process.cwd(), 'deals.json');
const deals: Deal[] = loadDeals(DATA_FILE);

type ContinentSummaryWithTotalPrice = ContinentSummary & {
  prices: number[]
}

const getPrice = (deal: Deal) => {
  const nonPriceKeys = ['deal_id', 'continent', 'announced'];
  for (const key in deal) {
    if (!nonPriceKeys.includes(key)) {
      return deal[key] as number;
    }
  }

  return 0;
}

const getDaysSince = (dateStr: string) => {
  try {
    const dtObj = new Date(dateStr);
    const todayDtObj = new Date();
    const diffInMs = todayDtObj.getTime() - dtObj.getTime(); 

    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    throw new Error('Invalid Date String!!')
  }
}

const computeContentSummary = () => {
  const dataMap: Record<string, ContinentSummaryWithTotalPrice> = {};

  deals.forEach(deal => {
    if (!dataMap[deal.continent]) dataMap[deal.continent] = {
      continent: deal.continent,
      median_valuation: 0,
      total: 0,
      prices: []
    }

    const price = getPrice(deal);
    dataMap[deal.continent].total += 1;
    dataMap[deal.continent].prices.push(price);
  });

  const contentSummary = []
  for (const continent in dataMap) {
    const row = dataMap[continent];
    const prices = row.prices;
  
    if (prices.length % 2 === 0) {
      const middleIdx = (prices.length / 2);
      row.median_valuation = (prices[middleIdx] + prices[middleIdx + 1]) / 2;
    } else {
      row.median_valuation = (prices.length + 1) / 2
    }

    contentSummary.push({
      continent: row.continent,
      median_valuation: row.median_valuation,
      total: row.total,
    })
  }

  return contentSummary;
}

const getDealMap = () => {
  const dealMap: Record<string, PublicDeal> = {};

  deals.forEach(deal => {
    dealMap[deal.deal_id] = {
      deal_id: deal.deal_id,
      continent: deal.continent,
      price: getPrice(deal),
      days_since_announced: getDaysSince(deal.announced)
    }
  });

  return dealMap;
}

/** TODO: pre-compute aggregates here for constant-time queries. */
let continentSummary: ContinentSummary[] = computeContentSummary(); // <-- candidate fills
let dealMap: Record<string, PublicDeal> = getDealMap();


/* ── Health check ──────────────────────────────────────────── */
app.get('/ping', (_req, res) => res.json({ message: 'pong' }));

/* ── Endpoint: /deals/summary ──────────────────────────────── */
app.get('/deals/summary', (_req, res) => {
  /** TODO: return continentSummary once computed */
  res.status(200).json(continentSummary);
});

/* ── Endpoint: /deals/:id ──────────────────────────────────── */
app.get('/deals/:id', (req, res) => {
  /** TODO: find deal, compute days_since_announced */
  const dealId = req.params.id;
  const deal = dealMap[dealId];

  if(!deal){
    return res.status(404).json({
      message: `Deal with ID '${dealId}' does not exist!`
    })
  }
  
  res.status(200).json(deal);
});

/* ── Global error handler (optional bonus) ─────────────────── */

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
