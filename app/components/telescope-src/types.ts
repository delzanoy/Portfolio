export type OrbitDetails = {
  semiMajorAxis: number     // km from Earth centre
  inclination: number       // degrees
  raan: number              // right ascension of ascending node, degrees
  initialAngle: number      // starting true anomaly, degrees
  period: number            // orbital period, minutes
}

export type Asset = {
  id: string
  name: string
  type: "satellite" | "debris"
  missionObjective?: string
  owner?: string          // country or organization name
  missionType?: string    // e.g. "Communications", "Earth Observation"
  isMilitary?: boolean    // whether the satellite is military-operated
  countryCode?: string    // CelesTrak country code (e.g. "US", "PRC", "CIS")
  deltaVBudget: number
  propulsionType: string
  thrustLimit: number
  isp: number           // specific impulse, seconds (0 for non-propulsive)
  dryMass: number       // kg
  propellantMass: number // kg
  orbit: OrbitDetails
}

export type TleRecord = {
  name: string
  line1?: string
  line2?: string
  noradId: number
  epoch: string
  countryCode?: string
  launchDate?: string
  objectType?: string
  // Support for CelesTrak GP JSON elements
  inclination?: number
  raan?: number
  meanAnomaly?: number
  meanMotion?: number
  eccentricity?: number
  argOfPericenter?: number
}

export type LiveSatellite = TleRecord & {
  /** Current Three.js position [x, y, z], updated every frame */
  position: [number, number, number]
}

export type TleCategory = 'stations' | 'active' | 'visual' | 'debris' | 'analyst' | 'starlink'

export type AppState = {
  selectedAsset: Asset | null
}
