import { createContext, type FC, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'uz' | 'ru';

type Dictionary = Record<string, Record<LanguageCode, string>>;

const dictionary: Dictionary = {
  'language.uz': { uz: "O'zbek", ru: "Узбекский" },
  'language.ru': { uz: 'Rus', ru: 'Русский' },
  'role.worker': { uz: 'Ishchi', ru: 'Работник' },
  'header.profile': { uz: 'Profil', ru: 'Профиль' },
  'header.test': { uz: 'Test', ru: 'Тест' },
  'profile.title': { uz: 'Mening profilim', ru: 'Мой профиль' },
  'profile.subtitle': {
    uz: "Mashq test natijalaringizni ko'rib chiqing, sinov kunidan oldin kuchli tomonlaringizni bilib oling.",
    ru: 'Просмотрите результаты своего теста с упражнениями, чтобы узнать свои сильные стороны перед днем теста.'
  },
  'profile.myDetails': { uz: 'Mening maʼlumotlarim', ru: 'Мои данные' },
  'profile.fio': { uz: 'FISH', ru: 'ФИО' },
  'profile.branch': { uz: 'Filial', ru: 'Филиал' },
  'profile.position': { uz: 'Lavozim', ru: 'Должность' },
  'profile.results': { uz: 'So\'nggi test natijalari', ru: 'Мои последние результаты' },
  'profile.newTest': { uz: 'Yangi test', ru: 'Новый тест' },
  'profile.scoreDetails': { uz: 'Ball tafsilotlari', ru: 'Детали балла' },
  'card.totalAnswers': { uz: "Umumiy to'liq javoblar", ru: 'Всего верных ответов' },
  'test.finishTest': { uz: "Testni yakunlash", ru: 'Завершить тест' },

  // Loading and Error States
  'loading.profile': { uz: 'Profil yuklanmoqda', ru: 'Загрузка профиля' },
  'loading.profileDesc': {
    uz: 'Test tarixingiz yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем вашу историю тестов...'
  },
  'loading.test': { uz: 'Test yuklanmoqda', ru: 'Загрузка теста' },
  'loading.testDesc': {
    uz: 'Testingiz yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем ваш тест...'
  },
  'loading.employees': { uz: 'Xodimlar yuklanmoqda', ru: 'Загрузка сотрудников' },
  'loading.employeesDesc': {
    uz: 'Xodimlar ma\'lumotlari yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем данные сотрудников...'
  },

  'error.connection': { uz: 'Ulanish xatosi', ru: 'Ошибка соединения' },
  'error.connectionDesc': {
    uz: 'Ma\'lumotlarni yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    ru: 'Не удалось загрузить данные. Проверьте соединение и попробуйте снова.'
  },
  'error.testData': {
    uz: 'Test ma\'lumotlarini yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    ru: 'Не удалось загрузить данные теста. Проверьте соединение и попробуйте снова.'
  },
  'error.employeeData': {
    uz: 'Xodimlar ma\'lumotlarini yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    ru: 'Не удалось загрузить данные сотрудников. Проверьте соединение и попробуйте снова.'
  },
  'retry': { uz: 'Qayta urinish', ru: 'Повторить' },

  // Empty States
  'empty.noTestHistory': { uz: 'Hali test tarixi yo\'q', ru: 'Истории тестов пока нет' },
  'empty.noTestHistoryDesc': {
    uz: 'Natijalaringizni ko\'rish uchun birinchi testni boshlang.',
    ru: 'Начните свой первый тест, чтобы увидеть результаты здесь.'
  },
  'empty.startFirstTest': { uz: 'Birinchi testni boshlash', ru: 'Начать первый тест' },

  // OTP Form
  'otp.confirm': { uz: 'Tasdiqlash', ru: 'Подтвердить' },
  'otp.codeNotReceived': { uz: 'Kod kelmadi?', ru: 'Код не пришел?' },
  'otp.resend': { uz: 'Qayta yuborish', ru: 'Отправить заново' },
  'otp.back': { uz: 'Orqaga', ru: 'Назад' },
  'otp.enterAllDigits': { uz: 'Barcha 6 raqamni kiriting', ru: 'Введите все 6 цифр кода' },
  'otp.onlyDigits': { uz: 'Kod faqat raqamlardan iborat bo\'lishi kerak', ru: 'Код должен содержать только цифры' },
  'otp.codeRequired': { uz: 'Kod majburiy', ru: 'Код обязателен' },
  'otp.onlyNumbers': { uz: 'Faqat raqamlar', ru: 'Только цифры' },
  'otp.invalidCode': { uz: 'Noto\'g\'ri tasdiqlash kodi', ru: 'Неверный код подтверждения' },
  'otp.codeError': { uz: 'Kod bilan xatolik', ru: 'Ошибка с кодом' },
  'otp.loginError': { uz: 'Kirishda xatolik yuz berdi', ru: 'Произошла ошибка при входе' },

  // Test Page
  'test.loadingQuestion': { uz: 'Savol yuklanmoqda...', ru: 'Загрузка вопроса...' },
  'test.questionOf': { uz: 'Savol {current} dan {total}', ru: 'Вопрос {current} из {total}' },
  'test.next': { uz: 'Keyingi', ru: 'След.' },
  'test.start': { uz: 'Testni boshlash', ru: 'Запуск теста' },
  'test.finish': { uz: 'Yakunlash', ru: 'Завершить' },
  'test.previous': { uz: 'Oldingi', ru: 'Предыдущий' },
  'test.answered': { uz: 'Javob berilgan', ru: 'Отвечено' },
  'test.notAnswered': { uz: 'Javob berilmagan', ru: 'Не отвечено' },
  'test.current': { uz: 'Joriy', ru: 'Текущий' },

  // Admin Employees Page
  'admin.employees': { uz: 'Barcha xodimlar', ru: 'Все сотрудники' },
  'admin.searchPlaceholder': { uz: 'Ism yoki telefon bo\'yicha qidirish...', ru: 'Поиск по имени или телефону...' },
  'admin.allBranches': { uz: 'Barcha filiallar', ru: 'Все филиалы' },
  'admin.allPositions': { uz: 'Barcha lavozimlar', ru: 'Все должности' },
  'admin.allStatuses': { uz: 'Barcha holatlar', ru: 'Все статусы' },
  'admin.previous': { uz: 'Oldingi', ru: 'Предыдущий' },
  'admin.next': { uz: 'Keyingi', ru: 'Следующий' },
  'admin.showingResults': {
    uz: '{start}-{end} natija {total} dan ko\'rsatilmoqda',
    ru: 'Показано {start}-{end} из {total} результатов'
  },
  'admin.aboutEmployee': { uz: 'Xodim haqida', ru: 'О сотруднике' },
  'admin.errorLoadingDetails': { uz: 'Xodim tafsilotlarini yuklashda xatolik', ru: 'Ошибка загрузки деталей сотрудника' },
  'admin.noDetailsAvailable': { uz: 'Xodim tafsilotlari mavjud emas', ru: 'Детали сотрудника недоступны' },
  'admin.totalAttempts': { uz: 'Jami urinishlar', ru: 'Всего попыток' },
  'admin.bestScore': { uz: 'Eng yaxshi ball', ru: 'Лучший балл' },
  'admin.completedTests': { uz: 'O\'tilgan testlar', ru: 'Пройдено тестов' },
  'admin.averageScore': { uz: 'O\'rtacha ball', ru: 'Средний балл' },
  'admin.testHistory': { uz: 'Test tarixi', ru: 'История тестов' },
  'admin.score': { uz: 'Ball', ru: 'Балл' },
  'admin.of': { uz: 'dan', ru: 'из' },
  'admin.passed': { uz: 'O\'tdi', ru: 'Прошел' },
  'admin.failed': { uz: 'O\'tmadi', ru: 'Не прошел' },
  'admin.unknown': { uz: 'Noma\'lum', ru: 'Неизвестно' },
  'admin.na': { uz: 'N/A', ru: 'Н/Д' },
  'admin.totalStatistics': { uz: 'Umumiy statistika', ru: 'Общая статистика' },

  // Table Headers
  'table.name': { uz: 'F.I.Sh.', ru: 'Ф.И.О.' },
  'table.branch': { uz: 'Filial', ru: 'Филиал' },
  'table.position': { uz: 'Lavozim', ru: 'Должность' },
  'table.lastScore': { uz: 'Oxirgi ball', ru: 'Последний балл' },
  'table.attempts': { uz: 'Urinishlar soni', ru: 'Количество попыток' },
  'table.status': { uz: 'Holat', ru: 'Статус' },
  'table.phone': { uz: 'Telefon', ru: 'Телефон' },
  'table.dateJoined': { uz: 'Ro\'yxatdan o\'tgan sana', ru: 'Дата регистрации' },
  'table.lastLogin': { uz: 'Oxirgi kirish', ru: 'Последний вход' },

  // Test Rules Page
  'rules.title': { uz: 'Test qoidalari', ru: 'Правила теста' },
  'rules.timing': { uz: 'Vaqt', ru: 'Время' },
  'rules.timingDesc': {
    uz: 'Mashq testlari vaqt bilan cheklangan, lekin siz ularni pauza qilishingiz mumkin. Boshqa qurilmada davom ettirish uchun qaytadan boshlashingiz kerak. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    ru: 'Практические тесты ограничены по времени, но вы можете их приостанавливать. Чтобы продолжить на другом устройстве, вам нужно начать заново. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.scores': { uz: 'Balllar', ru: 'Баллы' },
  'rules.scoresDesc': {
    uz: 'Mashq testini tugatganda, ballaringizni ko\'rish va shaxsiylashtirilgan o\'quv maslahatlarini olish uchun "Mening mashqlarim"ga o\'ting. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    ru: 'Когда вы завершите практический тест, перейдите в "Мои практики", чтобы увидеть свои баллы и получить персонализированные советы по обучению. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.assistiveTech': { uz: 'Yordamchi texnologiya (YT)', ru: 'Вспомогательные технологии (ВТ)' },
  'rules.assistiveTechDesc': {
    uz: 'Test uchun foydalanadigan har qanday YT bilan mashq qilishni unutmang. Agar siz bu yerda YT sozlamalarini sozlasangiz, test kunida bu qadamni takrorlashingiz kerak bo\'lishi mumkin.',
    ru: 'Обязательно практикуйтесь с любыми ВТ, которые вы используете для тестирования. Если вы настроите параметры ВТ здесь, вам может потребоваться повторить этот шаг в день теста.'
  },
  'rules.noDeviceLock': { uz: 'Qurilma qulfi yo\'q', ru: 'Блокировка устройства отсутствует' },
  'rules.noDeviceLockDesc': {
    uz: 'Biz mashq paytida qurilmangizni qulflamaymiz. Test kunida siz boshqa dasturlar yoki ilovalardan foydalanishdan cheklanadi.',
    ru: 'Мы не блокируем ваше устройство во время практики. В день теста вам будет запрещено использовать другие программы или приложения.'
  },
  'rules.previous': { uz: 'Oldingi', ru: 'Предыдущий' },
  'rules.next': { uz: 'Keyingi', ru: 'Следующий' },

  // Header Dropdown
  'header.myProfile': { uz: 'Mening profilim', ru: 'Мой профиль' },
  'header.adminEmployees': { uz: 'Xodimlar boshqaruvi', ru: 'Управление сотрудниками' },
};

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: keyof typeof dictionary, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: FC<{ children: ReactNode; }> = ({ children }) => {
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
    t: (key, params) => {
      let text = dictionary[key][lang];
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      return text;
    },
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


