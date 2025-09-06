import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title: string;
}

export const FormContainer: FC<Props> = ({title, children}) => {
  return (
    <div
      className="mx-auto max-w-md w-[360px] md:w-[384px] rounded-2xl bg-white p-6 border border-[#E2E8F0]">
      <h1 className="text-3xl font-medium text-[#314158] mb-6">{title}</h1>
      {children}
    </div>
  );
};
