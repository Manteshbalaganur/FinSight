import { cn } from "@/lib/utils";

/** Shared loading / error / empty placeholder, styled like the existing cards. */
export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-6 text-sm text-text-muted">
      <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-loss/30 bg-loss/10 p-4 text-sm">
      <p className="text-text-muted">
        <span className="font-semibold text-loss">Error: </span>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-semibold text-primary hover:text-primary/80">
          Retry
        </button>
      )}
    </div>
  );
}

export function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-bg-card p-8 text-center text-sm text-text-muted", className)}>
      {children}
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral/30 bg-neutral/10 p-3 text-sm text-text-muted">{children}</div>
  );
}
