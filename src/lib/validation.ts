/** CoinGecko coin ids are lowercase slugs such as "bitcoin" or "usd-coin". */
const COIN_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MAX_COIN_IDS = 50;
export const ALLOWED_HISTORY_DAYS = ['1', '7', '14', '30', '90', '180', '365'];

/** Parse a comma-separated list of coin ids; returns null if any id is invalid. */
export function parseCoinIds(raw: string | null): string[] | null {
  if (!raw) return null;
  const ids = raw
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);
  if (ids.length === 0 || ids.length > MAX_COIN_IDS) return null;
  if (!ids.every((id) => COIN_ID_RE.test(id))) return null;
  return Array.from(new Set(ids));
}

export function isValidCoinId(id: string | null): id is string {
  return !!id && COIN_ID_RE.test(id);
}

/** City names: letters (any script), spaces, dots, apostrophes, hyphens and an optional ",CC" country suffix. */
export function isValidCity(city: string | null): city is string {
  return !!city && city.length <= 85 && /^[\p{L}\p{M} .'-]+(,\s?[A-Za-z]{2})?$/u.test(city.trim());
}
