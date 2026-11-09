import { isValidCity, isValidCoinId, parseCoinIds } from '../validation';

describe('validation', () => {
  it('parses coin id lists', () => {
    expect(parseCoinIds('bitcoin, Ethereum,bitcoin')).toEqual(['bitcoin', 'ethereum']);
    expect(parseCoinIds('usd-coin')).toEqual(['usd-coin']);
    expect(parseCoinIds('')).toBeNull();
    expect(parseCoinIds(null)).toBeNull();
    expect(parseCoinIds('bitcoin/../../x')).toBeNull();
    expect(parseCoinIds('a&b=c')).toBeNull();
  });

  it('validates single coin ids', () => {
    expect(isValidCoinId('bitcoin')).toBe(true);
    expect(isValidCoinId('../etc')).toBe(false);
  });

  it('validates city names', () => {
    expect(isValidCity('New York')).toBe(true);
    expect(isValidCity('São Paulo')).toBe(true);
    expect(isValidCity('London,GB')).toBe(true);
    expect(isValidCity('<script>')).toBe(false);
    expect(isValidCity('')).toBe(false);
  });
});
