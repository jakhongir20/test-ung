import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useI18n } from "../i18n.tsx";

const languages = [
  {
    id: "uz",
    name: "O'zbek",
    flag: "/flag_uz.svg", // можно заменить своим svg
  },
  {
    id: "uz-cyrl",
    name: "Ўзбек",
    flag: "/flag_uz.svg", // можно заменить своим svg
  },
  {
    id: "ru",
    name: "Русский",
    flag: "https://flagcdn.com/w20/ru.png",
  },
];

export const LanguageSelect = ({ authlayout }: { authlayout?: boolean; }) => {
  const { lang, setLang } = useI18n();
  const [selectedId, setSelectedId] = useState<'uz' | 'uz-cyrl' | 'ru'>(() => (lang as 'uz' | 'uz-cyrl' | 'ru'));

  // Keep internal selectedId in sync with context lang
  useEffect(() => {
    if (lang !== selectedId) {
      setSelectedId(lang as 'uz' | 'uz-cyrl' | 'ru');
    }
  }, [lang, selectedId]);

  // Handle language change when user selects a new option
  const handleLanguageChange = (newLanguageId: 'uz' | 'uz-cyrl' | 'ru') => {
    if (newLanguageId !== selectedId) {
      setSelectedId(newLanguageId);
      setLang(newLanguageId);
    }
  };

  const selected = languages.find(l => l.id === selectedId) || languages[0];

  return (
    <Listbox value={selectedId} onChange={handleLanguageChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button
            className="flex cursor-pointer text-[#314158] md:gap-2 gap-1 items-center justify-between rounded-lg px-1.5 md:px-3 py-2 text-base font-medium hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <img src={selected.flag} alt="" className="h-4 w-6 rounded-sm" />
              <span className={`${authlayout ? '' : 'hidden'}  md:inline`}>{selected.name}</span>
            </div>
            <ChevronDownIcon
              className={`h-6 w-6 transition-transform duration-200 text-gray-500 ${open ? 'rotate-180' : ''}`} />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute z-10 min-w-[110px] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm md:text-base shadow-lg">
              {languages.map((lang) => (
                <Listbox.Option
                  key={lang.id}
                  value={lang.id as 'uz' | 'uz-cyrl' | 'ru'}
                  className={({ active }) => {
                    return `relative cursor-pointer select-none px-3 py-2 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                      }`;
                  }
                  }
                >
                  <div className="flex items-center gap-2">
                    <img src={lang.flag} alt="" className="h-4 w-6 rounded-sm" />
                    <span>{lang.name}</span>
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};
