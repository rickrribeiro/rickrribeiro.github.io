import { describe, expect, it } from 'vitest';
import { parsed } from './helpers';
import { countryStats, journeyTotals, pastTrips } from '../lib/content';

const trip = (city: string, country: string, start: string, end: string, days: number) => ({ city, country, lat: 0, lon: 0, start, end, days });

describe('journey', () => {
  it('orders countries by total time spent and groups cities', () => {
    const c = parsed();
    c.trips.trips = [trip('Lima', 'PE', '2024-01-01', '2024-01-11', 10), trip('Cusco', 'PE', '2024-02-01', '2024-02-06', 5), trip('Tokyo', 'JP', '2025-01-01', '2025-01-21', 20), trip('Lima', 'PE', '2024-03-01', '2024-03-04', 3)];
    c.journey.places = [];
    const stats = countryStats(c, new Date('2026-01-01'));
    expect(stats.map((s) => [s.country, s.days])).toEqual([['JP', 20], ['PE', 18]]);
    expect(stats[1].cities.map((x) => [x.city, x.days, x.visits.length])).toEqual([['Lima', 13, 2], ['Cusco', 5, 1]]);
  });

  it('ignores future trips and clamps ongoing ones to today', () => {
    const c = parsed();
    c.trips.trips = [trip('Seoul', 'KR', '2026-10-01', '2026-10-31', 30), trip('Osaka', 'JP', '2026-12-01', '2026-12-10', 9)];
    const now = new Date('2026-10-11T12:00:00Z');
    const past = pastTrips(c, now);
    expect(past).toHaveLength(1);
    expect(past[0].days).toBe(10);
  });

  it('highlights countries where I studied or spoke via journey.json', () => {
    const stats = countryStats(parsed());
    const ie = stats.find((s) => s.country === 'IE')!;
    expect(ie.kinds).toContain('studied');
    expect(stats.find((s) => s.country === 'BR')!.kinds).toEqual(expect.arrayContaining(['home', 'spoke']));
  });

  it('computes totals from the trip log', () => {
    const t = journeyTotals(parsed());
    expect(t.countries).toBeGreaterThan(10);
    expect(t.km).toBeGreaterThan(10_000);
  });
});

describe('journey overrides', () => {
  it('splits a country by city and replaces day totals', () => {
    const c = parsed();
    c.trips.trips = [trip('London', 'GB', '2019-01-01', '2019-01-11', 10), trip('Edinburgh', 'GB', '2019-02-01', '2019-02-04', 3), trip('Lisbon', 'PT', '2020-01-01', '2020-01-01', 0)];
    c.journey.places = [];
    c.journey.overrides = { cityCountry: { London: 'ENG', Edinburgh: 'SCT' }, regions: {}, countryDays: { PT: 7 } };
    const stats = countryStats(c, new Date('2026-01-01'));
    expect(stats.map((s) => [s.country, s.days])).toEqual([['ENG', 10], ['PT', 7], ['SCT', 3]]);
    expect(journeyTotals(c, new Date('2026-01-01')).countries).toBe(3);
  });

  it('shows city counts as a lower bound', async () => {
    const { atLeast } = await import('../lib/content');
    expect(atLeast(53)).toBe('50+');
    expect(atLeast(7)).toBe('7');
  });
});
