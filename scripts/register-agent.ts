/**
 * register-agent.ts
 *
 * Uploads an agent's workspace files to 0G Storage and creates an integrity
 * manifest. Run this once at agent creation time.
 *
 * Usage:
 *   bun scripts/register-agent.ts <agentId>
 *
 * Example:
 *   bun scripts/register-agent.ts portfolio-builder-og
 *
 * Requires:
 *   - .env at project root with PRIVATE_KEY set
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { uploadFile, uploadData } from "./lib/0g-storage";
import { getConfig } from "./lib/0g-config";

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

const WORKSPACE_FILES = [
  "SOUL.md",
  "IDENTITY.md",
  "AGENTS.md",
  "TOOLS.md",
  "USER.md",
  "BOOTSTRAP.md",
  "MEMORY.md",
  "HEARTBEAT.md",
];

async function main() {
  const agentId = process.argv[2];
  if (!agentId) {
    console.error("Usage: bun scripts/register-agent.ts <agentId>");
    console.error("Example: bun scripts/register-agent.ts portfolio-builder-og");
    process.exit(1);
  }

  const projectRoot = path.resolve(import.meta.dirname, "..");
  const agentConfigDir = path.join(projectRoot, ".zeroclaw", "agents", agentId);
  const workspaceDir = path.join(agentConfigDir, "workspace");

  if (!existsSync(workspaceDir)) {
    console.error(`Workspace not found: ${workspaceDir}`);
    process.exit(1);
  }

  console.log(`Registering agent: ${agentId}`);
  console.log(`Workspace: ${workspaceDir}\n`);

  const storageConfig = getConfig();

  console.log(
    `Network: ${storageConfig.network.name} (${storageConfig.network.mode})\n`
  );

  const files: Record<
    string,
    { rootHash: string; sha256: string; size: number }
  > = {};

  // Upload each workspace file
  for (const fileName of WORKSPACE_FILES) {
    const filePath = path.join(workspaceDir, fileName);
    if (!existsSync(filePath)) continue;

    const size = statSync(filePath).size;
    const hash = sha256(filePath);

    console.log(`[upload] ${fileName} (${size} bytes, sha256: ${hash.slice(0, 12)}...)`);

    try {
      const result = await uploadFile(filePath, storageConfig);
      files[fileName] = {
        rootHash: result.rootHash,
        sha256: hash,
        size,
      };
      console.log(`  → rootHash: ${result.rootHash}`);
    } catch (err) {
      console.error(
        `  ✗ Failed: ${err instanceof Error ? err.message : err}`
      );
      process.exit(1);
    }
  }

  // Build manifest
  const manifest = {
    version: "1.0.0",
    created: new Date().toISOString(),
    agentId,
    files,
  };

  // Upload manifest to 0G
  console.log("\n[upload] manifest.json...");
  const manifestJSON = JSON.stringify(manifest, null, 2);

  try {
    const manifestResult = await uploadData(manifestJSON, storageConfig);
    (manifest as any).manifestRootHash = manifestResult.rootHash;
    console.log(`  → rootHash: ${manifestResult.rootHash}`);
  } catch (err) {
    console.error(
      `  ✗ Failed to upload manifest: ${err instanceof Error ? err.message : err}`
    );
    // Continue — save locally even if 0G upload fails
  }

  // Save manifest locally next to the agent config
  const manifestPath = path.join(agentConfigDir, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved: ${manifestPath}`);

  console.log("\n=== REGISTRATION COMPLETE ===");
  console.log(`Agent:    ${agentId}`);
  console.log(`Files:    ${Object.keys(files).length}`);
  if ((manifest as any).manifestRootHash) {
    const mrh = (manifest as any).manifestRootHash;
    console.log(`Manifest: ${mrh}`);
    console.log(
      `Explorer: https://storagescan-galileo.0g.ai/file/${mrh}`
    );
    console.log(`\n=== ADD TO constants.ts ===`);
    console.log(`Add this to the "${agentId}" entry in app/_lib/constants.ts:\n`);
    console.log(`    manifestRootHash: "${mrh}",`);
    console.log(`\nThis enables on-chain verification: bun run agent:check ${agentId} --on-chain`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
