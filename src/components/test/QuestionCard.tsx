import type { FC, ReactNode } from 'react';

type Option = { key: string; label: string; };

type Props = {
  index: number;
  title: string;
  options: Option[];
  selectedKeys: string[];
  multiple?: boolean;
  onToggle: (key: string) => void;
  media?: ReactNode;
};

const QuestionCard: FC<Props> = ({ index, title, options, selectedKeys, multiple = false, onToggle, media }) => {
  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
      <p className="text-sm text-gray-500">Question {index}</p>
      <h2 className="mt-2 text-lg md:text-xl font-semibold">{title}</h2>
      {media}
      <div className="mt-6 space-y-3">
        {options.map((opt, idx) => {
          const checked = selectedKeys.includes(opt.key);
          return (
            <label key={opt.key} className="flex items-center gap-4 rounded-xl ring-1 ring-gray-200 hover:ring-cyan-300 has-[:checked]:ring-2 has-[:checked]:ring-cyan-500 transition p-3">
              <span className="w-8 h-8 grid place-items-center rounded bg-gray-100 text-gray-600 font-semibold">{opt.key}</span>
              <input type={multiple ? 'checkbox' : 'radio'} name={`q-${index}`} className="accent-cyan-600" checked={checked} onChange={() => onToggle(opt.key)} />
              <span className="flex-1">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export type { Option };
export default QuestionCard


