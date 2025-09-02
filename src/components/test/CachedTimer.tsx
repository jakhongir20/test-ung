import type { FC } from "react";
import { useEffect } from "react";
import { useTimer } from "react-timer-hook";

interface Props {
  onExpire: () => void;
}

const STORAGE_KEY = "my-timer-expiry";
const DURATION_SEC = 59;

const makeExpiry = () => {
  const d = new Date();
  d.setSeconds(d.getSeconds() + DURATION_SEC);
  return d;
};

export const CachedTimer: FC<Props> = ({onExpire}) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const expiry = stored ? new Date(stored) : makeExpiry();

  const {seconds, minutes, restart} = useTimer({
    expiryTimestamp: expiry,
    onExpire: onExpire,
  });
  /* eslint-disable @typescript-eslint/no-unused-vars */

  const resetTimer = () => {
    const next = makeExpiry();
    localStorage.setItem(STORAGE_KEY, next.toISOString());
    restart(next);
  };

  useEffect(() => {
    const now = Date.now();
    if (expiry.getTime() <= now) {
      const next = makeExpiry();
      localStorage.setItem(STORAGE_KEY, next.toISOString());
      restart(next);
    } else {
      localStorage.setItem(STORAGE_KEY, expiry.toISOString());
    }
  }, []);

  return (
    <div
      className={
        "flex items-center justify-center gap-1 text-sm font-medium text-gray"
      }
    >
      <span style={{fontFamily: "monospace"}}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} min
      </span>
    </div>
  );
};
