/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('React Error Boundary caught error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });

        // TODO: Send to error tracking service (Sentry, etc.)
    }

    private handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-main)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '500px',
                            padding: '30px',
                            borderRadius: '16px',
                            backgroundColor: 'var(--bg-panel)',
                            border: '1px solid rgba(255, 50, 50, 0.3)',
                        }}
                    >
                        <h1 style={{ color: 'var(--error)', marginTop: 0 }}>
                            Oops! Something went wrong
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{ textAlign: 'left', marginBottom: '20px' }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                                    Error Details
                                </summary>
                                <pre
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        overflow: 'auto',
                                        fontSize: '12px',
                                    }}
                                >
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                className="btn"
                                onClick={this.handleReset}
                                style={{ flex: 1, maxWidth: '150px' }}
                            >
                                Try Again
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => window.location.reload()}
                                style={{ flex: 1, maxWidth: '150px' }}
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
