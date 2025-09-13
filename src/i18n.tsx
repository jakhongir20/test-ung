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
  'profile.results': {uz: 'So\'nggi test natijalari', ru: 'Мои последние результаты'},
  'profile.newTest': {uz: 'Yangi test', ru: 'Новый тест'},
  'profile.scoreDetails': {uz: 'Ball tafsilotlari', ru: 'Детали балла'},
  'card.totalAnswers': {uz: "Umumiy to'liq javoblar", ru: 'Всего верных ответов'},
  'test.finishTest': {uz: "Testni yakunlash", ru: 'Завершить тест'},

  // Loading and Error States
  'loading.profile': {uz: 'Profil yuklanmoqda', ru: 'Загрузка профиля'},
  'loading.profileDesc': {
    uz: 'Test tarixingiz yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем вашу историю тестов...'
  },
  'loading.test': {uz: 'Test yuklanmoqda', ru: 'Загрузка теста'},
  'loading.testDesc': {
    uz: 'Testingiz yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем ваш тест...'
  },
  'loading.employees': {uz: 'Xodimlar yuklanmoqda', ru: 'Загрузка сотрудников'},
  'loading.employeesDesc': {
    uz: 'Xodimlar ma\'lumotlari yuklanayotganini kuting...',
    ru: 'Пожалуйста, подождите, пока мы загружаем данные сотрудников...'
  },

  'error.connection': {uz: 'Ulanish xatosi', ru: 'Ошибка соединения'},
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
  'retry': {uz: 'Qayta urinish', ru: 'Повторить'},

  // Empty States
  'empty.noTestHistory': {uz: 'Hali test tarixi yo\'q', ru: 'Истории тестов пока нет'},
  'empty.noTestHistoryDesc': {
    uz: 'Natijalaringizni ko\'rish uchun birinchi testni boshlang.',
    ru: 'Начните свой первый тест, чтобы увидеть результаты здесь.'
  },
  'empty.startFirstTest': {uz: 'Birinchi testni boshlash', ru: 'Начать первый тест'},

  // OTP Form
  'otp.confirm': {uz: 'Tasdiqlash', ru: 'Подтвердить'},
  'otp.codeNotReceived': {uz: 'Kod kelmadi?', ru: 'Код не пришел?'},
  'otp.resend': {uz: 'Qayta yuborish', ru: 'Отправить заново'},
  'otp.back': {uz: 'Orqaga', ru: 'Назад'},
  'otp.enterAllDigits': {uz: 'Barcha 6 raqamni kiriting', ru: 'Введите все 6 цифр кода'},
  'otp.onlyDigits': {uz: 'Kod faqat raqamlardan iborat bo\'lishi kerak', ru: 'Код должен содержать только цифры'},
  'otp.codeRequired': {uz: 'Kod majburiy', ru: 'Код обязателен'},
  'otp.onlyNumbers': {uz: 'Faqat raqamlar', ru: 'Только цифры'},
  'otp.invalidCode': {uz: 'Noto\'g\'ri tasdiqlash kodi', ru: 'Неверный код подтверждения'},
  'otp.codeError': {uz: 'Kod bilan xatolik', ru: 'Ошибка с кодом'},
  'otp.loginError': {uz: 'Kirishda xatolik yuz berdi', ru: 'Произошла ошибка при входе'},

  // Test Page
  'test.loadingQuestion': {uz: 'Savol yuklanmoqda...', ru: 'Загрузка вопроса...'},
  'test.questionOf': {uz: 'Savol {current} dan {total}', ru: 'Вопрос {current} из {total}'},
  'test.next': {uz: 'Keyingi', ru: 'След.'},
  'test.start': {uz: 'Testni boshlash', ru: 'Запуск теста'},
  'test.finish': {uz: 'Yakunlash', ru: 'Завершить'},
  'test.previous': {uz: 'Oldingi', ru: 'Предыдущий'},
  'test.answered': {uz: 'Javob berilgan', ru: 'Отвечено'},
  'test.notAnswered': {uz: 'Javob berilmagan', ru: 'Не отвечено'},
  'test.current': {uz: 'Joriy', ru: 'Текущий'},

  // Admin Employees Page
  'admin.employees': {uz: 'Barcha xodimlar', ru: 'Все сотрудники'},
  'admin.searchPlaceholder': {uz: 'Ism yoki telefon bo\'yicha qidirish...', ru: 'Поиск по имени или телефону...'},
  'admin.allBranches': {uz: 'Barcha filiallar', ru: 'Все филиалы'},
  'admin.allPositions': {uz: 'Barcha lavozimlar', ru: 'Все должности'},
  'admin.allStatuses': {uz: 'Barcha holatlar', ru: 'Все статусы'},
  'admin.previous': {uz: 'Oldingi', ru: 'Предыдущий'},
  'admin.next': {uz: 'Keyingi', ru: 'Следующий'},
  'admin.showingResults': {
    uz: '{start}-{end} natija {total} dan ko\'rsatilmoqda',
    ru: 'Показано {start}-{end} из {total} результатов'
  },
  'admin.aboutEmployee': {uz: 'Xodim haqida', ru: 'О сотруднике'},
  'admin.noEmployees': {uz: 'Xodimlar topilmadi', ru: 'Сотрудники не найдены'},
  'admin.errorLoadingDetails': {uz: 'Xodim tafsilotlarini yuklashda xatolik', ru: 'Ошибка загрузки деталей сотрудника'},
  'admin.noDetailsAvailable': {uz: 'Xodim tafsilotlari mavjud emas', ru: 'Детали сотрудника недоступны'},
  'admin.totalAttempts': {uz: 'Jami urinishlar', ru: 'Всего попыток'},
  'admin.bestScore': {uz: 'Eng yaxshi ball', ru: 'Лучший балл'},
  'admin.completedTests': {uz: 'O\'tilgan testlar', ru: 'Пройдено тестов'},
  'admin.averageScore': {uz: 'O\'rtacha ball', ru: 'Средний балл'},
  'admin.testHistory': {uz: 'Test tarixi', ru: 'История тестов'},
  'admin.score': {uz: 'Ball', ru: 'Балл'},
  'admin.of': {uz: 'dan', ru: 'из'},
  'admin.passed': {uz: 'O\'tdi', ru: 'Прошел'},
  'admin.failed': {uz: 'O\'tmadi', ru: 'Не прошел'},
  'admin.unknown': {uz: 'Noma\'lum', ru: 'Неизвестно'},
  'admin.na': {uz: 'N/A', ru: 'Н/Д'},
  'na': {uz: 'N/A', ru: 'Н/Д'},
  'admin.totalStatistics': {uz: 'Umumiy statistika', ru: 'Общая статистика'},

  // Table Headers
  'table.name': {uz: 'F.I.Sh.', ru: 'Ф.И.О.'},
  'table.branch': {uz: 'Filial', ru: 'Филиал'},
  'table.position': {uz: 'Lavozim', ru: 'Должность'},
  'table.lastScore': {uz: 'Oxirgi ball', ru: 'Последний балл'},
  'table.attempts': {uz: 'Urinishlar soni', ru: 'Количество попыток'},
  'table.status': {uz: 'Holat', ru: 'Статус'},
  'table.phone': {uz: 'Telefon', ru: 'Телефон'},
  'table.dateJoined': {uz: 'Ro\'yxatdan o\'tgan sana', ru: 'Дата регистрации'},
  'table.lastLogin': {uz: 'Oxirgi kirish', ru: 'Последний вход'},

  // Test Rules Page
  'rules.title': {uz: 'Test qoidalari', ru: 'Правила теста'},
  'rules.timing': {uz: 'Vaqt', ru: 'Время'},
  'rules.timingDesc': {
    uz: 'Mashq testlari vaqt bilan cheklangan, lekin siz ularni pauza qilishingiz mumkin. Boshqa qurilmada davom ettirish uchun qaytadan boshlashingiz kerak. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    ru: 'Практические тесты ограничены по времени, но вы можете их приостанавливать. Чтобы продолжить на другом устройстве, вам нужно начать заново. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.scores': {uz: 'Balllar', ru: 'Баллы'},
  'rules.scoresDesc': {
    uz: 'Mashq testini tugatganda, ballaringizni ko\'rish va shaxsiylashtirilgan o\'quv maslahatlarini olish uchun "Mening mashqlarim"ga o\'ting. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    ru: 'Когда вы завершите практический тест, перейдите в "Мои практики", чтобы увидеть свои баллы и получить персонализированные советы по обучению. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.assistiveTech': {uz: 'Yordamchi texnologiya (YT)', ru: 'Вспомогательные технологии (ВТ)'},
  'rules.assistiveTechDesc': {
    uz: 'Test uchun foydalanadigan har qanday YT bilan mashq qilishni unutmang. Agar siz bu yerda YT sozlamalarini sozlasangiz, test kunida bu qadamni takrorlashingiz kerak bo\'lishi mumkin.',
    ru: 'Обязательно практикуйтесь с любыми ВТ, которые вы используете для тестирования. Если вы настроите параметры ВТ здесь, вам может потребоваться повторить этот шаг в день теста.'
  },
  'rules.noDeviceLock': {uz: 'Qurilma qulfi yo\'q', ru: 'Блокировка устройства отсутствует'},
  'rules.noDeviceLockDesc': {
    uz: 'Biz mashq paytida qurilmangizni qulflamaymiz. Test kunida siz boshqa dasturlar yoki ilovalardan foydalanishdan cheklanadi.',
    ru: 'Мы не блокируем ваше устройство во время практики. В день теста вам будет запрещено использовать другие программы или приложения.'
  },
  'rules.previous': {uz: 'Oldingi', ru: 'Предыдущий'},
  'rules.next': {uz: 'Keyingi', ru: 'Следующий'},

  // Header Dropdown
  'header.myProfile': {uz: 'Mening profilim', ru: 'Мой профиль'},
  'header.adminEmployees': {uz: 'Xodimlar boshqaruvi', ru: 'Управление сотрудниками'},

  // Profile Form
  'profile.save': {uz: 'Saqlash', ru: 'Сохранить'},
  'profile.saveSuccess': {uz: 'Ma\'lumotlar muvaffaqiyatli saqlandi', ru: 'Данные успешно сохранены'},
  'profile.saveError': {uz: 'Ma\'lumotlarni saqlashda xatolik', ru: 'Ошибка при сохранении данных'},

  // Session Details Page
  'session.scoreDetails': {uz: 'BAHOLASH TAFSILOTLARI', ru: 'ДЕТАЛИ ОЦЕНКИ'},
  'session.scoreDetailsDesc': {
    uz: 'Amaliy test natijalaringizni ko\'rib chiqing, ishlash darajangizni chuqurroq o\'rganing va test kunidan oldin kuchli tomonlaringizni biling.',
    ru: 'Просмотрите результаты практического теста, углубитесь в свою производительность и изучите свои сильные стороны перед днем теста.'
  },
  'session.testNumber': {uz: 'Test #{number}', ru: 'Тест #{number}'},
  'session.testDesc': {
    uz: 'Bu yerda siz test natijalaringizni bilib olishingiz mumkin.',
    ru: 'Здесь вы можете узнать результаты вашего теста.'
  },
  'session.totalQuestions': {uz: 'Jami savollar', ru: 'Всего вопросов'},
  'session.correctAnswers': {uz: 'To\'g\'ri javoblar', ru: 'Правильные ответы'},
  'session.incorrectAnswers': {uz: 'Noto\'g\'ri javoblar', ru: 'Неправильные ответы'},
  'session.questions': {uz: 'SAVOLLAR', ru: 'ВОПРОСЫ'},
  'session.questionTitle': {uz: 'SAVOL MATNI', ru: 'ТЕКСТ ВОПРОСА'},
  'session.correctAnswer': {uz: 'TO\'G\'RI JAVOB', ru: 'ПРАВИЛЬНЫЙ ОТВЕТ'},
  'session.yourAnswer': {uz: 'SIZNING JAVOBINGIZ', ru: 'ВАШ ОТВЕТ'},
  'session.correct': {uz: 'To\'g\'ri', ru: 'Правильно'},
  'session.incorrect': {uz: 'Noto\'g\'ri', ru: 'Неправильно'},
  'session.viewDetails': {uz: 'Tafsilotlarni ko\'rish', ru: 'Просмотр деталей'},
  'session.pageNumber': {uz: 'Sahifa raqami', ru: 'Номер страницы'},
  'session.previous': {uz: 'Avvalgi', ru: 'Предыдущий'},
  'session.next': {uz: 'Keyingi', ru: 'Следующий'},
  'session.results': {uz: 'Natijalar: {showing} ta {total} tadan', ru: 'Результаты: {showing} из {total}'},

  // Loading states for session details
  'loading.sessionDetails': {uz: 'Session tafsilotlari yuklanmoqda', ru: 'Загрузка деталей сессии'},
  'loading.sessionDetailsDesc': {
    uz: 'Session ma\'lumotlari yuklanmoqda, iltimos kuting...',
    ru: 'Загружаются данные сессии, пожалуйста подождите...'
  },
  'session.noQuestions': {uz: 'Savollar topilmadi', ru: 'Вопросы не найдены'},

  // Status translations
  'status.completed': {uz: 'Tugallangan', ru: 'Завершено'},
  'status.passed': {uz: 'O\'tilgan', ru: 'Пройдено'},
  'status.never_started': {uz: 'Boshlanmagan', ru: 'Не начато'},
  'status.active': {uz: 'Faol', ru: 'Активный'},
  'status.started': {uz: 'Boshlangan', ru: 'Начато'},
  'status.in_progress': {uz: 'Jarayonda', ru: 'В процессе'},
  'status.failed': {uz: 'Muvaffaqiyatsiz', ru: 'Неудачно'},
  'status.expired': {uz: 'Muddati tugagan', ru: 'Истек срок'},
  'status.cancelled': {uz: 'Bekor qilingan', ru: 'Отменено'},
  'status.refunded': {uz: 'Qaytarilgan', ru: 'Возвращено'},
  'status.correct': {uz: 'To\'g\'ri', ru: 'Правильно'},
  'status.incorrect': {uz: 'Noto\'g\'ri', ru: 'Неправильно'},
  'status.unknown': {uz: 'Noma\'lum', ru: 'Неизвестно'},

  // Common UI elements
  'close': {uz: 'Yopish', ru: 'Закрыть'},
  'cancel': {uz: 'Bekor qilish', ru: 'Отменить'},
  'save': {uz: 'Saqlash', ru: 'Сохранить'},
  'edit': {uz: 'Tahrirlash', ru: 'Редактировать'},
  'delete': {uz: 'O\'chirish', ru: 'Удалить'},
  'confirm': {uz: 'Tasdiqlash', ru: 'Подтвердить'},
  'yes': {uz: 'Ha', ru: 'Да'},
  'no': {uz: 'Yo\'q', ru: 'Нет'},
  'ok': {uz: 'OK', ru: 'ОК'},
  'loading': {uz: 'Yuklanmoqda...', ru: 'Загрузка...'},
  'error': {uz: 'Xatolik', ru: 'Ошибка'},
  'success': {uz: 'Muvaffaqiyatli', ru: 'Успешно'},
  'warning': {uz: 'Ogohlantirish', ru: 'Предупреждение'},
  'info': {uz: 'Ma\'lumot', ru: 'Информация'},

  // Categories Page
  'categories.title': {uz: 'Kategoriyalar', ru: 'Категории'},
  'categories.iqQuestions': {uz: 'IQ savollari', ru: 'IQ вопросы'},
  'categories.iqQuestionsDesc': {
    uz: 'Amaliy testlar vaqt bilan cheklangan, lekin siz ularni pauza qilishingiz mumkin. Boshqa qurilmada davom ettirish uchun qaytadan boshlashingiz kerak. Biz to\'liq bo\'lmagan amaliy testlarni 90 kundan keyin o\'chiramiz.',
    ru: 'Практические тесты ограничены по времени, но вы можете их приостанавливать. Чтобы продолжить на другом устройстве, вам нужно начать заново. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'categories.mainQuestions': {uz: 'Asosiy savollar', ru: 'Основные вопросы'},
  'categories.mainQuestionsDesc': {
    uz: 'Amaliy testni tugatganda, ballaringizni ko\'rish va shaxsiylashtirilgan o\'quv maslahatlarini olish uchun "Mening amaliyotlarim"ga o\'ting. Biz to\'liq bo\'lmagan amaliy testlarni 90 kundan keyin o\'chiramiz.',
    ru: 'Когда вы завершите практический тест, перейдите в "Мои практики", чтобы увидеть свои баллы и получить персонализированные советы по обучению. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'categories.additionalQuestions': {uz: 'Qo\'shimcha savollar', ru: 'Дополнительные вопросы'},
  'categories.additionalQuestionsDesc': {
    uz: 'Test uchun foydalanadigan har qanday YT bilan mashq qilishni unutmang. Agar siz bu yerda YT sozlamalarini sozlasangiz, test kunida bu qadamni takrorlashingiz kerak bo\'lishi mumkin.',
    ru: 'Обязательно практикуйтесь с любыми ВТ, которые вы используете для тестирования. Если вы настроите параметры ВТ здесь, вам может потребоваться повторить этот шаг в день теста.'
  },
  'categories.regionalGasSupply': {
    uz: 'Hududiy Gaz Ta\'minotiga aloqadar',
    ru: 'Связано с региональным газоснабжением'
  },
  'categories.regionalGasSupplyDesc': {
    uz: 'Biz mashq paytida qurilmangizni qulflamaymiz. Test kunida siz boshqa dasturlar yoki ilovalardan foydalanishdan cheklanadi.',
    ru: 'Мы не блокируем ваше устройство во время практики. В день теста вам будет запрещено использовать другие программы или приложения.'
  },

  // User Profile Completion
  'profileCompletion.title': {uz: 'Profilni to\'ldiring', ru: 'Заполните профиль'},
  'profileCompletion.subtitle': {
    uz: 'Iltimos, o\'z ma\'lumotlaringizni kiriting',
    ru: 'Пожалуйста, введите свои данные'
  },
  'profileCompletion.name': {uz: 'To\'liq ism', ru: 'Полное имя'},
  'profileCompletion.namePlaceholder': {uz: 'Ismingizni kiriting', ru: 'Введите ваше имя'},
  'profileCompletion.branch': {uz: 'Filial', ru: 'Филиал'},
  'profileCompletion.branchPlaceholder': {uz: 'Filial nomini kiriting', ru: 'Введите название филиала'},
  'profileCompletion.position': {uz: 'Lavozim', ru: 'Должность'},
  'profileCompletion.positionPlaceholder': {uz: 'Lavozimingizni kiriting', ru: 'Введите вашу должность'},
  'profileCompletion.save': {uz: 'Saqlash', ru: 'Сохранить'},
  'profileCompletion.nameRequired': {uz: 'Ism kiritilishi shart', ru: 'Имя обязательно'},
  'profileCompletion.branchRequired': {uz: 'Filial kiritilishi shart', ru: 'Филиал обязателен'},
  'profileCompletion.positionRequired': {uz: 'Lavozim kiritilishi shart', ru: 'Должность обязательна'},
  'profileCompletion.saveSuccess': {uz: 'Profil muvaffaqiyatli saqlandi', ru: 'Профиль успешно сохранен'},
  'profileCompletion.saveError': {uz: 'Profilni saqlashda xatolik', ru: 'Ошибка при сохранении профиля'},

  // Logout
  'logout': {uz: 'Chiqish', ru: 'Выйти'},

  // Auth Pages
  'auth.login': {uz: 'Kirish', ru: 'Войти'},
  'auth.phoneNumber': {uz: 'Telefon raqami', ru: 'Номер телефона'},
  'auth.getCode': {uz: 'Kod olish', ru: 'Получить код'},
  'auth.fieldRequired': {uz: 'Maydon majburiy', ru: 'Поле обязательно'},
  'auth.invalidPhone': {uz: 'Noto\'g\'ri raqam', ru: 'Неверный номер'},
  'auth.phonePlaceholder': {uz: '+998', ru: '+998'},
  'auth.confirmLogin': {uz: 'Kirishni tasdiqlash', ru: 'Подтверждение входа'},

  // Additional Information Form
  'additionalInfo.title': {uz: 'Qo\'shimcha ma\'lumot', ru: 'Дополнительная информация'},
  'additionalInfo.name': {uz: 'Ism', ru: 'Имя'},
  'additionalInfo.position': {uz: 'Lavozim', ru: 'Должность'},
  'additionalInfo.gasType': {uz: 'Gaz turi', ru: 'Gaz turi'},
  'additionalInfo.region': {uz: 'Qaysi viloyat', ru: 'Какой регион'},
  'additionalInfo.namePlaceholder': {uz: 'Mardon', ru: 'Mardon'},
  'additionalInfo.positionPlaceholder': {uz: 'Lavozim', ru: 'Должность'},
  'additionalInfo.naturalGas': {uz: 'Tabiiy gaz', ru: 'Tabiy gaz'},
  'additionalInfo.tashkent': {uz: 'Toshkent', ru: 'Ташкент'},
  'additionalInfo.enter': {uz: 'Kirish', ru: 'Войти'},
  'additionalInfo.nameRequired': {uz: 'Ism kiritilishi shart', ru: 'Имя обязательно'},
  'additionalInfo.positionRequired': {uz: 'Lavozim tanlanishi shart', ru: 'Должность обязательна'},
  'additionalInfo.gasTypeRequired': {uz: 'Gaz turi tanlanishi shart', ru: 'Тип газа обязателен'},
  'additionalInfo.regionRequired': {uz: 'Viloyat tanlanishi shart', ru: 'Регион обязателен'},

  // Settings Modal
  'settings.title': {uz: 'Sozlamalar', ru: 'Настройки'},
  'settings.fullName': {uz: 'To\'liq ism', ru: 'ФИО'},
  'settings.branch': {uz: 'Filial', ru: 'Филиал'},
  'settings.position': {uz: 'Lavozim', ru: 'Должность'},
  'settings.fullNamePlaceholder': {uz: 'To\'liq ism', ru: 'ФИО'},
  'settings.branchPlaceholder': {uz: 'Filial', ru: 'Филиал'},
  'settings.positionPlaceholder': {uz: 'Lavozim', ru: 'Должность'},
  'settings.save': {uz: 'Saqlash', ru: 'Сохранить'},
  'settings.logout': {uz: 'Hisobdan chiqish', ru: 'Выйти из аккаунта'},
  'settings.fullNameRequired': {uz: 'To\'liq ism kiritilishi shart', ru: 'ФИО обязательно'},
  'settings.branchRequired': {uz: 'Filial tanlanishi shart', ru: 'Филиал обязателен'},
  'settings.positionRequired': {uz: 'Lavozim tanlanishi shart', ru: 'Должность обязательна'},
  'settings.saveSuccess': {uz: 'Ma\'lumotlar muvaffaqiyatli saqlandi', ru: 'Данные успешно сохранены'},
  'settings.saveError': {uz: 'Ma\'lumotlarni saqlashda xatolik', ru: 'Ошибка при сохранении данных'},

  // Timer
  'timer.minutes': {uz: 'daq', ru: 'мин'},
  'timer.noTime': {uz: '--:--', ru: '--:--'},
  'timer.expired': {uz: '00:00', ru: '00:00'},

  // Question Card
  'question.number': {uz: 'Savol', ru: 'Вопрос'},
  'question.typeAnswer': {uz: 'Javobingizni yozing...', ru: 'Введите ваш ответ...'},

  // Job Positions
  'position.manager': {uz: 'Menejer', ru: 'Менеджер'},
  'position.engineer': {uz: 'Muhandis', ru: 'Инженер'},
  'position.technician': {uz: 'Texnik', ru: 'Техник'},
  'position.supervisor': {uz: 'Nazoratchi', ru: 'Супервайзер'},
  'position.operator': {uz: 'Operator', ru: 'Оператор'},
  'position.specialist': {uz: 'Mutaxassis', ru: 'Специалист'},
  'position.analyst': {uz: 'Tahlilchi', ru: 'Аналитик'},

  // Regions
  'region.tashkent': {uz: 'Toshkent', ru: 'Ташкент'},
  'region.samarkand': {uz: 'Samarqand', ru: 'Самарканд'},
  'region.bukhara': {uz: 'Buxoro', ru: 'Бухара'},
  'region.namangan': {uz: 'Namangan', ru: 'Наманган'},
  'region.andijan': {uz: 'Andijon', ru: 'Андижан'},
  'region.fergana': {uz: 'Farg\'ona', ru: 'Фергана'},
  'region.kashkadarya': {uz: 'Qashqadaryo', ru: 'Кашкадарья'},
  'region.surkhandarya': {uz: 'Surxondaryo', ru: 'Сурхандарья'},
  'region.khorezm': {uz: 'Xorazm', ru: 'Хорезм'},
  'region.karakalpakstan': {uz: 'Qoraqalpog\'iston', ru: 'Каракалпакстан'},
  'region.jizzakh': {uz: 'Jizzax', ru: 'Джизак'},
  'region.sirdarya': {uz: 'Sirdaryo', ru: 'Сырдарья'},
  'region.tashkentRegion': {uz: 'Toshkent viloyati', ru: 'Ташкентская область'},

  // Progress Bar
  'progress.iqQuestions': {uz: 'IQ savollari', ru: 'IQ вопросы'},
  'progress.mainQuestions': {uz: 'Asosiy savollar', ru: 'Основные вопросы'},
  'progress.additionalQuestions': {uz: 'Qo\'shimcha savollar', ru: 'Дополнительные вопросы'},
  'progress.regionalGasSupply': {uz: 'Hududiy Gaz Ta\'minotiga aloqadar', ru: 'Связано с региональным газоснабжением'},
};

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: keyof typeof dictionary, params?: Record<string, string | number>) => string;
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
    t: (key, params) => {
      let text = dictionary?.[key]?.[lang];
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


