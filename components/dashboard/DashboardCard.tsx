interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

export default function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
