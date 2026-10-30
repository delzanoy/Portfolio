export type CountryEntry = {
  name: string           // display name
  codes: string[]        // CelesTrak country codes that match
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number }
  topoName: string       // name as it appears in the TopoJSON countries-50m.json
}

export const COUNTRIES: CountryEntry[] = [
  {
    name: 'United States',
    codes: ['US', 'USA'],
    bbox: { minLat: 18.0, maxLat: 72.0, minLon: -180.0, maxLon: -66.0 },
    topoName: 'United States of America',
  },
  {
    name: 'Russia',
    codes: ['CIS', 'RUS', 'SU'],
    bbox: { minLat: 41.0, maxLat: 82.0, minLon: 19.0, maxLon: 180.0 },
    topoName: 'Russia',
  },
  {
    name: 'China',
    codes: ['PRC', 'CN', 'CHN'],
    bbox: { minLat: 18.0, maxLat: 54.0, minLon: 73.0, maxLon: 135.0 },
    topoName: 'China',
  },
  {
    name: 'France',
    codes: ['FR', 'FRA'],
    bbox: { minLat: 41.0, maxLat: 51.5, minLon: -5.5, maxLon: 10.0 },
    topoName: 'France',
  },
  {
    name: 'United Kingdom',
    codes: ['UK', 'GB', 'GBR'],
    bbox: { minLat: 49.0, maxLat: 61.0, minLon: -8.5, maxLon: 2.0 },
    topoName: 'United Kingdom',
  },
  {
    name: 'Germany',
    codes: ['D', 'DEU', 'GER'],
    bbox: { minLat: 47.0, maxLat: 55.5, minLon: 5.5, maxLon: 15.5 },
    topoName: 'Germany',
  },
  {
    name: 'Japan',
    codes: ['JPN', 'JP'],
    bbox: { minLat: 24.0, maxLat: 46.0, minLon: 122.0, maxLon: 154.0 },
    topoName: 'Japan',
  },
  {
    name: 'India',
    codes: ['IND', 'IN'],
    bbox: { minLat: 6.0, maxLat: 36.0, minLon: 68.0, maxLon: 98.0 },
    topoName: 'India',
  },
  {
    name: 'Israel',
    codes: ['ISRL', 'IL', 'ISR'],
    bbox: { minLat: 29.0, maxLat: 34.0, minLon: 34.0, maxLon: 36.0 },
    topoName: 'Israel',
  },
  {
    name: 'Brazil',
    codes: ['BRA', 'BR'],
    bbox: { minLat: -34.0, maxLat: 6.0, minLon: -74.0, maxLon: -28.0 },
    topoName: 'Brazil',
  },
  {
    name: 'South Korea',
    codes: ['KOR', 'ROK', 'KR'],
    bbox: { minLat: 33.0, maxLat: 39.0, minLon: 124.0, maxLon: 130.0 },
    topoName: 'South Korea',
  },
  {
    name: 'UAE',
    codes: ['UAE', 'AE'],
    bbox: { minLat: 22.0, maxLat: 26.5, minLon: 51.0, maxLon: 56.5 },
    topoName: 'United Arab Emirates',
  },
  {
    name: 'Australia',
    codes: ['AUS', 'AU'],
    bbox: { minLat: -44.0, maxLat: -10.0, minLon: 113.0, maxLon: 154.0 },
    topoName: 'Australia',
  },
  {
    name: 'Canada',
    codes: ['CA', 'CAN'],
    bbox: { minLat: 42.0, maxLat: 84.0, minLon: -141.0, maxLon: -52.0 },
    topoName: 'Canada',
  },
  {
    name: 'Italy',
    codes: ['I', 'ITA', 'IT'],
    bbox: { minLat: 36.5, maxLat: 47.5, minLon: 6.5, maxLon: 18.5 },
    topoName: 'Italy',
  },
  {
    name: 'Spain',
    codes: ['E', 'ESP', 'ES'],
    bbox: { minLat: 35.5, maxLat: 44.0, minLon: -9.5, maxLon: 4.5 },
    topoName: 'Spain',
  },
  {
    name: 'Norway',
    codes: ['NOR', 'NO'],
    bbox: { minLat: 57.5, maxLat: 72.0, minLon: 3.0, maxLon: 32.0 },
    topoName: 'Norway',
  },
  {
    name: 'Sweden',
    codes: ['SWE', 'S', 'SE'],
    bbox: { minLat: 55.0, maxLat: 70.0, minLon: 10.5, maxLon: 25.0 },
    topoName: 'Sweden',
  },
  {
    name: 'Netherlands',
    codes: ['NL', 'NLD'],
    bbox: { minLat: 50.5, maxLat: 53.5, minLon: 3.2, maxLon: 7.5 },
    topoName: 'Netherlands',
  },
  {
    name: 'Luxembourg',
    codes: ['LUX', 'LU'],
    bbox: { minLat: 49.0, maxLat: 50.5, minLon: 5.5, maxLon: 6.5 },
    topoName: 'Luxembourg',
  },
  {
    name: 'Argentina',
    codes: ['ARGN', 'AR', 'ARG'],
    bbox: { minLat: -56.0, maxLat: -21.0, minLon: -74.0, maxLon: -52.0 },
    topoName: 'Argentina',
  },
  {
    name: 'Pakistan',
    codes: ['PAKI', 'PK', 'PAK'],
    bbox: { minLat: 23.0, maxLat: 38.0, minLon: 60.5, maxLon: 77.5 },
    topoName: 'Pakistan',
  },
  {
    name: 'Turkey',
    codes: ['TURK', 'TR', 'TUR'],
    bbox: { minLat: 35.5, maxLat: 43.0, minLon: 25.5, maxLon: 45.0 },
    topoName: 'Turkey',
  },
  {
    name: 'Saudi Arabia',
    codes: ['SAUD', 'SA', 'SAU'],
    bbox: { minLat: 15.5, maxLat: 32.5, minLon: 34.5, maxLon: 56.0 },
    topoName: 'Saudi Arabia',
  },
  {
    name: 'Ukraine',
    codes: ['UKRA', 'UA', 'UKR'],
    bbox: { minLat: 44.0, maxLat: 53.0, minLon: 22.0, maxLon: 40.5 },
    topoName: 'Ukraine',
  },
  {
    name: 'Egypt',
    codes: ['EGYP', 'EG', 'EGY'],
    bbox: { minLat: 22.0, maxLat: 32.0, minLon: 24.5, maxLon: 37.5 },
    topoName: 'Egypt',
  },
  {
    name: 'Iran',
    codes: ['IRAN', 'IR', 'IRN'],
    bbox: { minLat: 25.0, maxLat: 40.0, minLon: 44.0, maxLon: 64.0 },
    topoName: 'Iran',
  },
  {
    name: 'Mexico',
    codes: ['MEX', 'MX'],
    bbox: { minLat: 14.5, maxLat: 33.0, minLon: -118.0, maxLon: -86.5 },
    topoName: 'Mexico',
  },
  {
    name: 'Indonesia',
    codes: ['INDO', 'ID', 'IDN'],
    bbox: { minLat: -11.0, maxLat: 7.0, minLon: 95.0, maxLon: 142.0 },
    topoName: 'Indonesia',
  },
]

import { isOverBbox } from '../utils/geospatial'

/** Search for a country entry by name (case-insensitive substring match) */
export function findCountry(query: string): CountryEntry | undefined {
  const q = query.toLowerCase().trim()
  return COUNTRIES.find(c =>
    c.name.toLowerCase().includes(q) ||
    c.topoName.toLowerCase().includes(q) ||
    c.codes.some(code => code.toLowerCase() === q)
  )
}

/** Get all CelesTrak codes that belong to a country name match */
export function getCountryCodes(query: string): string[] {
  const entry = findCountry(query)
  return entry ? entry.codes : []
}

/** Get the country that a lat/lon is currently over (based on bounding box) */
export function getCountryOverhead(lat: number, lon: number): CountryEntry | undefined {
  return COUNTRIES.find(c => isOverBbox(lat, lon, c.bbox))
}
