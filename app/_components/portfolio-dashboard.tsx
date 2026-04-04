"use client";

interface InvestmentEntry {
  asset_class: string;
  allocation_percentage: number;
  risk: string;
}

interface PortfolioData {
  investment?: InvestmentEntry[];
  emergency_reserve?: InvestmentEntry[];
  strategy?: { type: string; frequency?: string; monthly_amount?: number };
  risk_profile?: string;
  fire?: {
    fire_number: number;
    years_to_fire: number;
    current_portfolio?: number;
    monthly_investment_needed?: number;
  };
}

const ASSET_COLORS: Record<string, string> = {
  stocks: "#af1c57",
  cash: "#d4a574",
  crypto_blue_chip: "#32302f",
  stable_yield: "#5b8a72",
};

const ASSET_LABELS: Record<string, string> = {
  stocks: "Stocks (bCSPX)",
  cash: "Cash (bIB01)",
  crypto_blue_chip: "Crypto (WETH)",
  stable_yield: "Yield (USDY)",
};

function DonutChart({
  entries,
  size = 160,
}: {
  entries: InvestmentEntry[];
  size?: number;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      {entries.map((entry, i) => {
        const dashLength = (entry.allocation_percentage / 100) * circumference;
        const dashOffset = -offset;
        offset += dashLength;
        return (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={ASSET_COLORS[entry.asset_class] || "#ede7e5"}
            strokeWidth="24"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
          />
        );
      })}
    </svg>
  );
}

function EmptyDonut({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle
        cx="80"
        cy="80"
        r="56"
        fill="none"
        stroke="#ede7e5"
        strokeWidth="24"
        opacity="0.5"
      />
    </svg>
  );
}

export function PortfolioDashboard({ data }: { data: PortfolioData | null }) {
  const hasInvestment = data?.investment && data.investment.length > 0;
  const hasReserve =
    data?.emergency_reserve && data.emergency_reserve.length > 0;
  const hasAnyData = data && (hasInvestment || hasReserve || data.strategy || data.risk_profile);

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-inverse-surface">
          Your Portfolio
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          {hasAnyData
            ? "Building your allocation"
            : "Your portfolio will appear here as we build it together"}
        </p>
      </div>

      {/* Badges */}
      {(data?.strategy || data?.risk_profile) && (
        <div className="flex flex-wrap gap-3">
          {data?.strategy && (
            <span className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              Strategy: {data.strategy.type}
            </span>
          )}
          {data?.risk_profile && (
            <span className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              {data.risk_profile}
            </span>
          )}
        </div>
      )}

      {/* Investment Allocation */}
      <div className="bg-surface-container-low rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-5">
          Investments
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {hasInvestment ? (
              <DonutChart entries={data!.investment!} />
            ) : (
              <EmptyDonut />
            )}
          </div>
          <div className="space-y-3 flex-1">
            {hasInvestment ? (
              data!.investment!.map((entry) => (
                <div key={entry.asset_class} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        ASSET_COLORS[entry.asset_class] || "#ede7e5",
                    }}
                  />
                  <span className="text-sm text-on-surface flex-1">
                    {ASSET_LABELS[entry.asset_class] || entry.asset_class}
                  </span>
                  <span className="text-sm font-bold text-inverse-surface">
                    {entry.allocation_percentage}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant/50 italic">
                No allocation yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Reserve */}
      <div className="bg-surface-container-low rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-5">
          Emergency Reserve
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {hasReserve ? (
              <DonutChart entries={data!.emergency_reserve!} size={120} />
            ) : (
              <EmptyDonut size={120} />
            )}
          </div>
          <div className="space-y-3 flex-1">
            {hasReserve ? (
              data!.emergency_reserve!.map((entry) => (
                <div key={entry.asset_class} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        ASSET_COLORS[entry.asset_class] || "#ede7e5",
                    }}
                  />
                  <span className="text-sm text-on-surface flex-1">
                    {ASSET_LABELS[entry.asset_class] || entry.asset_class}
                  </span>
                  <span className="text-sm font-bold text-inverse-surface">
                    {entry.allocation_percentage}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant/50 italic">
                No reserve configured yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FIRE Stats */}
      {data?.fire && (
        <div className="bg-inverse-surface rounded-2xl p-6 text-inverse-on-surface">
          <h3 className="text-xs font-bold uppercase tracking-wider text-inverse-on-surface/60 mb-4">
            FIRE Target
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">
                ${data.fire.fire_number.toLocaleString()}
              </p>
              <p className="text-xs text-inverse-on-surface/60 mt-1">
                FIRE Number
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.fire.years_to_fire}y
              </p>
              <p className="text-xs text-inverse-on-surface/60 mt-1">
                Years to FIRE
              </p>
            </div>
            {data.fire.monthly_investment_needed && (
              <div>
                <p className="text-lg font-bold">
                  ${data.fire.monthly_investment_needed.toLocaleString()}/mo
                </p>
                <p className="text-xs text-inverse-on-surface/60 mt-1">
                  Monthly needed
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategy Details */}
      {data?.strategy && data.strategy.monthly_amount && (
        <div className="bg-surface-container-low rounded-2xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Strategy Details
          </h3>
          <div className="space-y-2">
            {data.strategy.frequency && (
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">
                  Frequency
                </span>
                <span className="text-sm font-semibold text-inverse-surface capitalize">
                  {data.strategy.frequency}
                </span>
              </div>
            )}
            {data.strategy.monthly_amount && (
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Amount</span>
                <span className="text-sm font-semibold text-inverse-surface">
                  ${data.strategy.monthly_amount.toLocaleString()}/mo
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
