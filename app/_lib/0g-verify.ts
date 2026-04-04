/**
 * On-chain integrity verification against 0G Storage (runtime module).
 *
 * Trust chain:
 *   constants.ts (deployed code) → manifestRootHash
 *     → manifest fetched from 0G (immutable, content-addressed)
 *       → per-file rootHashes
 *         → compared against locally computed merkle roots
 *
 * No private key or dotenv needed — read-only operations only.
 * Next.js loads .env natively so process.env is available.
 */

import { ZgFile, Indexer } from "@0gfoundation/0g-ts-sdk";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Manifest } from "./integrity";

type NetworkName = "testnet" | "mainnet";
type StorageMode = "turbo" | "standard";

const INDEXER_URLS: Record<NetworkName, Record<StorageMode, string>> = {
  testnet: {
    turbo: "https://indexer-storage-testnet-turbo.0g.ai",
    standard: "https://indexer-storage-testnet-standard.0g.ai",
  },
  mainnet: {
    turbo: "https://indexer-storage-turbo.0g.ai",
    standard: "https://indexer-storage.0g.ai",
  },
};

function getIndexerUrl(): string {
  const network = (process.env.NETWORK || "testnet") as NetworkName;
  const mode = (process.env.STORAGE_MODE || "turbo") as StorageMode;
  return INDEXER_URLS[network][mode];
}

export interface OnChainVerifyResult {
  ok: boolean;
  checked: number;
  failed: string[];
  missing: string[];
  details: Record<
    string,
    {
      expectedRootHash: string;
      localRootHash: string | null;
    }
  >;
}

/**
 * Compute the 0G merkle root hash of a local file without uploading.
 */
async function computeRootHash(filePath: string): Promise<string> {
  const zgFile = await ZgFile.fromFilePath(filePath);
  try {
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Merkle tree generation failed: ${treeErr}`);
    }
    const rootHash = tree!.rootHash();
    if (!rootHash) {
      throw new Error("Merkle tree produced null root hash");
    }
    return rootHash;
  } finally {
    await zgFile.close();
  }
}

/**
 * Download a file from 0G and return its contents as a string.
 */
async function downloadToString(
  rootHash: string,
  indexer: Indexer
): Promise<string> {
  const tmpFile = path.join(
    os.tmpdir(),
    `0g-verify-${rootHash.slice(0, 16)}-${Date.now()}`
  );
  try {
    const err = await indexer.download(rootHash, tmpFile, true);
    if (err !== null) {
      throw new Error(`0G download failed: ${err}`);
    }
    return readFileSync(tmpFile, "utf-8");
  } finally {
    if (existsSync(tmpFile)) {
      unlinkSync(tmpFile);
    }
  }
}

/**
 * Verify workspace files against the on-chain manifest.
 *
 * 1. Fetches the manifest from 0G using the trusted manifestRootHash
 * 2. For each file: computes local merkle root and compares
 */
export async function verifyOnChain(
  manifestRootHash: string,
  workspaceDir: string
): Promise<OnChainVerifyResult> {
  const network = (process.env.NETWORK || "testnet") as NetworkName;
  const mode = (process.env.STORAGE_MODE || "turbo") as StorageMode;
  const indexerUrl = INDEXER_URLS[network][mode];
  const indexer = new Indexer(indexerUrl);

  const t0 = Date.now();
  console.log(`[0g-verify] Starting on-chain verification`);
  console.log(`[0g-verify]   network: ${network} (${mode})`);
  console.log(`[0g-verify]   indexer: ${indexerUrl}`);
  console.log(`[0g-verify]   manifestRootHash: ${manifestRootHash}`);
  console.log(`[0g-verify]   workspace: ${workspaceDir}`);

  // Fetch the trusted manifest from 0G
  console.log(`[0g-verify] Downloading manifest from 0G...`);
  const tDl = Date.now();
  const raw = await downloadToString(manifestRootHash, indexer);
  console.log(`[0g-verify] Manifest downloaded in ${Date.now() - tDl}ms (${raw.length} bytes)`);
  const manifest = JSON.parse(raw) as Manifest;
  console.log(`[0g-verify] Manifest contains ${Object.keys(manifest.files).length} files for agent "${manifest.agentId}"`);

  const result: OnChainVerifyResult = {
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
      result.details[fileName] = {
        expectedRootHash: record.rootHash,
        localRootHash: null,
      };
      console.log(`[0g-verify]   ${fileName}: MISSING`);
      continue;
    }

    const tHash = Date.now();
    const localRootHash = await computeRootHash(fullPath);
    const hashMatch = localRootHash === record.rootHash;

    if (!hashMatch) {
      result.ok = false;
      result.failed.push(fileName);
    }

    result.details[fileName] = {
      expectedRootHash: record.rootHash,
      localRootHash,
    };

    const status = hashMatch ? "OK" : "TAMPERED";
    console.log(`[0g-verify]   ${fileName}: ${status} (${Date.now() - tHash}ms)`);
  }

  const elapsed = Date.now() - t0;
  console.log(`[0g-verify] Verification complete in ${elapsed}ms — ${result.ok ? "PASS" : "FAIL"} (${result.checked} files, ${result.failed.length} tampered, ${result.missing.length} missing)`);

  return result;
}
