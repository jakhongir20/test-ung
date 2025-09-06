import type { FC } from 'react';

type Props = {
  total: number;
  currentIndex: number;
  answered: boolean[];
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
  variant?: 'popup' | 'docked';
};

const dot = (cls: string) => (
  <span className={`inline-block h-3.5 w-3.5 rounded ${cls}`}/>
);

const QuestionNavigator: FC<Props> = ({total, currentIndex, answered, open, onClose, onSelect, variant = 'popup'}) => {
  if (variant === 'popup' && !open) return null;
  const containerClass = variant === 'popup'
    ? 'absolute md:left-[32px] left-[16px] bottom-20 z-20 md:w-[min(472px,95vw)] rounded-xl border border-[#E2E8F0] bg-white p-4'
    : 'rounded-xl bg-white shadow-sm p-4';
  return (
    <div className={containerClass}>
      <div className={''}>
        <div className="flex items-center md:gap-6 gap-4 text-sm text-[#475569]">
          <span
            className="inline-flex items-center gap-1.5">{dot('bg-transparent border border-[#00A2DE]')} Answered</span>
          <span
            className="inline-flex items-center gap-2">{dot('bg-[#F8FAFC] border border-[#E2E8F0]')} Not Answered</span>
          <span
            className="inline-flex items-center gap-2">{dot('bg-transparent border border-dashed border-[#00A2DE]')} Current</span>
        </div>
        <div className={'w-full h-[1px] mb-4 mt-3 bg-[#F1F5F9]'}></div>
      </div>
      <div className="grid grid-cols-7 md:grid-cols-10 gap-2">
        {Array.from({length: total}).map((_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answered[i];
          return (
            <button
              key={i}
              onClick={() => {
                onSelect(i);
                if (variant === 'popup') onClose();
              }}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${isCurrent ? 'bg-transparent border border-dashed border-[#00A2DE] text-[#00A2DE]' : isAnswered ? 'bg-[#F8FAFC] border border-[#00A2DE]' : 'bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator


