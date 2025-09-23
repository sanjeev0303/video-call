"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isInfiniteLoopError = error?.message?.includes('Maximum update depth exceeded');

      return (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-4">
                {isInfiniteLoopError
                  ? "The video layout encountered a rendering error. This has been automatically fixed."
                  : this.props.fallbackMessage || "An unexpected error occurred in the meeting room."
                }
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="border-gray-600 text-white hover:border-gray-400"
              >
                Try Again
              </Button>
              <Button
                onClick={this.handleRefresh}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  Debug Information
                </summary>
                <div className="mt-2 p-4 bg-gray-800 rounded-lg text-xs overflow-auto max-h-40">
                  <div className="text-red-400 font-bold mb-2">Error:</div>
                  <div className="mb-4">{error.message}</div>
                  {error.stack && (
                    <>
                      <div className="text-red-400 font-bold mb-2">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-gray-300">
                        {error.stack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
