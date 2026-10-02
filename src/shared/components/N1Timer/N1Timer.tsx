import React, { useEffect, useState } from 'react';
import { N1Text, type N1TextProps } from '../N1Text/N1Text';

const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** 1112 seconds → "00:18:32". */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / SECONDS_PER_HOUR);
  const minutes = Math.floor((s % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = s % SECONDS_PER_MINUTE;
  return [hours, minutes, seconds]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

export type N1TimerProps = Omit<N1TextProps, 'children'> & {
  /** When the operation started (Date or epoch milliseconds). */
  startedAt: Date | number;
  /** Stops ticking when false, e.g. while paused. Defaults to true. */
  running?: boolean;
  /** Time already spent before `startedAt`, e.g. before a pause. */
  offsetSeconds?: number;
};

/** Live elapsed time, HH:MM:SS. */
export const N1Timer = React.memo(function N1TimerComponent({
  startedAt,
  running = true,
  offsetSeconds = 0,
  weight = 'semiBold',
  ...textProps
}: N1TimerProps) {
  const start = typeof startedAt === 'number' ? startedAt : startedAt.getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = offsetSeconds + (now - start) / SECOND_MS;
  return (
    <N1Text weight={weight} accessibilityRole="timer" {...textProps}>
      {formatElapsed(elapsed)}
    </N1Text>
  );
});
N1Timer.displayName = 'N1Timer';
