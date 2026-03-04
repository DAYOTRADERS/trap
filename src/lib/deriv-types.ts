export interface MarketConfig {
  symbol: string;
  label: string;
  decimalPlaces: number;
}

export const MARKETS: MarketConfig[] = [
  { symbol: '1HZ10V', label: 'Volatility 10 (1s)', decimalPlaces: 2 },
  { symbol: '1HZ15V', label: 'Volatility 15 (1s)', decimalPlaces: 3 },
  { symbol: '1HZ25V', label: 'Volatility 25 (1s)', decimalPlaces: 2 },
  { symbol: '1HZ30V', label: 'Volatility 30 (1s)', decimalPlaces: 3 },
  { symbol: '1HZ50V', label: 'Volatility 50 (1s)', decimalPlaces: 2 },
  { symbol: '1HZ75V', label: 'Volatility 75 (1s)', decimalPlaces: 2 },
  { symbol: '1HZ90V', label: 'Volatility 90 (1s)', decimalPlaces: 3 },
  { symbol: '1HZ100V', label: 'Volatility 100 (1s)', decimalPlaces: 2 },
];

export interface TickData {
  symbol: string;
  quote: number;
  epoch: number;
  lastDigit: number;
}

export interface TradeResult {
  contractId: string | null;
  digit: number;
  selectedDigit: number;
  profit: number;
  win: boolean;
  timestamp: number;
  status: 'pending' | 'won' | 'lost' | 'sold';
  buyPrice: number;
  payout: number;
}

export interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'authorized';
