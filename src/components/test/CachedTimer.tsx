import type { FC } from "react";
import { useEffect } from "react";
import { useTimer } from "react-timer-hook";

interface Props {
  endTime: number; // Unix timestamp in milliseconds
  onExpire: () => void;
}

export const CachedTimer: FC<Props> = ({ endTime, onExpire }) => {
  // Validate endTime
  if (!endTime || endTime <= 0) {
    return (
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray">
        <span style={{ fontFamily: "monospace" }}>--:-- min</span>
      </div>
    );
  }

  // Convert endTime to Date object for useTimer
  const expiryDate = new Date(endTime);

  const { seconds, minutes, hours, restart } = useTimer({
    expiryTimestamp: expiryDate,
    onExpire: onExpire,
  });

  // Update timer when endTime changes
  useEffect(() => {
    const newExpiry = new Date(endTime);
    const now = Date.now();

    if (endTime <= now) {
      // Already expired
      onExpire();
    } else {
      // Restart timer with new expiry
      restart(newExpiry);
    }
  }, [endTime, onExpire, restart]);

  // Calculate total minutes remaining (including hours)
  const totalMinutes = hours * 60 + minutes;

  // Handle edge case where time is very low
  if (totalMinutes <= 0 && seconds <= 0) {
    return (
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-red-600">
        <span style={{ fontFamily: "monospace" }}>00:00 min</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray">
      <span style={{ fontFamily: "monospace" }}>
        {String(totalMinutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} min
      </span>
    </div>
  );
};
