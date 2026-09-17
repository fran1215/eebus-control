// src/api/models/measurements.ts
//
// MPC readings arrive from the backend in SI base units (W, Wh, A, V, Hz) and
// are formatted where they are rendered, so each readout can pair the number
// with its own unit element.
//
// A reading that has not arrived yet — or that came through as null or NaN —
// reads as zero. A measurement card showing nothing at all is indistinguishable
// from a broken layout, whereas 0.00 says plainly that there is no reading.

const KILO = 1000;

function toFiniteNumber(value: number | undefined | null): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// Formats a reading to a fixed number of decimals, without its unit.
export function formatReading(
  value: number | undefined | null,
  scale = 1,
  decimals = 2,
): string {
  return (toFiniteNumber(value) / scale).toFixed(decimals);
}

export const formatPower = (watts?: number | null) => formatReading(watts, KILO);
export const formatEnergy = (wattHours?: number | null) =>
  formatReading(wattHours, KILO);
export const formatCurrent = (amps?: number | null) => formatReading(amps);
export const formatVoltage = (volts?: number | null) => formatReading(volts);
export const formatFrequency = (hertz?: number | null) => formatReading(hertz);
