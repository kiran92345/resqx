import React from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ResQ-X render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] min-h-[100vh] flex-col items-center justify-center bg-[#0a0f1d] px-6 text-center text-slate-100">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Try refreshing the page. If this keeps happening, clear site data for this URL in your browser settings.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-emergency-red px-6 py-3 text-sm font-semibold text-white"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
