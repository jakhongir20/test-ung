import { createContext, type FC, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'uz' | 'ru';

type Dictionary = Record<string, Record<LanguageCode, string>>;

const dictionary: Dictionary = {
  'language.uz': {uz: "O'zbek", ru: "Узбекский"},
  'language.ru': {uz: 'Rus', ru: 'Русский'},
  'role.worker': {uz: 'Ishchi', ru: 'Работник'},
  'header.profile': {uz: 'Profil', ru: 'Профиль'},
  'header.test': {uz: 'Test', ru: 'Тест'},
  'profile.title': {uz: 'Mening profilim', ru: 'Мой профиль'},
  'profile.subtitle': {
    uz: "Mashq test natijalaringizni ko'rib chiqing, sinov kunidan oldin kuchli tomonlaringizni bilib oling.",
    ru: 'Просмотрите результаты своего теста с упражнениями, чтобы узнать свои сильные стороны перед днем теста.'
  },
  'profile.myDetails': {uz: 'Mening maʼlumotlarim', ru: 'Мои данные'},
  'profile.fio': {uz: 'FISH', ru: 'ФИО'},
  'profile.branch': {uz: 'Filial', ru: 'Филиал'},
  'profile.position': {uz: 'Lavozim', ru: 'Должность'},
  'profile.results': {uz: 'So‘nggi test natijalari', ru: 'Мои последние результаты'},
  'profile.newTest': {uz: 'Yangi test', ru: 'Новый тест'},
  'profile.scoreDetails': {uz: 'Ball tafsilotlari', ru: 'Детали балла'},
  'card.totalAnswers': {uz: "Umumiy to'liq javoblar", ru: 'Всего верных ответов'},
};

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: keyof typeof dictionary) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: FC<{ children: ReactNode; }> = ({children}) => {
  const [lang, setLangState] = useState<LanguageCode>('uz');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as LanguageCode | null;
    if (stored === 'uz' || stored === 'ru') setLangState(stored);
  }, []);

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key) => dictionary[key][lang],
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


