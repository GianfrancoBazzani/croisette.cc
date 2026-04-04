/**
 * check-integrity.ts
 *
 * Verifies workspace files haven't been tampered with since registration.
 *
 * Local mode (default):
 *   Compares SHA-256 hashes against the local manifest.json.
 *   Fast, no network needed, but trusts the local manifest.
 *
 * On-chain mode (--on-chain):
 *   Downloads the manifest from 0G Storage using the manifestRootHash
 *   stored in constants.ts, then verifies local files' merkle roots
 *   match. Slower but trustless — no local file can be tampered with.
 *
 * Usage:
 *   bun scripts/check-integrity.ts <agentId>
 *   bun scripts/check-integrity.ts <agentId> --on-chain
 *   bun scripts/check-integrity.ts <agentId> --on-chain --check-existence
 *
 * Exit codes:
 *   0 = all files pass integrity check
 *   1 = integrity check failed (tampered or missing files)
 *   2 = manifest not found / agent not registered / missing config
 *
 * Output (JSON to stdout):
 *   { ok: true/false, checked: N, failed: [...], missing: [...] }
 */

import path from "node:path";
import { checkIntegrity } from "../app/_lib/integrity.js";

const args = process.argv.slice(2);
const onChain = args.includes("--on-chain");
const checkExistence = args.includes("--check-existence");
const agentId = args.find((a) => !a.startsWith("--"));

if (!agentId) {
  console.error("Usage: bun scripts/check-integrity.ts <agentId> [--on-chain] [--check-existence]");
  process.exit(2);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const agentConfigDir = path.join(projectRoot, ".zeroclaw", "agents", agentId);
const workspaceDir = path.join(agentConfigDir, "workspace");

if (onChain) {
  // On-chain verification: fetch manifest from 0G, compare merkle roots
  const { AGENTS } = await import("../app/_lib/constants.js");
  const { verifyOnChain } = await import("./lib/0g-verify.js");

  const agent = AGENTS[agentId];
  if (!agent?.manifestRootHash) {
    console.error(
      `\nAgent "${agentId}" has no manifestRootHash in constants.ts.`
    );
    console.error(
      `Run "bun run agent:register ${agentId}" first, then add the manifestRootHash to constants.ts.`
    );
    process.exit(2);
  }

  console.error(`Fetching manifest from 0G Storage: ${agent.manifestRootHash}`);
  console.error(`Verifying workspace: ${workspaceDir}\n`);

  try {
    const result = await verifyOnChain(agent.manifestRootHash, workspaceDir, {
      checkExistence,
    });

    console.log(JSON.stringify(result, null, 2));

    if (!result.ok) {
      console.error(`\n⚠ ON-CHAIN INTEGRITY CHECK FAILED for agent "${agentId}"`);

      for (const file of result.failed) {
        const d = result.details[file];
        console.error(`  TAMPERED: ${file}`);
        console.error(`    expected rootHash: ${d.expectedRootHash}`);
        console.error(`    local rootHash:    ${d.localRootHash}`);
      }

      for (const file of result.missing) {
        console.error(`  MISSING:  ${file}`);
      }

      process.exit(1);
    }

    console.error(`✓ On-chain integrity OK — ${result.checked} files verified for "${agentId}"`);
    process.exit(0);
  } catch (err) {
    console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
} else {
  // Local verification: compare SHA-256 against local manifest
  const result = checkIntegrity(agentConfigDir, workspaceDir);

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    if (result.missing.includes("manifest.json")) {
      console.error(
        `\nAgent "${agentId}" has no manifest. Run: bun scripts/register-agent.ts ${agentId}`
      );
      process.exit(2);
    }

    console.error(`\n⚠ INTEGRITY CHECK FAILED for agent "${agentId}"`);

    for (const file of result.failed) {
      const d = result.details[file];
      console.error(`  TAMPERED: ${file}`);
      console.error(`    expected: ${d.expected}`);
      console.error(`    actual:   ${d.actual}`);
    }

    for (const file of result.missing) {
      console.error(`  MISSING:  ${file}`);
    }

    process.exit(1);
  }

  console.error(`✓ Integrity OK — ${result.checked} files verified for "${agentId}"`);
  process.exit(0);
}
