import { useRef, useEffect } from 'react';
import type { LogEntry } from '@/lib/deriv-types';

interface ConsoleLogProps {
  logs: LogEntry[];
}

export function ConsoleLog({ logs }: ConsoleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const colorMap = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-loss',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Console</h3>
      <div
        ref={scrollRef}
        className="h-40 overflow-y-auto bg-muted rounded p-2 space-y-0.5"
      >
        {logs.map((entry, i) => (
          <div key={i} className={`text-[11px] font-mono ${colorMap[entry.type]}`}>
            <span className="text-muted-foreground mr-2">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            {entry.message}
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-xs text-muted-foreground">Waiting for events...</p>
        )}
      </div>
    </div>
  );
}
