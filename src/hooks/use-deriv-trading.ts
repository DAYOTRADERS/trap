import { useState, useCallback, useRef, useEffect } from 'react';
import type { ConnectionStatus, TickData, TradeResult, LogEntry, MarketConfig } from '@/lib/deriv-types';
import { MARKETS } from '@/lib/deriv-types';

const APP_ID = '90701';
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

export function useDerivTrading() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [balance, setBalance] = useState<string>('0.00');
  const [currency, setCurrency] = useState<string>('USD');
  const [accountName, setAccountName] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ticks, setTicks] = useState<TickData[]>([]);
  const [lastDigits, setLastDigits] = useState<number[]>([]);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  const [currentMarket, setCurrentMarket] = useState<MarketConfig>(MARKETS[0]);
  const pendingRef = useRef<Map<string, (data: any) => void>>(new Map());
  const reqIdRef = useRef(1);
  const tickSubRef = useRef<string | null>(null);
  const tickListenerRef = useRef<((data: any) => void) | null>(null);

  const log = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-200), { message, type, timestamp: Date.now() }]);
  }, []);

  const sendRequest = useCallback((request: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      const reqId = reqIdRef.current++;
      const msg = { ...request, req_id: reqId };
      pendingRef.current.set(String(reqId), resolve);
      wsRef.current.send(JSON.stringify(msg));
      setTimeout(() => {
        if (pendingRef.current.has(String(reqId))) {
          pendingRef.current.delete(String(reqId));
          reject(new Error('Request timeout'));
        }
      }, 15000);
    });
  }, []);

  const handleMessage = useCallback((data: any) => {
    if (data.req_id) {
      const resolver = pendingRef.current.get(String(data.req_id));
      if (resolver) {
        pendingRef.current.delete(String(data.req_id));
        resolver(data);
      }
    }

    if (data.msg_type === 'tick') {
      const tick = data.tick;
      const quoteStr = String(tick.quote);
      const lastDigit = parseInt(quoteStr[quoteStr.length - 1]);
      const tickData: TickData = {
        symbol: tick.symbol,
        quote: tick.quote,
        epoch: tick.epoch,
        lastDigit,
      };
      setTicks(prev => [...prev.slice(-50), tickData]);
      setLastDigits(prev => [...prev.slice(-30), lastDigit]);

      if (tickListenerRef.current) {
        const listener = tickListenerRef.current;
        tickListenerRef.current = null;
        listener(data);
      }
    }

    if (data.msg_type === 'proposal_open_contract') {
      const poc = data.proposal_open_contract;
      if (poc && poc.is_sold) {
        setTradeResults(prev =>
          prev.map(t =>
            t.contractId === String(poc.contract_id)
              ? {
                  ...t,
                  profit: poc.profit,
                  win: poc.profit > 0,
                  status: poc.profit > 0 ? 'won' : 'lost',
                  payout: poc.payout || 0,
                }
              : t
          )
        );
        sendRequest({ balance: 1 }).then(resp => {
          if (resp.balance) {
            setBalance(String(resp.balance.balance));
            setCurrency(resp.balance.currency);
          }
        }).catch(() => {});
      }
    }
  }, [sendRequest]);

  const connect = useCallback((token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    log('Connecting to Deriv API...', 'info');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = async () => {
      setStatus('connected');
      log('WebSocket connected. Authorizing...', 'info');

      try {
        const authResp = await sendRequest({ authorize: token });
        if (authResp.error) {
          log(`Authorization failed: ${authResp.error.message}`, 'error');
          setStatus('disconnected');
          return;
        }
        setStatus('authorized');
        setAccountName(authResp.authorize.fullname || authResp.authorize.loginid);
        setBalance(String(authResp.authorize.balance));
        setCurrency(authResp.authorize.currency);
        log(`Authorized as ${authResp.authorize.loginid}`, 'success');
      } catch (e: any) {
        log(`Auth error: ${e.message}`, 'error');
        setStatus('disconnected');
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      log('Connection closed.', 'warning');
      tickSubRef.current = null;
    };

    ws.onerror = () => {
      log('WebSocket error occurred.', 'error');
    };
  }, [log, sendRequest, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    setIsTrading(false);
    tickSubRef.current = null;
  }, []);

  const subscribeTicks = useCallback(async (market: MarketConfig) => {
    if (tickSubRef.current) {
      try {
        await sendRequest({ forget: tickSubRef.current });
      } catch {}
      tickSubRef.current = null;
    }

    setCurrentMarket(market);
    setTicks([]);
    setLastDigits([]);
    log(`Subscribing to ${market.label}...`, 'info');

    try {
      const resp = await sendRequest({
        ticks: market.symbol,
        subscribe: 1,
      });
      if (resp.subscription) {
        tickSubRef.current = resp.subscription.id;
        log(`Subscribed to ${market.label}`, 'success');
      }
      if (resp.error) {
        log(`Tick subscription error: ${resp.error.message}`, 'error');
      }
    } catch (e: any) {
      log(`Subscribe error: ${e.message}`, 'error');
    }
  }, [sendRequest, log]);

  // ===================== START CHANGE =====================
  const placeTrades = useCallback(async (stake: number) => {
    if (status !== 'authorized' || !currentMarket) return;
    setIsTrading(true);

    const results: TradeResult[] = [];

    // Cancel any recent trades
    tradeResults.forEach(trade => {
      if (trade.timestamp < Date.now() - 2000) return;
      if (trade.contractId) {
        sendRequest({
          cancel_all: 1,
          contract_id: trade.contractId,
          reason: 'replaced'
        }).catch(e => console.error('Cancel error:', e));
      }
    });

    // 1️⃣ Place all 10 digit trades (0-9) as virtual
    const digits = ['1','2','3','4','5','6','7','8','9','0'];
    log(`Placing 10 virtual trades for all digits...`, 'info');

    for (const barrier of digits) {
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        const buyResp = await sendRequest({
          buy: '1',
          parameters: {
            amount: stake,
            basis: 'quote', // virtual
            contract_type: 'DIGITMATCH',
            currency,
            symbol: currentMarket.symbol,
            duration: 1,
            duration_unit: 't',
            barrier,
          },
        });

        if (!buyResp.error) {
          results.push({
            contractId: buyResp.buy?.contract_id || null,
            digit: parseInt(barrier),
            selectedDigit: -1,
            profit: 0,
            win: false,
            timestamp: Date.now(),
            status: 'pending',
            buyPrice: buyResp.buy?.buy_price || stake,
            payout: buyResp.buy?.payout || 0,
          });
        }
      } catch (e: any) {
        log(`Trade failed (digit ${barrier}): ${e.message}`, 'error');
      }
    }

    setTradeResults(prev => [...prev.filter(t => t.timestamp >= Date.now() - 2000), ...results]);

    // 2️⃣ Wait for the next tick → convert winning digit to real
    tickListenerRef.current = async (tickData: any) => {
      try {
        const tick = tickData.tick;
        const winningDigit = parseInt(String(tick.quote).slice(-1));
        log(`Winning digit: ${winningDigit}`, 'info');

        setTradeResults(prev =>
          prev.map(trade => {
            if (trade.digit === winningDigit && trade.status === 'pending') {
              sendRequest({
                buy: '1',
                price: stake,
                parameters: {
                  amount: stake,
                  basis: 'stake', // real
                  contract_type: 'DIGITMATCH',
                  currency,
                  symbol: currentMarket.symbol,
                  duration: 1,
                  duration_unit: 't',
                  barrier: String(winningDigit),
                },
              }).then(buyResp => {
                if (!buyResp.error && buyResp.buy?.contract_id) {
                  const newContractId = String(buyResp.buy.contract_id);
                  log(`REAL trade placed for digit ${winningDigit}, contract ${newContractId}`, 'success');
                  setTradeResults(prev2 =>
                    prev2.map(t =>
                      t.digit === winningDigit && t.status === 'pending'
                        ? { ...t, contractId: newContractId, status: 'real' }
                        : t
                    )
                  );
                  sendRequest({
                    proposal_open_contract: 1,
                    contract_id: newContractId,
                    subscribe: 1,
                  }).catch(() => {});
                }
              }).catch(e => log(`Real trade error: ${e.message}`, 'error'));
            }
            return trade;
          })
        );

        // Update balance
        const balResp = await sendRequest({ balance: 1 });
        if (balResp.balance) setBalance(String(balResp.balance.balance));
      } catch (e: any) {
        log(`Real trade failed: ${e.message}`, 'error');
      }
      setIsTrading(false);
    };
  }, [status, currentMarket, tradeResults, sendRequest, log]);
  // ===================== END CHANGE =====================

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
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
    placeTrades, // <-- new method
    log,
  };
}