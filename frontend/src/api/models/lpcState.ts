// src/api/models/lpcState.ts
//
// Operating states of a Controllable System in the EEBUS LPC use case, as the
// backend derives them from the limit the device reports and whether it is
// still reachable. Kept in sync with LPCState in backend/server/eebus/lpcstate.go.

export const LpcState = {
  Init: "init",
  UnlimitedControlled: "unlimited_controlled",
  UnlimitedAutonomous: "unlimited_autonomous",
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
  description: string;
}

// Tailwind scans these files for class names, so every class is spelled out in
// full here rather than assembled from parts at runtime.
export const LPC_STATE_APPEARANCE: Record<LpcStateValue, LpcStateAppearance> = {
  [LpcState.Init]: {
    label: "Init",
    shortLabel: "Init",
    icon: "hourglass_empty",
    dot: "bg-slate-400",
    text: "text-slate-300",
    background: "bg-slate-400/10",
    border: "border-slate-400/30",
    description:
      "Not under CEM control yet — no limit has been sent to it, so it still applies its failsafe limit.",
  },
  [LpcState.UnlimitedControlled]: {
    label: "Unlimited / controlled",
    shortLabel: "Controlled",
    icon: "check_circle",
    dot: "bg-green-500",
    text: "text-green-400",
    background: "bg-green-500/10",
    border: "border-green-500/30",
    description:
      "Reachable with no active limit — consuming freely under CEM control.",
  },
  [LpcState.UnlimitedAutonomous]: {
    label: "Unlimited / autonomous",
    shortLabel: "Autonomous",
    icon: "link_off",
    dot: "bg-sky-400",
    text: "text-sky-300",
    background: "bg-sky-400/10",
    border: "border-sky-400/30",
    description:
      "Out of contact past the failsafe period — the device now decides on its own.",
  },
  [LpcState.LimitedWithDuration]: {
    label: "Limited with duration",
    shortLabel: "Limited (timed)",
    icon: "timer",
    dot: "bg-amber-400",
    text: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/30",
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
    description:
      "Contact lost — the device fell back to its failsafe limit.",
  },
};

// A device the backend has not reported on yet is shown as Init, matching the
// state a Controllable System starts in. Note that the EEBUS LPC use case gives
// the Energy Guard no way to read the CS state machine, so the backend infers
// Init from whether this CEM has handed the device a limit yet.
export const DEFAULT_LPC_STATE: LpcStateValue = LpcState.Init;

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
