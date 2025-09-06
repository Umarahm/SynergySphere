import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error('ErrorBoundary caught an error:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary details:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback;

            if (FallbackComponent && this.state.error) {
                return <FallbackComponent error={this.state.error} />;
            }

            return (
                <div className='min-h-screen bg-background flex items-center justify-center p-4'>
                    <div className='max-w-md w-full bg-card border border-border rounded-xl p-6 text-center'>
                        <div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg className='w-8 h-8 text-destructive' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                            </svg>
                        </div>
                        <h2 className='text-sidebar-foreground font-aeonik text-xl font-medium mb-2'>
                            Something went wrong
                        </h2>
                        <p className='text-sidebar-foreground/70 font-aeonik text-sm mb-4'>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className='bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl px-4 py-2 font-aeonik text-sm'
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;