import { TleRecord } from "../types"

export function parseTleText(text: string): TleRecord[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  const records: TleRecord[] = []

  for (let i = 0; i < lines.length - 2; i++) {
    const name = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]

    // Validate TLE lines
    if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) continue

    const noradId = parseInt(line1.slice(2, 7).trim(), 10)
    const epochRaw = line1.slice(18, 32).trim()
    const epoch = tlEpochToISO(epochRaw)

    records.push({ name, line1, line2, noradId, epoch })
    i += 2
  }

  return records
}

function tlEpochToISO(epochRaw: string): string {
  const year2 = parseInt(epochRaw.slice(0, 2), 10)
  const year = year2 >= 57 ? 1900 + year2 : 2000 + year2
  const dayOfYear = parseFloat(epochRaw.slice(2))
  const date = new Date(Date.UTC(year, 0, 1))
  date.setUTCDate(date.getUTCDate() + Math.floor(dayOfYear) - 1)
  const fracDay = dayOfYear - Math.floor(dayOfYear)
  date.setUTCMilliseconds(date.getUTCMilliseconds() + fracDay * 86_400_000)
  return date.toISOString()
}
