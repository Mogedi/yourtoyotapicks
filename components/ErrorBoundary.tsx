'use client';

// ErrorBoundary - Catch and display React errors gracefully
import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-red-50 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Something went wrong
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  An error occurred while displaying this page. Please try
                  refreshing or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="w-full mb-4 p-3 bg-gray-100 rounded text-left">
                    <p className="text-xs font-mono text-gray-700 break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={this.handleReset} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => (window.location.href = '/')}>
                    Go Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
