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
  isFinishing: boolean
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
  const {t} = useI18n();
  const [timeProgress, setTimeProgress] = useState(0);

  if (endTime && endTime > 0 && timeLimitMinutes) {
    // Convert endTime to Date object for useTimer (same as CachedTimer)
    const expiryDate = new Date(endTime);

    const {seconds, minutes, hours} = useTimer({
      expiryTimestamp: expiryDate,
      onExpire: onExpire || (() => {
      }),
    });

    // Calculate total seconds remaining (including seconds for more precise progress)
    const totalSecondsRemaining = hours * 3600 + minutes * 60 + seconds;
    const totalSecondsInTest = timeLimitMinutes * 60;

    // Update progress every 10 seconds
    useEffect(() => {
      const updateProgress = () => {
        // Calculate progress based on time remaining
        if (totalSecondsRemaining <= 0) {
          setTimeProgress(100); // Test expired
        } else {
          // Calculate progress: (total time - remaining time) / total time * 100
          const elapsedSeconds = totalSecondsInTest - totalSecondsRemaining;
          const progress = Math.max(0, Math.min(100, (elapsedSeconds / totalSecondsInTest) * 100));
          setTimeProgress(progress);
        }
      };

      // Update immediately
      updateProgress();

      // Update every 10 seconds
      const interval = setInterval(updateProgress, 10000);

      return () => clearInterval(interval);
    }, [totalSecondsRemaining, totalSecondsInTest]);
  }

  // Use time-based progress if available, otherwise fall back to question-based progress
  const progressPercentage = endTime && endTime > 0 && timeLimitMinutes ? timeProgress : (total > 0 ? (current / total) * 100 : 0);

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
              <img className={'!w-[18px]'} src={'/icon/clock.svg'} alt={'icon left'}/>
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
            {isFinishing ? <LoadingSvg color={'blue'}/> : <img src={'/icon/check-circle.svg'} alt={'icon left'}/>}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full bg-transparent absolute bottom-0 left-0 h-2 overflow-hidden rounded-bl-[16px] rounded-br-[16px]">
        <div
          className="bg-[#00A2DE] h-2 transition-all duration-300 ease-out"
          style={{width: `${progressPercentage}%`}}
        />
      </div>
    </div>
  );
};
