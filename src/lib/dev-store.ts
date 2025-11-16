import type { Client, PriceList } from '@/lib/types';
import { clients as seedClients, priceLists as seedPriceLists, users as seedUsers } from '@/lib/data';

// Shared in-memory store for development across API routes.
// This ensures POST/PUT/GET operate on the same dataset.
export const clientsStore: { data: Client[] } = {
  data: seedClients.map(c => ({ ...c })),
};

// Shared price lists store for development
export const priceListsStore: { data: PriceList[] } = {
  data: seedPriceLists.map(pl => ({ id: pl.id, name: pl.name, prices: { ...pl.prices } })),
};

// User pricing configuration store: per-user price list and general discount
export type UserPricingConfig = { priceListId: number; specialDiscountPct: number };
export const userPricingStore: { data: Record<number, UserPricingConfig> } = {
  data: Object.fromEntries(
    seedUsers.map(u => [u.id, { priceListId: u.priceListId ?? 1, specialDiscountPct: u.specialDiscountPct ?? 0 }])
  ),
};

// Price history store: keyed by `${listId}:${productId}` and holds entries
export type PriceHistoryEntry = { date: string; price: number };
export const priceHistoryStore: { data: Record<string, PriceHistoryEntry[]> } = {
  data: {},
};