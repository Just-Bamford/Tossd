/** Shape returned by the contract's `get_stats()` function. */
export interface ContractStats {
  total_games: number;
  /** Cumulative XLM wagered, in stroops (1 XLM = 10_000_000 stroops). */
  total_volume: bigint;
  /** Cumulative protocol fees collected, in stroops. */
  total_fees: bigint;
  /** Current reserve balance, in stroops. */
  reserve_balance: bigint;
}

const STROOPS_PER_XLM = 10_000_000n;

export function stroopsToXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const frac = stroops % STROOPS_PER_XLM;
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "") || "0";
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function formatGames(n: number): string {
  return n.toLocaleString();
}
