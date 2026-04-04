import { randomUUID } from "crypto";
import { db } from "./db";

export type AssetType = "stocks" | "crypto" | "cash" | "commodities" | "precious_metals" | "bonds";

export interface Asset {
  ticker: string;
  chainId: number;
  address: string;
  decimals: number;
  type: AssetType;
  description: string;
}

export const ASSETS: Asset[] = [
  {
    ticker: "BABAon",
    chainId: 1,
    address: "0x41765F0FCddC276309195166C7A62AE522FA09ef",
    decimals: 18,
    type: "stocks",
    description: "Alibaba tokenized equity on Ethereum mainnet",
  },
  {
    ticker: "COPXon",
    chainId: 1,
    address: "0x423A63dfe8d82Cd9c6568c92210aa537d8Ef6885",
    decimals: 18,
    type: "stocks",
    description:
      "Global X Copper Miners ETF tokenized exposure on Ethereum mainnet",
  },
  {
    ticker: "CRCLon",
    chainId: 1,
    address: "0x3632DEa96A953C11dac2f00b4A05a32CD1063fAE",
    decimals: 18,
    type: "stocks",
    description: "Circle Internet Group tokenized equity on Ethereum mainnet",
  },
  {
    ticker: "GOOGLon",
    chainId: 1,
    address: "0xbA47214eDd2bb43099611b208f75E4b42FDcfEDc",
    decimals: 18,
    type: "stocks",
    description: "Alphabet Class A tokenized equity on Ethereum mainnet",
  },
  {
    ticker: "NKEon",
    chainId: 1,
    address: "0xD8e26FcC879b30cB0a0B543925a2B3500f074D81",
    decimals: 18,
    type: "stocks",
    description: "Nike tokenized equity on Ethereum mainnet",
  },
  {
    ticker: "SLVon",
    chainId: 1,
    address: "0xF3e4872e6a4cF365888D93b6146a2bAA7348F1A4",
    decimals: 18,
    type: "stocks",
    description:
      "iShares Silver Trust tokenized ETF exposure on Ethereum mainnet",
  },
  {
    ticker: "SPYon",
    chainId: 1,
    address: "0xFeDC5f4a6c38211c1338aa411018DFAf26612c08",
    decimals: 18,
    type: "stocks",
    description: "SPDR S&P 500 ETF tokenized exposure on Ethereum mainnet",
  },
  {
    ticker: "WBTC",
    chainId: 1,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    type: "crypto",
    description: "Wrapped Bitcoin on Ethereum mainnet",
  },
  {
    ticker: "WETH",
    chainId: 1,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    type: "crypto",
    description: "Wrapped Ether on Ethereum mainnet",
  },
  {
    ticker: "ARC_USDC",
    chainId: 5042002,
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    type: "cash",
    description: "Arc USDC ERC-20 interface for the native USDC balance",
  },
  {
    ticker: "ARC_EURC",
    chainId: 5042002,
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    type: "cash",
    description: "Arc EURC euro stablecoin balance",
  },
  {
    ticker: "ARC_USYC",
    chainId: 5042002,
    address: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
    decimals: 6,
    type: "cash",
    description: "Arc USYC yield-bearing tokenized money market position",
  },
];

export function seedAssets() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO asset (id, ticker, address, chainId, description, decimals, type, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();

  const insertMany = db.transaction((assets: Asset[]) => {
    for (const asset of assets) {
      insert.run(
        randomUUID(),
        asset.ticker,
        asset.address,
        asset.chainId,
        asset.description,
        asset.decimals,
        asset.type,
        now,
        now
      );
    }
  });

  insertMany(ASSETS);
}
