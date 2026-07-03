import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load widget data',
  description = 'An error occurred while communicating with the ARCUS data services.',
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-950/30 rounded bg-red-950/5 max-w-md mx-auto my-4 space-y-3">
      <div className="p-3 bg-red-950/20 rounded-full text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-red-300 text-xs font-bold font-sans uppercase tracking-wider">{title}</h4>
        <p className="text-red-200/60 text-[10px] leading-relaxed max-w-xs">{description}</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="text-[10px] h-8 font-semibold px-3 rounded border-red-900/30 text-red-200 hover:bg-red-950/20"
        >
          {isRetrying ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-current" />
              Retrying...
            </span>
          ) : (
            'Try Again'
          )}
        </Button>
      )}
    </div>
  );
};
