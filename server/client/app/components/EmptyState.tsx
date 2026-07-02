interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = 'Không có dữ liệu' }: EmptyStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="text-center">
        <p className="font-mono text-muted uppercase tracking-wider">{message}</p>
      </div>
    </div>
  );
};
