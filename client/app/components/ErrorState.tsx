interface ErrorStateProps {
  message?: string;
}

export const ErrorState = ({ message = 'Có lỗi xảy ra' }: ErrorStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="text-center">
        <p className="font-mono text-coral uppercase tracking-wider mb-4">Lỗi</p>
        <p className="font-body text-muted">{message}</p>
      </div>
    </div>
  );
};
