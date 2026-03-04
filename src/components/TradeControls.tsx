import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

interface TradeControlsProps {
  onTrade: (digit: number, stake: number) => void;
  selectedDigit: number;
  isTrading: boolean;
  disabled: boolean;
}

export function TradeControls({ onTrade, selectedDigit, isTrading, disabled }: TradeControlsProps) {
  const [stake, setStake] = useState('0.35');

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trade</h3>
      
      <div className="space-y-2">
        <div>
          <label className="text-xs text-muted-foreground">Stake (USD)</label>
          <Input
            type="number"
            min="0.35"
            step="0.01"
            value={stake}
            onChange={e => setStake(e.target.value)}
            className="font-mono bg-muted border-border mt-1"
            disabled={disabled || isTrading}
          />
        </div>
        <p className="text-xs text-muted-foreground">Places 10 virtual trades (digits 0-9), then real trade on winning tick</p>
      </div>

     <Button
  onClick={() => onTrade(parseFloat(stake))}  // only pass stake now
  disabled={disabled || isTrading || parseFloat(stake) < 0.35}
>
  {isTrading ? 'Trading...' : 'Place 10 Trades'}
</Button>
    </div>
  );
}
