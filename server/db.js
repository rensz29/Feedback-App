// Responses are stored in SQLite inside DATA_DIR (a Docker volume).

import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const DATA_DIR = process.env.DATA_DIR ?? "/data";

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "feedback.db"), { timeout: 10_000 });
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_at TEXT NOT NULL,
  answers TEXT NOT NULL
)`);

const insertResponse = db.prepare("INSERT INTO responses (submitted_at, answers) VALUES (?, ?)");
const selectResponses = db.prepare("SELECT id, submitted_at, answers FROM responses ORDER BY id");
const selectOne = db.prepare("SELECT 1");

export function saveResponse(answers) {
  // UTC to the second, e.g. 2026-11-09T02:14:07+00:00
  const submittedAt = new Date().toISOString().replace(/\.\d+Z$/, "+00:00");
  insertResponse.run(submittedAt, JSON.stringify(answers));
}

export function loadResponses() {
  return selectResponses.all().map((row) => ({
    id: row.id,
    when: new Date(row.submitted_at),
    answers: JSON.parse(row.answers),
  }));
}

export function pingDb() {
  selectOne.get();
}

export function closeDb() {
  db.close();
}
