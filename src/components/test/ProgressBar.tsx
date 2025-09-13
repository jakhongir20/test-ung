import type { FC } from 'react';
import { CachedTimer } from './CachedTimer';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();

  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Progress Bar */}
        <div className="flex-1 mr-4">
          <div className="mb-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#00A2DE] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Right Section - Timer and Finish Button */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          {endTime && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <div className="flex items-center justify-center w-5 h-5 bg-[#00A2DE] rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                <CachedTimer endTime={endTime} onExpire={onExpire || (() => { })} />
              </span>
              <div className="w-4 h-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </div>
            </div>
          )}

          {/* Finish Button */}
          <button
            onClick={onFinish}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{t('test.finishTest')}</span>
            <div className="w-4 h-4 bg-[#00A2DE] rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
