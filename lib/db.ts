import Database from "better-sqlite3";
import { seedAssets } from "./assets";

export const db = new Database("sqlite.db");

db.exec(`
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS passkey (
    id TEXT PRIMARY KEY,
    name TEXT,
    publicKey TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    counter INTEGER NOT NULL,
    deviceType TEXT NOT NULL,
    backedUp INTEGER NOT NULL,
    transports TEXT,
    createdAt INTEGER NOT NULL,
    credentialID TEXT NOT NULL,
    aaguid TEXT
);
CREATE TABLE IF NOT EXISTS asset (
    id TEXT PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    chainId INTEGER NOT NULL,
    description TEXT,
    decimals INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('stocks', 'crypto', 'cash', 'commodities', 'precious_metals', 'bonds')),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ideal_portfolio (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE REFERENCES user(id),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ideal_portfolio_entry (
    id TEXT PRIMARY KEY,
    portfolioId TEXT NOT NULL REFERENCES ideal_portfolio(id),
    assetId TEXT NOT NULL REFERENCES asset(id),
    allocation REAL NOT NULL CHECK(allocation > 0 AND allocation <= 100),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    UNIQUE(portfolioId, assetId)
);
CREATE TABLE IF NOT EXISTS telegram_bot (
    id TEXT PRIMARY KEY,
    botUsername TEXT NOT NULL UNIQUE,
    botToken TEXT NOT NULL,
    userId TEXT UNIQUE REFERENCES user(id),
    createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_agent (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE REFERENCES user(id),
    agentDirName TEXT NOT NULL UNIQUE,
    walletAddress TEXT NOT NULL,
    telegramBotId TEXT NOT NULL REFERENCES telegram_bot(id),
    gatewayPort INTEGER NOT NULL UNIQUE,
    daemonPid INTEGER,
    status TEXT NOT NULL DEFAULT 'provisioning'
        CHECK(status IN ('provisioning', 'running', 'stopped', 'error')),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
`);

seedAssets();

