interface DigitSelectorProps {
  selectedDigit: number;
  onSelect: (digit: number) => void;
  lastDigits: number[];
  disabled: boolean;
}

export function DigitSelector({ selectedDigit, onSelect, lastDigits, disabled }: DigitSelectorProps) {
  // Count digit frequency
  const freq = Array(10).fill(0);
  lastDigits.forEach(d => freq[d]++);
  const maxFreq = Math.max(...freq, 1);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Digit</h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => {
          const isSelected = i === selectedDigit;
          const pct = lastDigits.length > 0 ? (freq[i] / maxFreq) * 100 : 0;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={disabled}
              className={`relative flex flex-col items-center justify-center rounded-lg p-3 font-mono text-xl font-bold transition-all overflow-hidden ${
                isSelected
                  ? 'bg-primary text-primary-foreground glow-green border border-primary'
                  : 'bg-muted text-foreground border border-transparent hover:border-primary/30'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {/* Frequency bar background */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary/10 transition-all duration-500"
                style={{ height: `${pct}%` }}
              />
              <span className="relative z-10">{i}</span>
              <span className="relative z-10 text-[10px] text-muted-foreground mt-0.5">
                {freq[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
