interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
