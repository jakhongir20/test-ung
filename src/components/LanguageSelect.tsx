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

export const LanguageSelect = () => {
  const { lang, setLang } = useI18n();
  const [selected, setSelected] = useState(() => {
    return languages.find(l => l.id === lang) || languages[0];
  });

  // Update selected when lang changes externally (but not when we're setting it)
  useEffect(() => {
    const currentLang = languages.find(l => l.id === lang);
    if (currentLang && currentLang.id !== selected.id) {
      setSelected(currentLang);
    }
  }, [lang]); // Remove selected.id from dependencies to prevent infinite loop

  // Handle language change when user selects a new option
  const handleLanguageChange = (newLanguage: typeof languages[0]) => {
    setSelected(newLanguage);
    setLang(newLanguage.id as 'uz' | 'uz-cyrl' | 'ru');
  };

  return (
    <Listbox value={selected} onChange={handleLanguageChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button
            className="flex cursor-pointer w-full text-[#314158] md:gap-2 gap-1 items-center justify-between rounded-lg px-1.5 md:px-3 py-2 text-sm font-medium hover:bg-gray-50">
            <div className="flex items-center gap-2 text-sm">
              <img src={selected.flag} alt="" className="h-4 w-6 rounded-sm" />
              <span>{selected.name}</span>
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
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg">
              {languages.map((lang) => (
                <Listbox.Option
                  key={lang.id}
                  value={lang}
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
