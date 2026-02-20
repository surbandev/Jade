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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Resume API listening on http://localhost:${PORT}`)
  console.log(`SQLite database: ${dbPath}`)
})
