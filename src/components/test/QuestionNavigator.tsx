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
  <span className={`inline-block h-3 w-3 rounded ${cls}`} />
);

const QuestionNavigator: FC<Props> = ({ total, currentIndex, answered, open, onClose, onSelect, variant = 'popup' }) => {
  if (variant === 'popup' && !open) return null;
  const containerClass = variant === 'popup'
    ? 'absolute left-0 bottom-16 z-20 w-[min(680px,95vw)] rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 p-4'
    : 'rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4';
  return (
    <div className={containerClass}>
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
        <span className="inline-flex items-center gap-2">{dot('bg-cyan-500')} Answered</span>
        <span className="inline-flex items-center gap-2">{dot('bg-gray-300')} Not Answered</span>
        <span className="inline-flex items-center gap-2">{dot('bg-transparent ring-2 ring-cyan-500')} Current</span>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answered[i];
          return (
            <button
              key={i}
              onClick={() => { onSelect(i); if (variant === 'popup') onClose(); }}
              className={`h-10 rounded-lg text-sm font-medium ring-1 transition ${isCurrent ? 'ring-cyan-500 ring-2' : isAnswered ? 'bg-cyan-50 text-cyan-700 ring-cyan-200' : 'ring-gray-200 text-gray-700'
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


