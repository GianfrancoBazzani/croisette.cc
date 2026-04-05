/**
 * On-chain integrity verification against 0G Storage.
 *
 * Trust chain:
 *   constants.ts (deployed code) → manifestRootHash
 *     → manifest downloaded from 0G (immutable, content-addressed)
 *       → per-file rootHashes
 *         → compared against locally computed merkle roots
 */

import path from 'node:path';
import { existsSync } from 'node:fs';
import { getConfig, type AppConfig } from './0g-config';
import { computeRootHash, checkFileExistsOnChain, downloadToString } from './0g-storage';
import type { Manifest } from '../../app/_lib/integrity';

export interface OnChainVerifyResult {
  ok: boolean;
  checked: number;
  failed: string[];
  missing: string[];
  details: Record<string, {
    expectedRootHash: string;
    localRootHash: string | null;
    existsOnChain: boolean;
  }>;
}

/**
 * Download the manifest from 0G Storage using its root hash.
 * This is the trusted manifest — content-addressed and immutable.
 */
export async function fetchManifestFromZeroG(
  manifestRootHash: string,
  config?: AppConfig,
): Promise<Manifest> {
  const cfg = config ?? getConfig();
  const raw = await downloadToString(manifestRootHash, cfg);
  return JSON.parse(raw) as Manifest;
}

/**
 * Verify workspace files against the on-chain manifest.
 *
 * For each file recorded in the manifest:
 *   1. Compute its merkle root hash locally
 *   2. Compare against the rootHash in the manifest (fetched from 0G)
 *   3. Optionally verify the file exists on 0G storage nodes
 */
export async function verifyOnChain(
  manifestRootHash: string,
  workspaceDir: string,
  opts?: { checkExistence?: boolean; config?: AppConfig },
): Promise<OnChainVerifyResult> {
  const config = opts?.config ?? getConfig();
  const checkExistence = opts?.checkExistence ?? false;

  // Step 1: Fetch the trusted manifest from 0G
  const manifest = await fetchManifestFromZeroG(manifestRootHash, config);

  const result: OnChainVerifyResult = {
    ok: true,
    checked: 0,
    failed: [],
    missing: [],
    details: {},
  };

  // Step 2: Verify each file
  for (const [fileName, record] of Object.entries(manifest.files)) {
    result.checked++;
    const fullPath = path.join(workspaceDir, fileName);

    if (!existsSync(fullPath)) {
      result.ok = false;
      result.missing.push(fileName);
      result.details[fileName] = {
        expectedRootHash: record.rootHash,
        localRootHash: null,
        existsOnChain: false,
      };
      continue;
    }

    // Compute local merkle root hash
    const localRootHash = await computeRootHash(fullPath);

    // Compare against manifest
    const hashMatch = localRootHash === record.rootHash;

    // Optionally check on-chain existence
    let existsOnChain = hashMatch; // assume true if hash matches (it was uploaded)
    if (checkExistence) {
      existsOnChain = await checkFileExistsOnChain(record.rootHash, config);
    }

    if (!hashMatch) {
      result.ok = false;
      result.failed.push(fileName);
    }

    result.details[fileName] = {
      expectedRootHash: record.rootHash,
      localRootHash,
      existsOnChain,
    };
  }

  return result;
}
