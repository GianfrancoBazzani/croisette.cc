import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import Database from "better-sqlite3";

interface BotEntry {
  username: string;
  token: string;
}

const botsPath = "bots.json";

let raw: string;
try {
  raw = readFileSync(botsPath, "utf-8");
} catch {
  console.error(`Could not read ${botsPath}. Create it with:\n[\n  { "username": "croisette_user1_bot", "token": "123456:ABC..." }\n]`);
  process.exit(1);
}

const bots: BotEntry[] = JSON.parse(raw);

if (!Array.isArray(bots) || bots.length === 0) {
  console.error("bots.json must be a non-empty array of { username, token } objects.");
  process.exit(1);
}

const db = new Database("sqlite.db");

// Ensure the table exists (in case this runs before the app)
db.exec(`
CREATE TABLE IF NOT EXISTS telegram_bot (
    id TEXT PRIMARY KEY,
    botUsername TEXT NOT NULL UNIQUE,
    botToken TEXT NOT NULL,
    userId TEXT UNIQUE REFERENCES user(id),
    createdAt INTEGER NOT NULL
);
`);

const insert = db.prepare(`
  INSERT OR IGNORE INTO telegram_bot (id, botUsername, botToken, createdAt)
  VALUES (?, ?, ?, ?)
`);

const now = Date.now();
let inserted = 0;

const insertMany = db.transaction((entries: BotEntry[]) => {
  for (const bot of entries) {
    const result = insert.run(randomUUID(), bot.username, bot.token, now);
    if (result.changes > 0) inserted++;
  }
});

insertMany(bots);

console.log(`Seeded ${inserted} bot(s) (${bots.length - inserted} already existed).`);
