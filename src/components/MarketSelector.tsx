import { MARKETS, type MarketConfig } from '@/lib/deriv-types';

interface MarketSelectorProps {
  currentMarket: MarketConfig;
  onSelect: (market: MarketConfig) => void;
  disabled: boolean;
}

export function MarketSelector({ currentMarket, onSelect, disabled }: MarketSelectorProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {MARKETS.map(m => (
          <button
            key={m.symbol}
            onClick={() => onSelect(m)}
            disabled={disabled}
            className={`px-3 py-2 rounded-md text-xs font-mono transition-all ${
              currentMarket.symbol === m.symbol
                ? 'bg-primary/20 text-primary border border-primary/40 glow-green'
                : 'bg-muted text-muted-foreground border border-transparent hover:border-border hover:text-foreground'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {m.symbol.replace('1HZ', '').replace('V', '')}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center font-mono">
        {currentMarket.label} · {currentMarket.decimalPlaces} decimals
      </p>
    </div>
  );
}
