export const ST_BASE = "https://www.space-track.org"
export const ST_LOGIN = `${ST_BASE}/ajaxauth/login`

export async function loginToSpaceTrack(user: string, pass: string): Promise<string> {
  const res = await fetch(ST_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `identity=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
  })

  if (!res.ok) throw new Error(`Space-Track login HTTP error: ${res.status}`)

  const body = await res.text()
  if (body.includes('"Login":"Failed"')) {
    throw new Error("Space-Track login failed: Invalid credentials or account pending approval.")
  }

  const setCookie = res.headers.get("set-cookie")
  if (!setCookie) throw new Error("Space-Track login returned no session cookie")

  // Extract the session cookie value
  return setCookie.split(";")[0]
}
