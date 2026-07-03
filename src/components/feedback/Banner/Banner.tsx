import React from 'react';
import { AlertTriangle, WifiOff, Database, ShieldAlert } from 'lucide-react';

interface BannerProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  iconType?: 'offline' | 'database' | 'maintenance' | 'general';
  actionLabel?: string;
  onActionClick?: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  message,
  type,
  iconType = 'general',
  actionLabel,
  onActionClick
}) => {
  const getColors = () => {
    switch (type) {
      case 'error':
        return 'bg-red-950/80 border-red-800 text-red-200';
      case 'warning':
        return 'bg-amber-950/80 border-[#fabd00]/30 text-amber-200';
      case 'info':
      default:
        return 'bg-sky-950/80 border-sky-800 text-sky-200';
    }
  };

  const getIcon = () => {
    const sizeClasses = "h-4 w-4 shrink-0";
    switch (iconType) {
      case 'offline':
        return <WifiOff className={`${sizeClasses} text-red-400`} />;
      case 'database':
        return <Database className={`${sizeClasses} text-amber-400`} />;
      case 'maintenance':
        return <ShieldAlert className={`${sizeClasses} text-[#fabd00]`} />;
      case 'general':
      default:
        return <AlertTriangle className={`${sizeClasses}`} />;
    }
  };

  return (
    <div
      role="status"
      className={`w-full py-2.5 px-4 border-b text-xs font-semibold flex items-center justify-between gap-3 ${getColors()} backdrop-blur-sm z-[100]`}
    >
      <div className="flex items-center gap-2.5 mx-auto">
        {getIcon()}
        <span>{message}</span>
        {actionLabel && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="underline ml-2 hover:opacity-85 transition-opacity font-bold"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
