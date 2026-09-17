// src/api/models/lpcState.ts
//
// Operating states of a Controllable System in the EEBUS LPC use case, as the
// backend derives them from the limit the device reports and whether it is
// still reachable. Kept in sync with LPCState in backend/server/eebus/lpcstate.go.

export const LpcState = {
  // Init and "unlimited / autonomous" are reported as one state: the LPC use
  // case gives the Energy Guard no way to tell them apart.
  InitOrAutonomous: "init_or_autonomous",
  UnlimitedControlled: "unlimited_controlled",
  LimitedWithDuration: "limited_with_duration",
  LimitedWithoutDuration: "limited_without_duration",
  Failsafe: "failsafe",
} as const;

export type LpcStateValue = (typeof LpcState)[keyof typeof LpcState];

// The state of one device, as carried by the lpc_state_update message.
export interface LpcStatus {
  ski: string;
  state: LpcStateValue;
  connected: boolean;
  limit: number;
  limit_active: boolean;
  duration: number; // seconds
  remaining: number; // seconds left in states that end on their own, else 0
  failsafe_value: number;
  failsafe_duration: number; // seconds
}

interface LpcStateAppearance {
  label: string; // full name, for the selected device header
  shortLabel: string; // fits the narrow grid cards
  icon: string; // material symbol
  dot: string;
  text: string;
  background: string;
  border: string;
  cardBorder: string; // left edge of the grid card
  description: string;
}

// Tailwind scans these files for class names, so every class is spelled out in
// full here rather than assembled from parts at runtime.
export const LPC_STATE_APPEARANCE: Record<LpcStateValue, LpcStateAppearance> = {
  [LpcState.InitOrAutonomous]: {
    label: "Init / Autonomous",
    shortLabel: "Init / Auto",
    icon: "help",
    dot: "bg-slate-400",
    text: "text-slate-300",
    background: "bg-slate-400/10",
    border: "border-slate-400/30",
    cardBorder: "border-l-slate-400",
    description:
      "Not under CEM control — either still in init or acting on its own. The device reports nothing that tells the two apart.",
  },
  [LpcState.UnlimitedControlled]: {
    label: "Unlimited / controlled",
    shortLabel: "Controlled",
    icon: "check_circle",
    dot: "bg-green-500",
    text: "text-green-400",
    background: "bg-green-500/10",
    border: "border-green-500/30",
    cardBorder: "border-l-green-500",
    description:
      "Reachable with no active limit — consuming freely under CEM control.",
  },
  [LpcState.LimitedWithDuration]: {
    label: "Limited with duration",
    shortLabel: "Limited (timed)",
    icon: "timer",
    dot: "bg-amber-400",
    text: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/30",
    cardBorder: "border-l-amber-400",
    description:
      "Consumption limit active — it lifts by itself when its duration runs out.",
  },
  [LpcState.LimitedWithoutDuration]: {
    label: "Limited without duration",
    shortLabel: "Limited",
    icon: "all_inclusive",
    dot: "bg-orange-500",
    text: "text-orange-400",
    background: "bg-orange-500/10",
    border: "border-orange-500/30",
    cardBorder: "border-l-orange-500",
    description: "Consumption limit active until the CEM changes it.",
  },
  [LpcState.Failsafe]: {
    label: "Failsafe",
    shortLabel: "Failsafe",
    icon: "warning",
    dot: "bg-red-500",
    text: "text-red-400",
    background: "bg-red-500/10",
    border: "border-red-500/30",
    cardBorder: "border-l-red-500",
    description:
      "Contact lost — the device fell back to its failsafe limit.",
  },
};

// A device the backend has not reported on yet reads as the indeterminate
// state, which is also where a device sits until this CEM limits it.
export const DEFAULT_LPC_STATE: LpcStateValue = LpcState.InitOrAutonomous;

export function lpcStateAppearance(state?: LpcStateValue): LpcStateAppearance {
  return LPC_STATE_APPEARANCE[state ?? DEFAULT_LPC_STATE];
}

// The two states that carry an active consumption limit.
export function isLimitedState(state?: LpcStateValue): boolean {
  return (
    state === LpcState.LimitedWithDuration ||
    state === LpcState.LimitedWithoutDuration
  );
}

// Limits arrive in watts; the readouts elsewhere in the UI are in kW.
export function formatLimit(watts: number): string {
  return `${(watts / 1000).toFixed(2)} kW`;
}

// Countdown for the states that end on their own, as m:ss or h:mm:ss.
export function formatRemaining(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
}
