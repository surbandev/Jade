const API = '/api'

/**
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function getProfiles() {
  const res = await fetch(`${API}/profiles`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * @param {number} profileId
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function getResumeState(profileId) {
  const res = await fetch(`${API}/resume/${profileId}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * @param {number} profileId
 * @param {Record<string, unknown>} state
 */
export async function saveResumeState(profileId, state) {
  const res = await fetch(`${API}/resume/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error(await res.text())
}

/**
 * @param {string} name
 * @returns {Promise<number>} New profile id
 */
export async function addProfile(name) {
  const res = await fetch(`${API}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() || 'New User' }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.id
}

/**
 * @param {number} profileId
 */
export async function deleteProfile(profileId) {
  const res = await fetch(`${API}/profiles/${profileId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

/**
 * Ask Gemini to rewrite profile text to be more professional.
 * @param {string} text - Current profile text
 * @returns {Promise<string>} Rewritten text
 */
export async function rewriteProfileText(text) {
  const res = await fetch(`${API}/rewrite-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text || '' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || res.statusText || 'Failed to rewrite')
  if (data?.text == null) throw new Error('No text in response')
  return data.text
}
