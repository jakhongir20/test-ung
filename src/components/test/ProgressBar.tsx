import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { ACTION_BTN_STYLES, CARD_STYLES } from "./test.data.ts";
import { CachedTimer } from "./CachedTimer.tsx";
import { useTimer } from "react-timer-hook";
import LoadingSvg from "../LoadingSvg.tsx";

interface Props {
  title: string;
  current: number;
  total: number;
  isFinishing: boolean;
  endTime?: number;
  timeLimitMinutes?: number; // Total test duration in minutes
  onExpire?: () => void;
  onFinish?: () => void;
}

export const ProgressBar: FC<Props> = ({
  title,
  current,
  total,
  endTime,
  timeLimitMinutes,
  isFinishing,
  onExpire,
  onFinish
}) => {
  const { t } = useI18n();
  const [timeProgress, setTimeProgress] = useState(0);

  // Always call useTimer hook, but only use it when conditions are met
  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp: endTime && endTime > 0 && timeLimitMinutes ? new Date(endTime) : new Date(Date.now() + 1000),
    onExpire: onExpire || (() => { }),
    autoStart: !!(endTime && endTime > 0 && timeLimitMinutes), // Only start timer when conditions are met
  });

  // Update progress every 10 seconds - only when timer is active
  useEffect(() => {
    if (!(endTime && endTime > 0 && timeLimitMinutes)) {
      return; // Don't update progress if timer is not active
    }

    const updateProgress = () => {
      // Calculate progress based on actual time elapsed from start
      const now = Date.now();
      const testStartTime = endTime - (timeLimitMinutes * 60 * 1000); // Calculate start time
      const totalTestMs = timeLimitMinutes * 60 * 1000; // Total test duration in milliseconds
      const elapsedMs = now - testStartTime; // Time elapsed since test started

      // Calculate progress percentage: elapsed time / total time * 100
      const progress = Math.max(0, Math.min(100, (elapsedMs / totalTestMs) * 100));

      // Debug logging
      console.log('Progress calculation (direct):', {
        now,
        endTime,
        testStartTime,
        totalTestMs,
        elapsedMs,
        progress: `${progress.toFixed(1)}%`,
        timeLimitMinutes,
        remainingMs: endTime - now
      });

      setTimeProgress(progress);
    };

    // Update immediately
    updateProgress();

    // Update every 10 seconds
    const interval = setInterval(updateProgress, 10000);

    return () => clearInterval(interval);
  }, [endTime, timeLimitMinutes]);

  // Use time-based progress if available and valid, otherwise fall back to question-based progress
  const isValidTimeProgress = endTime && endTime > 0 && timeLimitMinutes && timeProgress >= 0 && timeProgress <= 100;
  const progressPercentage = isValidTimeProgress ? timeProgress : (total > 0 ? (current / total) * 100 : 0);

  return (
    <div className={`${CARD_STYLES} relative`}>
      {/* Top Row - Title, Timer, and Finish Button */}
      <div className="flex md:flex-row flex-col gap-3 md:items-center justify-between">
        {/* Title */}
        <div className="flex-1">
          <h3 className="text-[20px] font-medium text-gray-900">{title}</h3>
        </div>

        <div className={'flex items-center gap-2 justify-between md:gap-6'}>
          {/* Timer */}
          <div className={'flex items-center gap-1 md:gap-2'}>
            <div
              className={`${ACTION_BTN_STYLES} flex items-center !cursor-default pointer-events-none  justify-center !p-0 !w-[42px] md:!w-[46px]`}>
              <img className={'!w-[18px]'} src={'/icon/clock.svg'} alt={'icon left'} />
            </div>
            {endTime && (
              <span className="text-base font-medium text-gray-700">
                <CachedTimer
                  endTime={endTime}
                  onExpire={onExpire || (() => {
                  })}
                  onFinish={onFinish}
                />
              </span>
            )}
          </div>

          {/* Finish Button */}
          <button
            onClick={onFinish}
            disabled={isFinishing}
            className={`${ACTION_BTN_STYLES} !text-base ${isFinishing && 'opacity-50 !cursor-not-allowed'} `}>
            {t('test.finishTest')}
            {isFinishing ? <LoadingSvg color={'blue'} /> : <img src={'/icon/check-circle.svg'} alt={'icon left'} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full bg-transparent absolute bottom-0 left-0 h-2 overflow-hidden rounded-bl-[16px] rounded-br-[16px]">
        <div
          className="bg-[#00A2DE] h-2 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
