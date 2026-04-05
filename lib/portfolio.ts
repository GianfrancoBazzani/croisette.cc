import type { Asset } from "./assets";


export type RiskLevel = "very_low" | "low" | "medium" | "high" | "very_high";

export type StrategyType = "HYBRID" | "DCA" | "LUMP_SUM";

export type DCAFrequency = "weekly" | "biweekly" | "monthly";

export type InvestmentHorizon = "retire_early" | "long_term" | "medium_term" | "short_term";

export type FIREVariant = "lean" | "regular" | "fat" | "barista" | "coast";

export interface PortfolioInvestment {
  asset: Asset;
  allocation_percentage: number;
}

export interface Strategy {
  type: StrategyType;
  initial_investment: number;
  dca_amount: number;
  dca_frequency: DCAFrequency;
  dca_duration_months: number;
  monthly_investment_after_dca: number;
  effort_level: "low" | "medium" | "high";
}

export interface FIRE {
  fire_number: number;
  fire_variant: FIREVariant;
  annual_expenses_retirement: number;
  current_portfolio: number;
  target_age: number;
  years_to_fire: number;
  monthly_investment_needed: number;
  expected_annual_return: number;
  withdrawal_rate: number;
  note: string;
}

export interface UserProfile {
  age: number;
  country: string;
  monthly_expenses: number;
  investment_horizon: InvestmentHorizon;
  risk_profile: RiskLevel;
}

export interface Portfolio {
  investments: PortfolioInvestment[];
  risk_level: RiskLevel;
  emergency_reserve: Asset[];
  strategy: Strategy;
  fire: FIRE;
  user_profile: UserProfile;
  created_at: string;
  last_updated: string;
}
