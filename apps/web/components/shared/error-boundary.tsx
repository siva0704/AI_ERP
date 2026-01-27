'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallbackTitle?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ModuleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ModuleErrorBoundary caught an error:", error, errorInfo);
        // Optional: Send to logging service
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Card className="border-red-200 bg-red-50 text-red-900 h-full min-h-[150px] flex flex-col justify-center items-center p-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <h3 className="font-semibold">{this.props.fallbackTitle || 'Widget Failed'}</h3>
                    <p className="text-xs text-red-700 mb-4 max-w-[80%] text-center">
                        {this.state.error?.message || 'Something went wrong loading this component.'}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={this.resetError}
                        className="bg-white border-red-200 hover:bg-red-100 text-red-700"
                    >
                        <RefreshCcw className="mr-2 h-3 w-3" /> Retry
                    </Button>
                </Card>
            );
        }

        return this.props.children;
    }
}
