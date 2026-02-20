import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import { JADE_URBAN_RESUME_STATE, BLANK_RESUME_STATE } from './defaultState.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
const dbPath = join(dataDir, 'resume.db')

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`)
db.exec(`
  CREATE TABLE IF NOT EXISTS resume_data (
    profile_id INTEGER PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at TEXT,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  )
`)

const count = db.prepare('SELECT COUNT(*) as n FROM profiles').get()
if (count.n === 0) {
  db.prepare('INSERT INTO profiles (name) VALUES (?)').run('Jade Urban')
  db.prepare(
    "INSERT INTO resume_data (profile_id, data, updated_at) VALUES (1, ?, datetime('now'))"
  ).run(JSON.stringify(JADE_URBAN_RESUME_STATE))
}

// Migration: rename any "Default" profile to "Jade Urban" and give her the sample data
const defaultProfile = db.prepare('SELECT id FROM profiles WHERE name = ?').get('Default')
if (defaultProfile) {
  db.prepare('UPDATE profiles SET name = ? WHERE id = ?').run('Jade Urban', defaultProfile.id)
  db.prepare(
    "INSERT OR REPLACE INTO resume_data (profile_id, data, updated_at) VALUES (?, ?, datetime('now'))"
  ).run(defaultProfile.id, JSON.stringify(JADE_URBAN_RESUME_STATE))
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/profiles', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name FROM profiles ORDER BY id').all()
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message) })
  }
})

app.get('/api/resume/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
    const row = db.prepare('SELECT data FROM resume_data WHERE profile_id = ?').get(id)
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(JSON.parse(row.data))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message) })
  }
})

app.put('/api/resume/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
    const state = req.body
    if (!state || typeof state !== 'object') return res.status(400).json({ error: 'Invalid body' })
    db.prepare(
      "INSERT OR REPLACE INTO resume_data (profile_id, data, updated_at) VALUES (?, ?, datetime('now'))"
    ).run(id, JSON.stringify(state))
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message) })
  }
})

app.post('/api/profiles', (req, res) => {
  try {
    const name = (req.body?.name && String(req.body.name).trim()) || 'New User'
    db.prepare('INSERT INTO profiles (name) VALUES (?)').run(name)
    const row = db.prepare('SELECT last_insert_rowid() as id').get()
    const newId = row.id
    const blankState = { ...BLANK_RESUME_STATE, name }
    db.prepare(
      "INSERT INTO resume_data (profile_id, data, updated_at) VALUES (?, ?, datetime('now'))"
    ).run(newId, JSON.stringify(blankState))
    res.status(201).json({ id: newId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message) })
  }
})

app.delete('/api/profiles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
    const exists = db.prepare('SELECT 1 FROM profiles WHERE id = ?').get(id)
    if (!exists) return res.status(404).json({ error: 'Not found' })
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id)
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message) })
  }
})

app.post('/api/rewrite-profile', async (req, res) => {
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  if (!openaiKey && !geminiKey) {
    return res.status(503).json({
      error: 'No API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY in .env',
    })
  }
  const text = req.body?.text != null ? String(req.body.text) : ''
  if (!text.trim()) {
    return res.status(400).json({ error: 'Profile text is required' })
  }
  const prompt = `Rewrite the following resume profile/summary to be more professional and polished. Keep the same facts and roughly the same length. Use clear, concise language suitable for a resume. Output only the rewritten text—no quotes, no explanation.\n\n${text.trim()}`
  try {
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          }),
        }
      )
      const data = await geminiRes.json()
      if (!geminiRes.ok) {
        const errMsg = data?.error?.message || data?.message || geminiRes.statusText
        return res.status(geminiRes.status >= 400 ? geminiRes.status : 502).json({ error: errMsg })
      }
      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (resultText == null || resultText === '') {
        return res.status(502).json({ error: 'No text returned from Gemini' })
      }
      return res.json({ text: resultText.trim() })
    }
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    })
    const data = await openaiRes.json()
    if (!openaiRes.ok) {
      const errMsg = data?.error?.message || data?.message || openaiRes.statusText
      return res.status(openaiRes.status >= 400 ? openaiRes.status : 502).json({ error: errMsg })
    }
    const resultText = data?.choices?.[0]?.message?.content
    if (resultText == null || resultText === '') {
      return res.status(502).json({ error: 'No text returned from OpenAI' })
    }
    res.json({ text: resultText.trim() })
  } catch (err) {
    console.error('Rewrite error:', err)
    res.status(500).json({ error: err.message || 'Failed to rewrite profile' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Resume API listening on http://localhost:${PORT}`)
  console.log(`SQLite database: ${dbPath}`)
})
