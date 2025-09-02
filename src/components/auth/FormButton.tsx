import type { FC } from 'react';

interface Props {
  isLoading: boolean
  title: string
}

export const FormButton: FC<Props> = ({isLoading, title}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg h-[48px] transition-all cursor-pointer bg-[#00A2DE] text-white py-2 hover:bg-cyan-700 disabled:opacity-50"
    >
      {title}
    </button>
  );
};
