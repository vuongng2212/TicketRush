'use client';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = 'KHÔNG CÓ SỰ KIỆN NÀO' }: EmptyStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="font-mono text-label uppercase text-muted tracking-[0.2em] mb-4">
          {message}
        </p>
        <p className="font-body text-small text-muted">
          Chưa có sự kiện nào được lên lịch. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
