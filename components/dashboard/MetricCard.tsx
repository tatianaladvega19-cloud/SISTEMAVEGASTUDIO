interface MetricCardProps {
  label: string;
  value: string;
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}
