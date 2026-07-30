import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-2 font-display">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-md">
              {this.props.fallbackText || "We couldn't load this section. Please try refreshing the page."}
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-full font-semibold">
              Refresh Page
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
