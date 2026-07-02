'use client';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'ĐANG TẢI...' }: LoadingStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6 py-12">
      <p className="font-mono text-label uppercase text-muted tracking-[0.2em]">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
