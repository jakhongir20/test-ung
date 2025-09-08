import type { FC } from 'react';
import { useI18n } from "../i18n.tsx";

interface Props {
  className?: string;
  title?: string;
  description?: string;
}

export const MyProfileBanner: FC<Props> = ({title, description}) => {
  const {t} = useI18n()
  return (
    <section
      className="rounded-[16px]  md:h-[250px] flex flex-col justify-center bg-[#00A2DE] text-white p-6 md:p-10 relative overflow-hidden">
      <img className={'absolute end-0 sm:end-[36px] sm:w-auto sm:h-auto h-full object-cover w-full top-0'}
           src="/bg/profile-bg.png" alt=""/>
      <h2
        className="text-2xl md:text-[32px] mb-1 md:mb-3 uppercase font-medium tracking-widest">{title ?? t('profile.title')}</h2>
      <p className="mt-2 max-w-sm text-white/90 text-sm">
        {description ?? t('profile.subtitle')}
      </p>
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"/>
    </section>
  );
};
