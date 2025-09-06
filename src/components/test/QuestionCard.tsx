import type { FC, ReactNode } from 'react';
import { CARD_STYLES } from "./test.data.ts";

type Option = { key: string; label: string; };

type Props = {
  index: number;
  title: string;
  options: Option[];
  selectedKeys: string[];
  multiple?: boolean;
  isOpen?: boolean;
  textAnswer?: string;
  onToggle: (key: string) => void;
  onTextChange?: (value: string) => void;
  media?: ReactNode;
};

const QuestionCard: FC<Props> = ({
                                   index,
                                   title,
                                   options,
                                   selectedKeys,
                                   multiple = false,
                                   isOpen = false,
                                   textAnswer = '',
                                   onToggle,
                                   onTextChange,
                                   media
                                 }) => {
  return (
    <section
      className={CARD_STYLES}>
      <div className={'border-b space-y-4 pb-8 md:mb-10 mb-6 border-[#E2E8F0] mx-auto  w-[80%]'}>
        <p className="text-sm font-medium text-[#334155] ">Question {index}</p>
        <h2 className="text-lg md:text-xl font-medium text-black">{title}</h2>
      </div>

      {isOpen ? (
        // Open-ended question with text input
        <div className="mt-6">
          <textarea
            value={textAnswer}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full min-h-[120px] rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-y"
          />
        </div>
      ) : (
        // Multiple choice questions
        <div
          className={`w-full max-w-[840px] mx-auto ${media ? 'md:grid grid-cols-[1fr_70px_1fr] items-center' : ''}`}>
          {media && media}
          {media && <div className={'bg-[#E2E8F0] flex justify-center mx-auto w-[1px] h-full'}></div>}
          <div className={'space-y-3 w-full'}>
            {options.map((opt, idx) => {
              const checked = selectedKeys.includes(opt.key);
              return (
                <label
                  key={opt.key}
                  className="flex cursor-pointer relative items-center gap-2 pl-0 rounded-xl bg-white border border-[#F1F5F9] hover:ring-cyan-300 has-[:checked]:border-[#00A2DE] has-[:checked]:text-[#00A2DE] transition"
                >
                <span
                  className={`text-[18px] p-3 w-20 border-r border-[#F1F5F9] grid place-items-center  font-normal ${checked ? '' : 'text-[#475569]'}`}>{opt.key}</span>
                  <input type={multiple ? 'checkbox' : 'radio'} name={`q-${index}`}
                         className="accent-cyan-600 absolute top-1/2 -translate-y-1/2 right-5"
                         checked={checked} onChange={() => onToggle(opt.key)}/>
                  <span className="flex-1 p-3 pr-12">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export type { Option };
export default QuestionCard


