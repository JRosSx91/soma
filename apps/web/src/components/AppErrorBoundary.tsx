import { Component, type ReactNode } from "react";
import { SomaMark } from "../features/recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../features/recovery-dashboard/focus.js";
import { resolveAppErrorCopy } from "./app-error-copy.js";

function reloadPage(): void {
  window.location.reload();
}

interface AppErrorFallbackProps {
  onReload?: () => void;
}

/** Rendered outside the router and providers: no Link, hooks or context. */
export function AppErrorFallback({ onReload = reloadPage }: AppErrorFallbackProps) {
  const copy = resolveAppErrorCopy();

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#081018] px-6 text-center text-soma-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_50%,rgba(104,216,192,0.16),transparent_34%),radial-gradient(ellipse_at_92%_48%,rgba(134,183,232,0.14),transparent_36%),radial-gradient(ellipse_at_50%_18%,rgba(134,183,232,0.06),transparent_42%)]"
      />
      <main className="relative flex max-w-md flex-col items-center">
        <span className="inline-flex scale-150">
          <SomaMark />
        </span>
        <h1 className="mt-10 text-pretty text-2xl font-semibold tracking-tight text-soma-ink sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-soma-ink-secondary">
          {copy.body}
        </p>
        <button
          type="button"
          onClick={onReload}
          className={`${previewFocus} mt-8 inline-flex items-center justify-center rounded-xl bg-soma-action px-6 py-3 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover`}
        >
          {copy.reload}
        </button>
      </main>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  onReload?: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render and lifecycle errors below it so the SPA never ends blank.
 * Network errors stay with each screen; nothing is logged or sent anywhere.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback onReload={this.props.onReload} />;
    }
    return this.props.children;
  }
}
