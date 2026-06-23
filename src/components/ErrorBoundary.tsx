import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-lg bg-red-50 border border-red-200 rounded-[12px] text-red-800 text-body-sm text-left my-md">
          <h4 className="font-bold flex items-center gap-xs mb-xs">
            <span className="material-symbols-outlined text-[20px]">error</span>
            Something went wrong
          </h4>
          <p className="text-xs text-secondary">
            {this.state.error?.message || 'A rendering error occurred in this component.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
