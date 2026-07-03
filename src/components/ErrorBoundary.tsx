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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-red-200 rounded-[12px] text-center my-6 max-w-md mx-auto shadow-sm gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center animate-pulse text-amber-500">
            <span className="material-symbols-outlined text-[32px]">sync</span>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-h3 font-bold text-gray-900">We're updating the application</h4>
            <p className="text-caption text-gray-500">
              Reconnecting automatically or resolving transient data states...
            </p>
          </div>
          {this.state.error && (
            <div className="text-left w-full bg-gray-50 p-3 rounded border border-gray-150 text-[11px] font-mono text-gray-600 overflow-auto max-h-32">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-gray-950 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-gray-800 transition-all"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
