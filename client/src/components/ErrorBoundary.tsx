import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { GoldButton } from './GoldButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full p-8 bg-card/80 backdrop-blur-sm border-destructive/50">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>
              </div>

              {this.state.error && (
                <details className="text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Technical details
                  </summary>
                  <pre className="mt-2 text-xs bg-background/50 p-3 rounded border border-border overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <GoldButton
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </GoldButton>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
