import type { TradeResult } from '@/lib/deriv-types';

interface TradeHistoryProps {
  results: TradeResult[];
}

export function TradeHistory({ results }: TradeHistoryProps) {
  const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
  const wins = results.filter(r => r.status === 'won').length;
  const losses = results.filter(r => r.status === 'lost').length;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trade History</h3>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-success">{wins}W</span>
          <span className="text-loss">{losses}L</span>
          <span className={totalProfit >= 0 ? 'text-success' : 'text-loss'}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {results.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No trades yet</p>
        ) : (
          results.map((r, i) => (
            <div
              key={`${r.contractId}-${i}`}
              className={`flex items-center justify-between px-3 py-2 rounded text-xs font-mono ${
                r.status === 'won' ? 'bg-success/10 border border-success/20' :
                r.status === 'lost' ? 'bg-loss/10 border border-loss/20' :
                'bg-muted border border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  r.status === 'won' ? 'bg-success text-primary-foreground' :
                  r.status === 'lost' ? 'bg-loss text-foreground' :
                  'bg-muted-foreground/30 text-foreground'
                }`}>
                  {r.digit}
                </span>
                <span className="text-muted-foreground">
                  {r.status === 'pending' ? '⏳' : r.status === 'won' ? '✓' : '✗'}
                </span>
              </div>
              <div className="text-right">
                <span className={r.profit >= 0 ? 'text-success' : 'text-loss'}>
                  {r.status === 'pending' ? `$${r.buyPrice.toFixed(2)}` :
                   `${r.profit >= 0 ? '+' : ''}$${r.profit.toFixed(2)}`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
