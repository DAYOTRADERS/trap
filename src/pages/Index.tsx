import { useState, useEffect } from 'react';
import { useDerivTrading } from '@/hooks/use-deriv-trading';
import { ConnectionPanel } from '@/components/ConnectionPanel';
import { MarketSelector } from '@/components/MarketSelector';
import { DigitSelector } from '@/components/DigitSelector';
import { TradeControls } from '@/components/TradeControls';
import { TickDisplay } from '@/components/TickDisplay';
import { TradeHistory } from '@/components/TradeHistory';
import { ConsoleLog } from '@/components/ConsoleLog';

const Index = () => {
  const {
    status,
    balance,
    currency,
    accountName,
    logs,
    ticks,
    lastDigits,
    tradeResults,
    isTrading,
    currentMarket,
    connect,
    disconnect,
    subscribeTicks,
    placeTrade,
  } = useDerivTrading();

  const [selectedDigit, setSelectedDigit] = useState(5);
  const isAuthorized = status === 'authorized';

  // Auto-subscribe to ticks when authorized
  useEffect(() => {
    if (isAuthorized) {
      subscribeTicks(currentMarket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground">
            Digit<span className="text-primary">Match</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">Deriv Synthetic Trading Terminal</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <ConnectionPanel
            status={status}
            accountName={accountName}
            balance={balance}
            currency={currency}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <MarketSelector
            currentMarket={currentMarket}
            onSelect={m => subscribeTicks(m)}
            disabled={!isAuthorized}
          />
        </div>

        {/* Center */}
        <div className="lg:col-span-5 space-y-3">
          <TickDisplay
            ticks={ticks}
            market={currentMarket}
            lastDigits={lastDigits}
          />
          <DigitSelector
            selectedDigit={selectedDigit}
            onSelect={setSelectedDigit}
            lastDigits={lastDigits}
            disabled={!isAuthorized}
          />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <TradeControls
            onTrade={placeTrade}
            selectedDigit={selectedDigit}
            isTrading={isTrading}
            disabled={!isAuthorized}
          />
          <TradeHistory results={tradeResults} />
          <ConsoleLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Index;
