/**
 * VAEA Flash — Warm Cache
 *
 * Background capacity pre-warming via polling.
 * Matches the scanner's 2-second refresh interval.
 * Uses our own /v1/capacity API — zero external dependencies.
 */

import { CapacityResponse, TokenCapacity, VAEA_API_URL } from './types';

export type CacheUpdateHandler = (capacity: CapacityResponse) => void;

export class WarmCache {
  private capacity: CapacityResponse | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: CacheUpdateHandler[] = [];
  private readonly apiUrl: string;
  private readonly refreshMs: number;

  constructor(apiUrl: string = VAEA_API_URL, refreshMs: number = 2000) {
    this.apiUrl = apiUrl;
    this.refreshMs = refreshMs;
  }

  /** Start background polling. First refresh is synchronous. */
  async start(): Promise<void> {
    await this.refresh();
    this.timer = setInterval(() => this.refresh().catch(() => {}), this.refreshMs);
  }

  /** Stop background polling. */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Register a listener for capacity updates. */
  onUpdate(handler: CacheUpdateHandler): void {
    this.listeners.push(handler);
  }

  /** Get cached capacity (null if not yet loaded). */
  getCapacity(): CapacityResponse | null {
    return this.capacity;
  }

  /** Get cached capacity for a single token. */
  getTokenCapacity(symbol: string): TokenCapacity | null {
    if (!this.capacity) return null;
    return this.capacity.tokens.find(
      t => t.symbol.toLowerCase() === symbol.toLowerCase()
    ) ?? null;
  }

  /** Check if cache is warm (has data). */
  isWarm(): boolean {
    return this.capacity !== null;
  }

  private async refresh(): Promise<void> {
    try {
      const res = await fetch(`${this.apiUrl}/v1/capacity`);
      if (res.ok) {
        this.capacity = await res.json();
        for (const handler of this.listeners) {
          try { handler(this.capacity!); } catch { /* ignore listener errors */ }
        }
      }
    } catch {
      // Silent failure — next refresh will retry
    }
  }
}
