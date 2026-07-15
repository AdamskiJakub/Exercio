interface StatsCounterProps {
  value: number;
  label: string;
}

export function StatsCounter({ value, label }: StatsCounterProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
