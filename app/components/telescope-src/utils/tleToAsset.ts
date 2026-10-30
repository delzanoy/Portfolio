import { Asset, TleRecord } from '../types'
let ucsData: Record<string, any> = {};

if (typeof window !== 'undefined') {
  fetch('/telescope-app/data/ucs.json')
    .then(res => res.json())
    .then(data => {
      ucsData = data;
    })
    .catch(err => console.warn('Failed to load ucs.json', err));
}

type SatMetadata = { owner: string; missionType: string; isMilitary: boolean }

function classifySatellite(name: string): SatMetadata {
  const n = name.toUpperCase()

  // ── Military / classified ─────────────────────────────────────────────
  if (/^USA-\d/.test(n))
    return { owner: 'USSF / NRO (USA)', missionType: 'Classified Reconnaissance', isMilitary: true }
  if (/^COSMOS-?\d/.test(n) || n.startsWith('COSMOS '))
    return { owner: 'Russian Space Forces', missionType: 'Military Operations', isMilitary: true }
  if (/YAOGAN/.test(n))
    return { owner: 'PLA (China)', missionType: 'Earth Observation', isMilitary: true }
  if (/SHIJIAN/.test(n))
    return { owner: 'CNSA (China)', missionType: 'Technology Demo / Military', isMilitary: true }
  if (/GPS/.test(n) || /NAVSTAR/.test(n))
    return { owner: 'US Air Force (USA)', missionType: 'Navigation', isMilitary: true }
  if (/GLONASS/.test(n))
    return { owner: 'Russian Space Forces', missionType: 'Navigation', isMilitary: true }
  if (/LACROSSE|ONYX/.test(n))
    return { owner: 'NRO (USA)', missionType: 'Radar Surveillance', isMilitary: true }
  if (/^SDS-|QUASAR/.test(n))
    return { owner: 'NRO (USA)', missionType: 'Data Relay', isMilitary: true }
  if (/MILSTAR|AEHF/.test(n))
    return { owner: 'USSF (USA)', missionType: 'Military Communications', isMilitary: true }
  if (/WGS/.test(n))
    return { owner: 'USSF (USA)', missionType: 'Wideband Communications', isMilitary: true }
  if (/MUOS/.test(n))
    return { owner: 'US Navy (USA)', missionType: 'Mobile User Communications', isMilitary: true }
  if (/SBIRS/.test(n))
    return { owner: 'USSF (USA)', missionType: 'Missile Warning', isMilitary: true }
  if (/MERIDIAN|MOLNIYA/.test(n))
    return { owner: 'Russian Space Forces', missionType: 'Military Communications', isMilitary: true }
  if (/ZHURONG|TIANGONG/.test(n))
    return { owner: 'CNSA (China)', missionType: 'Space Station', isMilitary: false }

  // ── Mega-constellations ───────────────────────────────────────────────
  if (/STARLINK/.test(n))
    return { owner: 'SpaceX (USA)', missionType: 'Broadband Communications', isMilitary: false }
  if (/ONEWEB/.test(n))
    return { owner: 'OneWeb (UK)', missionType: 'Broadband Communications', isMilitary: false }
  if (/IRIDIUM/.test(n))
    return { owner: 'Iridium (USA)', missionType: 'Mobile Communications', isMilitary: false }
  if (/ORBCOMM/.test(n))
    return { owner: 'ORBCOMM (USA)', missionType: 'M2M / IoT Communications', isMilitary: false }
  if (/GLOBALSTAR/.test(n))
    return { owner: 'Globalstar (USA)', missionType: 'Mobile Communications', isMilitary: false }
  if (/O3B|SES/.test(n))
    return { owner: 'SES (Luxembourg)', missionType: 'Broadband Communications', isMilitary: false }

  // ── Navigation ────────────────────────────────────────────────────────
  if (/GALILEO/.test(n))
    return { owner: 'ESA / EU', missionType: 'Navigation', isMilitary: false }
  if (/BEIDOU|COMPASS/.test(n))
    return { owner: 'CNSA (China)', missionType: 'Navigation', isMilitary: false }
  if (/NAVIC|IRNSS/.test(n))
    return { owner: 'ISRO (India)', missionType: 'Navigation', isMilitary: false }
  if (/QZSS|MICHIBIKI/.test(n))
    return { owner: 'JAXA (Japan)', missionType: 'Navigation', isMilitary: false }

  // ── Earth Observation ─────────────────────────────────────────────────
  if (/FLOCK|DOVE|SKYSAT|PLANETSCOPE/.test(n))
    return { owner: 'Planet Labs (USA)', missionType: 'Earth Observation', isMilitary: false }
  if (/LEMUR|SPIRE/.test(n))
    return { owner: 'Spire Global (USA)', missionType: 'Earth Observation', isMilitary: false }
  if (/WORLDVIEW|GEOEYE|QUICKBIRD|MAXAR/.test(n))
    return { owner: 'Maxar Technologies (USA)', missionType: 'Earth Observation', isMilitary: false }
  if (/SENTINEL/.test(n))
    return { owner: 'ESA (Europe)', missionType: 'Earth Observation', isMilitary: false }
  if (/LANDSAT/.test(n))
    return { owner: 'NASA / USGS (USA)', missionType: 'Earth Observation', isMilitary: false }
  if (/TERRA|AQUA|AURA/.test(n))
    return { owner: 'NASA (USA)', missionType: 'Earth Science', isMilitary: false }
  if (/PLEIADES|SPOT/.test(n))
    return { owner: 'Airbus (France)', missionType: 'Earth Observation', isMilitary: false }
  if (/ALOS|DAICHI/.test(n))
    return { owner: 'JAXA (Japan)', missionType: 'Earth Observation', isMilitary: false }
  if (/KOMPSAT/.test(n))
    return { owner: 'KARI (South Korea)', missionType: 'Earth Observation', isMilitary: false }
  if (/RADARSAT/.test(n))
    return { owner: 'CSA (Canada)', missionType: 'Earth Observation', isMilitary: false }
  if (/RESOURCESAT|CARTOSAT|RISAT/.test(n))
    return { owner: 'ISRO (India)', missionType: 'Earth Observation', isMilitary: false }
  if (/GÖKTÜRK|GOKTURK/.test(n))
    return { owner: 'TUA (Turkey)', missionType: 'Earth Observation', isMilitary: false }
  if (/HJ-|ZY-|GF-/.test(n))
    return { owner: 'CNSA (China)', missionType: 'Earth Observation', isMilitary: false }
  if (/SICH|OCEAN/.test(n))
    return { owner: 'SSA (Ukraine)', missionType: 'Earth Observation', isMilitary: false }

  // ── Weather ───────────────────────────────────────────────────────────
  if (/NOAA|GOES/.test(n))
    return { owner: 'NOAA (USA)', missionType: 'Weather', isMilitary: false }
  if (/DMSP/.test(n))
    return { owner: 'USSF / NOAA (USA)', missionType: 'Weather', isMilitary: true }
  if (/METEOSAT|MSG/.test(n))
    return { owner: 'EUMETSAT (Europe)', missionType: 'Weather', isMilitary: false }
  if (/FENGYUN|FY-/.test(n))
    return { owner: 'CMA (China)', missionType: 'Weather', isMilitary: false }
  if (/HIMAWARI/.test(n))
    return { owner: 'JMA (Japan)', missionType: 'Weather', isMilitary: false }
  if (/METOP/.test(n))
    return { owner: 'EUMETSAT / ESA (Europe)', missionType: 'Weather', isMilitary: false }
  if (/NPP|JPSS|SUOMI/.test(n))
    return { owner: 'NOAA / NASA (USA)', missionType: 'Weather / Earth Science', isMilitary: false }

  // ── Space Stations ───────────────────────────────────────────────────
  if (/ISS|ZARYA|ZVEZDA/.test(n))
    return { owner: 'NASA / Roscosmos / ESA / JAXA / CSA', missionType: 'Space Station', isMilitary: false }
  if (/CSS|TIANHE|WENTIAN/.test(n))
    return { owner: 'CNSA (China)', missionType: 'Space Station', isMilitary: false }

  // ── Commercial Communications ─────────────────────────────────────────
  if (/INTELSAT/.test(n))
    return { owner: 'Intelsat (Luxembourg)', missionType: 'Communications', isMilitary: false }
  if (/EUTELSAT/.test(n))
    return { owner: 'Eutelsat (France)', missionType: 'Communications', isMilitary: false }
  if (/TÜRKSAT|TURKSAT/.test(n))
    return { owner: 'Türksat (Turkey)', missionType: 'Communications', isMilitary: false }
  if (/AMAZONAS|HISPASAT/.test(n))
    return { owner: 'Hispasat (Spain)', missionType: 'Communications', isMilitary: false }
  if (/OPTUS/.test(n))
    return { owner: 'Optus (Australia)', missionType: 'Communications', isMilitary: false }
  if (/NILESAT/.test(n))
    return { owner: 'Nilesat (Egypt)', missionType: 'Communications', isMilitary: false }
  if (/APSTAR/.test(n))
    return { owner: 'APT Satellite (China)', missionType: 'Communications', isMilitary: false }
  if (/MEASAT/.test(n))
    return { owner: 'MEASAT (Malaysia)', missionType: 'Communications', isMilitary: false }
  if (/INMARSAT/.test(n))
    return { owner: 'Inmarsat (UK)', missionType: 'Mobile Communications', isMilitary: false }
  if (/DIRECTV|ECHOSTAR|HUGHES/.test(n))
    return { owner: 'EchoStar / Hughes (USA)', missionType: 'Direct Broadcast', isMilitary: false }
  if (/VINASAT/.test(n))
    return { owner: 'VNPT (Vietnam)', missionType: 'Communications', isMilitary: false }
  if (/ARABSAT/.test(n))
    return { owner: 'Arabsat (Saudi Arabia)', missionType: 'Communications', isMilitary: false }
  if (/GSAT|INSAT/.test(n))
    return { owner: 'ISRO (India)', missionType: 'Communications / Weather', isMilitary: false }
  if (/CHINASAT|ChinaSat/.test(n))
    return { owner: 'CASC (China)', missionType: 'Communications', isMilitary: false }

  // ── Science & Technology ──────────────────────────────────────────────
  if (/HUBBLE|HST/.test(n))
    return { owner: 'NASA / ESA (USA)', missionType: 'Space Telescope', isMilitary: false }
  if (/CHANDRA/.test(n))
    return { owner: 'NASA (USA)', missionType: 'X-ray Observatory', isMilitary: false }
  if (/FERMI|SWIFT|INTEGRAL/.test(n))
    return { owner: 'NASA / ESA (USA)', missionType: 'Astrophysics', isMilitary: false }
  if (/CHEOPS|GAIA|XMM/.test(n))
    return { owner: 'ESA (Europe)', missionType: 'Astrophysics', isMilitary: false }
  if (/GRACE/.test(n))
    return { owner: 'NASA / DLR (USA/Germany)', missionType: 'Geodesy', isMilitary: false }
  if (/SWARM/.test(n))
    return { owner: 'ESA (Europe)', missionType: 'Geomagnetic Research', isMilitary: false }

  // ── Default fallback ──────────────────────────────────────────────────
  return { owner: 'Unknown', missionType: 'Unknown', isMilitary: false }
}

const GM = 398600.4418   // Earth gravitational parameter, km³/s²
const TWO_PI = 2 * Math.PI
const EARTH_R = 6371          // km

function parseLine2(line2: string) {
  return {
    inclination: parseFloat(line2.slice(8, 16)),
    raan: parseFloat(line2.slice(17, 25)),
    meanAnomaly: parseFloat(line2.slice(43, 51)),
    meanMotion: parseFloat(line2.slice(52, 63)),  // rev/day
  }
}

export function isDebrisRecord(name: string): boolean {
  const n = name.toUpperCase()
  return (
    n.includes('DEB') ||
    n.includes('R/B') ||
    n.includes('ROCKET BODY') ||
    n.includes('FRAG') ||
    n.includes('COOLANT')
  )
}

export function tleToAsset(record: TleRecord): Asset {
  const { inclination, raan, meanAnomaly, meanMotion } = parseLine2(record.line2!)

  const periodMin = 1440 / meanMotion
  const periodSec = periodMin * 60
  const semiMajorAxis = Math.cbrt(GM * Math.pow(periodSec / TWO_PI, 2))

  const isDebris = isDebrisRecord(record.name)
  let meta = isDebris ? null : classifySatellite(record.name)

  // UCS Database Lookup
  const ucsEntry = ucsData[record.noradId.toString()]
  if (ucsEntry) {
    meta = {
      owner: ucsEntry.country,
      missionType: ucsEntry.detailedPurpose || ucsEntry.purpose,
      isMilitary: ucsEntry.users.toLowerCase().includes('military')
    }
  }

  return {
    id: `TLE-${record.noradId}`,
    name: record.name.trim(),
    type: isDebris ? 'debris' : 'satellite',
    owner: isDebris ? undefined : meta?.owner,
    missionType: isDebris ? undefined : meta?.missionType,
    isMilitary: isDebris ? false : (meta?.isMilitary ?? false),
    countryCode: record.countryCode,
    deltaVBudget: isDebris ? 0 : 50,
    propulsionType: isDebris ? 'N/A' : 'Unknown',
    thrustLimit: isDebris ? 0 : 1,
    isp: isDebris ? 0 : 220,
    dryMass: isDebris ? 0 : 200,
    propellantMass: isDebris ? 0 : 20,
    orbit: { semiMajorAxis, inclination, raan, initialAngle: meanAnomaly, period: periodMin },
  }
}
