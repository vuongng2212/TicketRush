'use client';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  message = 'KHÔNG THỂ TẢI DỮ LIỆU', 
  onRetry 
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
          {message}
        </p>
        <p className="font-body text-small text-muted mb-8">
          Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="font-label uppercase tracking-[0.2em] text-label border border-paper px-8 py-3 hover:bg-paper hover:text-ink"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
