import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export interface FileRecord {
  rootHash: string; // 0G Storage root hash (proves it's on-chain)
  sha256: string; // Local integrity check (fast)
  size: number;
}

export interface Manifest {
  version: string;
  created: string;
  agentId: string;
  manifestRootHash?: string; // 0G root hash of the manifest itself
  files: Record<string, FileRecord>;
}

export interface IntegrityResult {
  ok: boolean;
  checked: number;
  failed: string[];
  missing: string[];
  details: Record<string, { expected: string; actual: string | null }>;
}

/**
 * Compute SHA-256 hash of a file's contents.
 */
export function sha256File(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Compute SHA-256 for all .md files in a workspace directory.
 */
export function hashWorkspace(
  workspaceDir: string
): Record<string, string> {
  const hashes: Record<string, string> = {};
  const WORKSPACE_FILES = [
    "SOUL.md",
    "IDENTITY.md",
    "AGENTS.md",
    "TOOLS.md",
    "USER.md",
  ];

  for (const file of WORKSPACE_FILES) {
    const fullPath = path.join(workspaceDir, file);
    if (existsSync(fullPath)) {
      hashes[file] = sha256File(fullPath);
    }
  }

  return hashes;
}

/**
 * Load manifest from disk for a given agent.
 */
export function loadManifest(agentConfigDir: string): Manifest | null {
  const manifestPath = path.join(agentConfigDir, "manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

/**
 * Check integrity of workspace files against the stored manifest.
 * Returns a result with pass/fail per file.
 */
export function checkIntegrity(
  agentConfigDir: string,
  workspaceDir: string
): IntegrityResult {
  const manifest = loadManifest(agentConfigDir);

  if (!manifest) {
    return {
      ok: false,
      checked: 0,
      failed: [],
      missing: ["manifest.json"],
      details: {
        "manifest.json": { expected: "exists", actual: null },
      },
    };
  }

  const result: IntegrityResult = {
    ok: true,
    checked: 0,
    failed: [],
    missing: [],
    details: {},
  };

  for (const [fileName, record] of Object.entries(manifest.files)) {
    result.checked++;
    const fullPath = path.join(workspaceDir, fileName);

    if (!existsSync(fullPath)) {
      result.ok = false;
      result.missing.push(fileName);
      result.details[fileName] = { expected: record.sha256, actual: null };
      continue;
    }

    const currentHash = sha256File(fullPath);

    if (currentHash !== record.sha256) {
      result.ok = false;
      result.failed.push(fileName);
      result.details[fileName] = {
        expected: record.sha256,
        actual: currentHash,
      };
    }
  }

  return result;
}
