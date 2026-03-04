import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ConnectionStatus } from '@/lib/deriv-types';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionPanelProps {
  status: ConnectionStatus;
  accountName: string;
  balance: string;
  currency: string;
  onConnect: (token: string) => void;
  onDisconnect: () => void;
}

export function ConnectionPanel({ status, accountName, balance, currency, onConnect, onDisconnect }: ConnectionPanelProps) {
  const [token, setToken] = useState('');

  const statusColor = {
    disconnected: 'bg-loss',
    connecting: 'bg-warning',
    connected: 'bg-warning',
    authorized: 'bg-success',
  }[status];

  const statusLabel = {
    disconnected: 'DISCONNECTED',
    connecting: 'CONNECTING...',
    connected: 'CONNECTED',
    authorized: 'AUTHORIZED',
  }[status];

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${status === 'authorized' ? 'animate-pulse-glow' : ''}`} />
          <span className="font-mono text-xs text-muted-foreground">{statusLabel}</span>
        </div>
        {status === 'authorized' && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{accountName}</p>
            <p className="font-mono text-lg font-bold text-success">
              {currency} {parseFloat(balance).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {status === 'disconnected' ? (
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter Deriv API Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="font-mono text-sm bg-muted border-border"
            onKeyDown={e => e.key === 'Enter' && token && onConnect(token)}
          />
          <Button
            onClick={() => token && onConnect(token)}
            disabled={!token}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Wifi className="w-4 h-4" />
            Connect
          </Button>
        </div>
      ) : (
        <Button
          onClick={onDisconnect}
          variant="outline"
          className="w-full border-loss/50 text-loss hover:bg-loss/10 gap-1.5"
        >
          {status === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <WifiOff className="w-4 h-4" />}
          Disconnect
        </Button>
      )}
    </div>
  );
}
