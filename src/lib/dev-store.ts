import type { Client } from '@/lib/types';
import { clients as seedClients } from '@/lib/data';

// Shared in-memory store for development across API routes.
// This ensures POST/PUT/GET operate on the same dataset.
export const clientsStore: { data: Client[] } = {
  data: seedClients.map(c => ({ ...c })),
};