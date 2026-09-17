import { useEffect, useState } from "preact/hooks";
import {
  formatLimit,
  formatRemaining,
  isLimitedState,
  lpcStateAppearance,
  LpcState,
  type LpcStatus,
} from "../api/models/lpcState";

interface LpcStatusBadgeProps {
  status?: LpcStatus;
  // "card" is the compact form for the grid cards, "header" the full one for
  // the selected device panel.
  size?: "card" | "header";
}

export default function LpcStatusBadge({
  status,
  size = "card",
}: LpcStatusBadgeProps) {
  const appearance = lpcStateAppearance(status?.state);
  const compact = size === "card";

  // The backend only pushes when the state itself moves on, so the countdown
  // for the self-ending states runs locally between updates and resyncs on the
  // next message.
  const [remaining, setRemaining] = useState(status?.remaining ?? 0);

  useEffect(() => {
    setRemaining(status?.remaining ?? 0);

    if (!status || status.remaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  // Failsafe is the one state that wants the eye, so its dot pulses.
  const isFailsafe = status?.state === LpcState.Failsafe;
  const showRemaining = !compact && remaining > 0;
  // The grid cards carry the limit on their own row, so the badge only spells
  // it out in the roomier header form.
  const showLimit = !compact && isLimitedState(status?.state);

  return (
    <span
      title={appearance.description}
      className={`inline-flex items-center gap-1.5 rounded border ${appearance.background} ${appearance.border} ${appearance.text} ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      } font-bold uppercase tracking-wider whitespace-nowrap`}
    >
      <span className="relative flex size-1.5 shrink-0">
        {isFailsafe && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${appearance.dot}`}
          />
        )}
        <span
          className={`relative inline-flex size-1.5 rounded-full ${appearance.dot}`}
        />
      </span>
      {!compact && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "12px" }}
        >
          {appearance.icon}
        </span>
      )}
      {compact ? appearance.shortLabel : appearance.label}
      {showLimit && (
        <span className="font-mono normal-case opacity-80">
          {formatLimit(status!.limit)}
        </span>
      )}
      {showRemaining && (
        <span className="font-mono normal-case opacity-70">
          {formatRemaining(remaining)}
        </span>
      )}
    </span>
  );
}
