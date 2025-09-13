import type { FC } from 'react';
import { useI18n } from '../../i18n';
import { ACTION_BTN_STYLES, CARD_STYLES } from "./test.data.ts";
import { CachedTimer } from "./CachedTimer.tsx";

interface Props {
  title: string;
  current: number;
  total: number;
  endTime?: number;
  onExpire?: () => void;
  onFinish?: () => void;
}

export const ProgressBar: FC<Props> = ({
                                         title,
                                         current,
                                         total,
                                         endTime,
                                         onExpire,
                                         onFinish
                                       }) => {
  const {t} = useI18n();

  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

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
              <span className="text-sm font-medium text-gray-700">
              <CachedTimer endTime={endTime} onExpire={onExpire || (() => {
              })}/>
            </span>
            )}
          </div>

          {/* Finish Button */}
          <button
            onClick={onFinish}
            className={`${ACTION_BTN_STYLES} !text-base`}>
            {t('test.finishTest')}
            <img src={'/icon/check-circle.svg'} alt={'icon left'}/>
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
