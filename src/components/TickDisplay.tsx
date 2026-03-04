import type { TickData, MarketConfig } from '@/lib/deriv-types';

interface TickDisplayProps {
  ticks: TickData[];
  market: MarketConfig;
  lastDigits: number[];
}

export function TickDisplay({ ticks, market, lastDigits }: TickDisplayProps) {
  const latestTick = ticks[ticks.length - 1];
  const prevTick = ticks[ticks.length - 2];
  const direction = latestTick && prevTick
    ? latestTick.quote > prevTick.quote ? 'up' : latestTick.quote < prevTick.quote ? 'down' : 'same'
    : 'same';

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Ticks</h3>
        <span className="text-xs font-mono text-muted-foreground">{market.label}</span>
      </div>

      {/* Current price */}
      <div className="text-center py-2">
        {latestTick ? (
          <div className="animate-tick" key={latestTick.epoch}>
            <p className={`font-mono text-3xl font-bold ${
              direction === 'up' ? 'text-success' : direction === 'down' ? 'text-loss' : 'text-foreground'
            }`}>
              {latestTick.quote.toFixed(market.decimalPlaces)}
            </p>
            <p className="text-sm mt-1">
              Last digit:{' '}
              <span className="font-mono font-bold text-accent text-lg">
                {latestTick.lastDigit}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground font-mono">Waiting for ticks...</p>
        )}
      </div>

      {/* Last digits strip */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {lastDigits.slice(-20).map((d, i) => (
          <span
            key={i}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded bg-muted text-xs font-mono font-bold text-foreground"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
