/**
 * Shared TypeScript types used across server & client.
 * Extend or refine as you load the dataset.
 */

import { type } from "os";

export interface Deal {
  deal_id: string;
  continent: string;
  announced: string;              // ISO date string
  /** Dynamic valuation column – could be “valuation_usd”, “val_usd” or “price”. */
  [key: string]: unknown;
}

export type PublicDeal = Pick<Deal, "deal_id" | "continent"> & {
  price: number;
  days_since_announced: number;
}

export interface ContinentSummary {
  continent: string;
  total: number;
  median_valuation: number;
}