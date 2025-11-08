/* eslint-disable react-refresh/only-export-components */
import { createContext, type FC, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'uz' | 'uz-cyrl' | 'ru';

type DictionaryEntry = Record<LanguageCode, string> & {
  [extra: string]: string;
};

type Dictionary = Record<string, DictionaryEntry>;

const dictionary: Dictionary = {
  'language.uz': { uz: "O'zbek", 'uz-cyrl': "Ўзбек", ru: "Узбекский" },
  'language.uz-cyrl': { uz: "Ўзбек", 'uz-cyrl': "Ўзбек", ru: "Узбекский" },
  'language.ru': { uz: 'Rus', 'uz-cyrl': 'Рус', ru: 'Русский' },
  'role.worker': { uz: 'Ishchi', 'uz-cyrl': 'Ишчи', ru: 'Работник' },
  'header.profile': { uz: 'Profil', 'uz-cyrl': 'Профил', ru: 'Профиль' },
  'header.test': { uz: 'Test', 'uz-cyrl': 'Тест', ru: 'Тест' },
  'profile.title': { uz: 'Mening profilim', 'uz-cyrl': 'Менинг профилим', ru: 'Мой профиль' },
  'profile.subtitle': {
    uz: "Mashq test natijalaringizni ko'rib chiqing, sinov kunidan oldin kuchli tomonlaringizni bilib oling.",
    'uz-cyrl': "Машқ тест натижаларингизни кўриб чиқинг, синов кунидан олдин кучли томонларингизни билиб олинг.",
    ru: 'Просмотрите результаты своего теста с упражнениями, чтобы узнать свои сильные стороны перед днем теста.'
  },
  'profile.myDetails': { uz: 'Mening maʼlumotlarim', 'uz-cyrl': 'Менинг маълумотларим', ru: 'Мои данные' },
  'profile.fio': { uz: 'FISH', 'uz-cyrl': 'ФИШ', ru: 'ФИО' },
  'profile.branch': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'profile.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'profile.results': {
    uz: 'So\'nggi test natijalari',
    'uz-cyrl': 'Сўнгги тест натижалари',
    ru: 'Мои последние результаты'
  },
  'profile.newTest': { uz: 'Yangi test', 'uz-cyrl': 'Янги тест', ru: 'Новый тест' },
  'profile.scoreDetails': { uz: 'Ball tafsilotlari', 'uz-cyrl': 'Балл тафсилотлари', ru: 'Детали балла' },

  // Face Verification
  'faceVerification.title': { uz: 'Yuz tekshiruvi', 'uz-cyrl': 'Юз текшириви', ru: 'Проверка лица' },
  'faceVerification.loading': { uz: 'Yuz aniqlash modellari yuklanmoqda...', 'uz-cyrl': 'Юз аниқлаш моделлари юкланмоқда...', ru: 'Загрузка моделей распознавания лиц...' },
  'faceVerification.instructions': {
    uz: 'Iltimos, yuzingizni kameraga qarating. Tizim testni boshlashdan oldin sizning shaxsingizni tekshiradi.',
    'uz-cyrl': 'Илтимос, юзингизни камерага қаратинг. Тизим тестни бошлашдан олдин сизнинг шахсингизни текширади.',
    ru: 'Пожалуйста, поверните лицо к камере. Система проверит вашу личность перед началом теста.'
  },
  'faceVerification.detecting': { uz: 'Yuz aniqlanmoqda...', 'uz-cyrl': 'Юз аниқланмоқда...', ru: 'Обнаружение лица...' },
  'faceVerification.faceDetected': { uz: 'Yuz aniqlandi! Iltimos, harakatsiz turing...', 'uz-cyrl': 'Юз аниқланди! Илтимос, ҳаракатсиз туринг...', ru: 'Лицо обнаружено! Пожалуйста, не двигайтесь...' },
  'faceVerification.lookCenter': {
    uz: 'Iltimos, yuzingizni markazga qarating.',
    'uz-cyrl': 'Илтимос, юзингизни марказга қаратинг.',
    ru: 'Пожалуйста, смотрите прямо.'
  },
  'faceVerification.turnLeft': {
    uz: 'Iltimos, yuzingizni chap tomonga burang.',
    'uz-cyrl': 'Илтимос, юзингизни чап томонга буранг.',
    ru: 'Пожалуйста, поверните лицо влево.'
  },
  'faceVerification.turnRight': {
    uz: 'Iltimos, yuzingizni o\'ng tomonga burang.',
    'uz-cyrl': 'Илтимос, юзингизни ўнг томонга буранг.',
    ru: 'Пожалуйста, поверните лицо вправо.'
  },
  'faceVerification.verificationComplete': {
    uz: 'Yuz tekshiruvi yakunlandi!',
    'uz-cyrl': 'Юз текшируви якунланди!',
    ru: 'Проверка лица завершена!'
  },
  'faceVerification.noFaceDetected': {
    uz: 'Yuz aniqlanmadi. Iltimos, kameraga qarating.',
    'uz-cyrl': 'Юз аниқланмади. Илтимос, камерага қаратинг.',
    ru: 'Лицо не обнаружено. Пожалуйста, смотрите в камеру.'
  },
  'faceVerification.multipleFacesDetected': {
    uz: 'Bir nechta yuz aniqlandi. Iltimos, faqat siz kameraga qarating.',
    'uz-cyrl': 'Бир нечта юз аниқланди. Илтимос, фақат сиз камерага қаратинг.',
    ru: 'Обнаружено несколько лиц. Пожалуйста, только вы должны быть в кадре.'
  },
  'faceVerification.detectionProgress': {
    uz: 'Aniqlash jarayoni: {count}/{required}',
    'uz-cyrl': 'Аниқлаш жараёни: {count}/{required}',
    ru: 'Прогресс обнаружения: {count}/{required}'
  },
  'faceVerification.cancel': { uz: 'Bekor qilish', 'uz-cyrl': 'Бекор қилиш', ru: 'Отмена' },
  'faceVerification.cameraAccessDenied': {
    uz: 'Kamera ruxsati rad etildi. Davom etish uchun kameraga ruxsat bering.',
    'uz-cyrl': 'Камера рухсати рад этилди. Давом этиш учун камерага рухсат беринг.',
    ru: 'Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере для продолжения.'
  },
  'faceVerification.multiStepIntro': {
    uz: 'Testni boshlash uchun yuzingizni uch bosqichda tekshirish kerak: to\'g\'ri, chap va o\'ng.',
    'uz-cyrl': 'Тестни бошлаш учун юзингизни уч босқичда текшириш керак: тўғри, чап ва ўнг.',
    ru: 'Для начала теста необходимо проверить ваше лицо в трех позициях: прямо, влево и вправо.'
  },
  'faceVerification.stepProgress': {
    uz: 'Bosqich {current}/{total}',
    'uz-cyrl': 'Босқич {current}/{total}',
    ru: 'Шаг {current}/{total}'
  },
  'faceVerification.step.center': {
    uz: 'Yuzingizni to\'g\'ri qarating',
    'uz-cyrl': 'Юзингизни тўғри қаратинг',
    ru: 'Смотрите прямо'
  },
  'faceVerification.step.left': {
    uz: 'Yuzingizni chap tomonga burang',
    'uz-cyrl': 'Юзингизни чап томонга буранг',
    ru: 'Поверните лицо влево'
  },
  'faceVerification.step.right': {
    uz: 'Yuzingizni o\'ng tomonga burang',
    'uz-cyrl': 'Юзингизни ўнг томонга буранг',
    ru: 'Поверните лицо вправо'
  },
  'faceVerification.stepLabel.center': {
    uz: 'To\'g\'ri',
    'uz-cyrl': 'Тўғри',
    ru: 'Прямо'
  },
  'faceVerification.stepLabel.left': {
    uz: 'Chap',
    'uz-cyrl': 'Чап',
    ru: 'Влево'
  },
  'faceVerification.stepLabel.right': {
    uz: 'O\'ng',
    'uz-cyrl': 'Ўнг',
    ru: 'Вправо'
  },
  'faceVerification.noFaceFront': {
    uz: 'Yuzingiz aniqlanmadi. Iltimos, kameraga to\'g\'ri qarating.',
    'uz-cyrl': 'Юзингиз аниқланмади. Илтимос, камерага тўғри қаратинг.',
    ru: 'Ваше лицо не обнаружено. Пожалуйста, смотрите прямо в камеру.'
  },
  'faceVerification.multipleFaces': {
    uz: 'Bir nechta yuz aniqlandi. Iltimos, faqat siz kameraga qarating.',
    'uz-cyrl': 'Бир нечта юз аниқланди. Илтимос, фақат сиз камерага қаратинг.',
    ru: 'Обнаружено несколько лиц. Пожалуйста, только вы должны быть в кадре.'
  },
  'faceVerification.detectionError': {
    uz: 'Yuz aniqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
    'uz-cyrl': 'Юз аниқлашда хатолик юз берди. Илтимос, қайта уриниб кўринг.',
    ru: 'Произошла ошибка при обнаружении лица. Пожалуйста, попробуйте снова.'
  },
  'faceVerification.captureError': {
    uz: 'Yuz suratini olishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.',
    'uz-cyrl': 'Юз суратини олишда хатолик юз берди. Илтимос, қайта уриниб кўринг.',
    ru: 'Произошла ошибка при захвате изображения лица. Пожалуйста, попробуйте снова.'
  },
  'dismiss': { uz: 'Yopish', 'uz-cyrl': 'Ёпиш', ru: 'Закрыть' },

  // Face Monitoring
  'faceMonitoring.noFaceDetected': {
    uz: 'Yuzingiz aniqlanmadi. Iltimos, kameraga qarating.',
    'uz-cyrl': 'Юзингиз аниқланмади. Илтимос, камерага қаратинг.',
    ru: 'Ваше лицо не обнаружено. Пожалуйста, повернитесь к камере.'
  },
  'faceMonitoring.multipleFacesDetected': {
    uz: 'Bir nechta yuz aniqlandi. Iltimos, faqat siz kameraga qarating.',
    'uz-cyrl': 'Бир нечта юз аниқланди. Илтимос, фақат сиз камерага қаратинг.',
    ru: 'Обнаружено несколько лиц. Пожалуйста, только вы должны быть в кадре.'
  },
  'faceMonitoring.faceLost': {
    uz: 'Yuzingiz yo\'qoldi. Iltimos, kameraga qaytib qarating.',
    'uz-cyrl': 'Юзингиз йўқолди. Илтимос, камерага қайтиб қаратинг.',
    ru: 'Ваше лицо потеряно. Пожалуйста, вернитесь к камере.'
  },
  'faceMonitoring.tabSwitched': {
    uz: 'Boshqa tab yoki oynaga o\'tish aniqlandi. Iltimos, test sahifasida qoling.',
    'uz-cyrl': 'Бошқа таб ёки ойнага ўтиш аниқланди. Илтимос, тест саҳифасида қолинг.',
    ru: 'Обнаружено переключение на другую вкладку или окно. Пожалуйста, оставайтесь на странице теста.'
  },
  'faceMonitoring.faceMismatch': {
    uz: 'Yuz mos kelmadi. Iltimos, tasdiqlangan foydalanuvchi testni davom ettirsin.',
    'uz-cyrl': 'Юз мос келмади. Илтимос, тасдиқланган фойдаланувчи тестни давом эттирсин.',
    ru: 'Обнаружено другое лицо. Пожалуйста, верните подтверждённого пользователя.',
    en: 'Face mismatch detected. Please continue the test with the verified user.'
  },
  'faceMonitoring.violationDetected': {
    uz: 'Qoidabuzarlik aniqlandi.',
    'uz-cyrl': 'Қоидабузарлик аниқланди.',
    ru: 'Обнаружено нарушение.'
  },
  'faceMonitoring.violationWarning': {
    uz: 'Ogohlantirish',
    'uz-cyrl': 'Огоҳлантириш',
    ru: 'Предупреждение'
  },
  'faceMonitoring.testTerminated': {
    uz: 'Test tugatildi',
    'uz-cyrl': 'Тест тугатилди',
    ru: 'Тест завершен'
  },
  'faceMonitoring.maxAttemptsReached': {
    uz: 'Maksimal urinishlar soniga yetildi. Test avtomatik ravishda tugatildi.',
    'uz-cyrl': 'Максимал уринишлар сонига етилди. Тест автоматик равишда тугатилди.',
    ru: 'Достигнуто максимальное количество попыток. Тест автоматически завершен.'
  },
  'faceMonitoring.attemptsRemaining': {
    uz: 'Qolgan urinishlar',
    'uz-cyrl': 'Қолган уринишлар',
    ru: 'Осталось попыток'
  },
  'faceMonitoring.continue': {
    uz: 'Davom etish',
    'uz-cyrl': 'Давом этиш',
    ru: 'Продолжить'
  },
  'faceMonitoring.close': {
    uz: 'Yopish',
    'uz-cyrl': 'Ёпиш',
    ru: 'Закрыть'
  },
  'faceMonitoring.testTerminatedMessage': {
    uz: 'Test yuz monitoring qoidabuzarliklari tufayli tugatildi.',
    'uz-cyrl': 'Тест юз мониторинг қоидабузарликлари туфайли тугатилди.',
    ru: 'Тест был завершен из-за нарушений мониторинга лица.'
  },
  'card.totalAnswers': { uz: "Umumiy to'liq javoblar", 'uz-cyrl': 'Умумий тўлиқ жавоблар', ru: 'Всего верных ответов' },
  'test.finishTest': { uz: "Testni yakunlash", 'uz-cyrl': 'Тестни якунлаш', ru: 'Завершить тест' },

  // Loading and Error States
  'loading.profile': { uz: 'Profil yuklanmoqda', 'uz-cyrl': 'Профил юкланмоқда', ru: 'Загрузка профиля' },
  'loading.profileDesc': {
    uz: 'Test tarixingiz yuklanayotganini kuting...',
    'uz-cyrl': 'Тест тарихингиз юкланаётганини кутинг...',
    ru: 'Пожалуйста, подождите, пока мы загружаем вашу историю тестов...'
  },
  'loading.test': { uz: 'Test yuklanmoqda', 'uz-cyrl': 'Тест юкланмоқда', ru: 'Загрузка теста' },
  'loading.testDesc': {
    uz: 'Testingiz yuklanayotganini kuting...',
    'uz-cyrl': 'Тестингиз юкланаётганини кутинг...',
    ru: 'Пожалуйста, подождите, пока мы загружаем ваш тест...'
  },
  'loading.employees': { uz: 'Xodimlar yuklanmoqda', 'uz-cyrl': 'Ходимлар юкланмоқда', ru: 'Загрузка сотрудников' },
  'loading.employeesDesc': {
    uz: 'Xodimlar ma\'lumotlari yuklanayotganini kuting...',
    'uz-cyrl': 'Ходимлар маълумотлари юкланаётганини кутинг...',
    ru: 'Пожалуйста, подождите, пока мы загружаем данные сотрудников...'
  },

  'error.connection': { uz: 'Ulanish xatosi', 'uz-cyrl': 'Уланиш хатоси', ru: 'Ошибка соединения' },
  'error.connectionDesc': {
    uz: 'Ma\'lumotlarni yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    'uz-cyrl': 'Маълумотларни юклаб бўлмади. Уланишни текшириб, қайта уриниб кўринг.',
    ru: 'Не удалось загрузить данные. Проверьте соединение и попробуйте снова.'
  },
  'error.testData': {
    uz: 'Test ma\'lumotlarini yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    'uz-cyrl': 'Тест маълумотларини юклаб бўлмади. Уланишни текшириб, қайта уриниб кўринг.',
    ru: 'Не удалось загрузить данные теста. Проверьте соединение и попробуйте снова.'
  },
  'error.employeeData': {
    uz: 'Xodimlar ma\'lumotlarini yuklab bo\'lmadi. Ulanishni tekshirib, qayta urinib ko\'ring.',
    'uz-cyrl': 'Ходимлар маълумотларини юклаб бўлмади. Уланишни текшириб, қайта уриниб кўринг.',
    ru: 'Не удалось загрузить данные сотрудников. Проверьте соединение и попробуйте снова.'
  },
  'retry': { uz: 'Qayta urinish', 'uz-cyrl': 'Қайта уриниш', ru: 'Повторить' },

  // Empty States
  'empty.noTestHistory': {
    uz: 'Hali test tarixi yo\'q',
    'uz-cyrl': 'Ҳали тест тарихи йўқ',
    ru: 'Истории тестов пока нет'
  },
  'empty.noTestHistoryDesc': {
    uz: 'Natijalaringizni ko\'rish uchun birinchi testni boshlang.',
    'uz-cyrl': 'Натижаларингизни кўриш учун биринчи тестни бошланг.',
    ru: 'Начните свой первый тест, чтобы увидеть результаты здесь.'
  },
  'empty.startFirstTest': {
    uz: 'Birinchi testni boshlash',
    'uz-cyrl': 'Биринчи тестни бошлаш',
    ru: 'Начать первый тест'
  },

  // OTP Form
  'otp.confirm': { uz: 'Tasdiqlash', 'uz-cyrl': 'Тасдиқлаш', ru: 'Подтвердить' },
  'otp.codeNotReceived': { uz: 'Kod kelmadi?', 'uz-cyrl': 'Код келмади?', ru: 'Код не пришел?' },
  'otp.resend': { uz: 'Qayta yuborish', 'uz-cyrl': 'Қайта юбориш', ru: 'Отправить заново' },
  'otp.back': { uz: 'Orqaga', 'uz-cyrl': 'Орқага', ru: 'Назад' },
  'otp.enterAllDigits': {
    uz: 'Barcha 6 raqamni kiriting',
    'uz-cyrl': 'Барча 6 рақамни киритинг',
    ru: 'Введите все 6 цифр кода'
  },
  'otp.onlyDigits': {
    uz: 'Kod faqat raqamlardan iborat bo\'lishi kerak',
    'uz-cyrl': 'Код фақат рақамлардан иборат бўлиши керак',
    ru: 'Код должен содержать только цифры'
  },
  'otp.codeRequired': { uz: 'Kod majburiy', 'uz-cyrl': 'Код мажбурий', ru: 'Код обязателен' },
  'otp.onlyNumbers': { uz: 'Faqat raqamlar', 'uz-cyrl': 'Фақат рақамлар', ru: 'Только цифры' },
  'otp.invalidCode': {
    uz: 'Noto\'g\'ri tasdiqlash kodi',
    'uz-cyrl': 'Нотўғри тасдиқлаш коди',
    ru: 'Неверный код подтверждения'
  },
  'otp.codeError': { uz: 'Kod bilan xatolik', 'uz-cyrl': 'Код билан хато', ru: 'Ошибка с кодом' },
  'otp.loginError': {
    uz: 'Kirishda xatolik yuz berdi',
    'uz-cyrl': 'Киришда хато юз берди',
    ru: 'Произошла ошибка при входе'
  },

  // Test Page
  'test.loadingQuestion': { uz: 'Savol yuklanmoqda...', 'uz-cyrl': 'Савол юкланмоқда...', ru: 'Загрузка вопроса...' },
  'test.questionOf': {
    uz: 'Savol {current} dan {total}',
    'uz-cyrl': 'Савол {current} дан {total}',
    ru: 'Вопрос {current} из {total}'
  },
  'test.next': { uz: 'Keyingi', 'uz-cyrl': 'Кейинги', ru: 'След.' },
  'test.start': { uz: 'Testni boshlash', 'uz-cyrl': 'Тестни бошлаш', ru: 'Запуск теста' },
  'test.finish': { uz: 'Yakunlash', 'uz-cyrl': 'Якунлаш', ru: 'Завершить' },
  'test.previous': { uz: 'Oldingi', 'uz-cyrl': 'Олдинги', ru: 'Предыдущий' },
  'test.answered': { uz: 'Javob berilgan', 'uz-cyrl': 'Жавоб берилган', ru: 'Отвечено' },
  'test.notAnswered': { uz: 'Javob berilmagan', 'uz-cyrl': 'Жавоб берилмаган', ru: 'Не отвечено' },
  'test.current': { uz: 'Joriy', 'uz-cyrl': 'Жорий', ru: 'Текущий' },

  // Admin Employees Page
  'admin.employees': { uz: 'Barcha xodimlar', 'uz-cyrl': 'Барча ходимлар', ru: 'Все сотрудники' },
  'admin.searchPlaceholder': {
    uz: 'Ism yoki telefon bo\'yicha qidirish...',
    'uz-cyrl': 'Исм ёки телефон бўйича қидириш...',
    ru: 'Поиск по имени или телефону...'
  },
  'admin.allBranches': { uz: 'Barcha GTFlar', 'uz-cyrl': 'Барча ГТФлар', ru: 'Все ГТФ' },
  'admin.allPositions': { uz: 'Barcha lavozimlar', 'uz-cyrl': 'Барча лавозимлар', ru: 'Все должности' },
  'admin.allStatuses': { uz: 'Barcha holatlar', 'uz-cyrl': 'Барча ҳолатлар', ru: 'Все статусы' },
  'admin.previous': { uz: 'Oldingi', 'uz-cyrl': 'Олдинги', ru: 'Предыдущий' },
  'admin.next': { uz: 'Keyingi', 'uz-cyrl': 'Кейинги', ru: 'Следующий' },
  'admin.showingResults': {
    uz: '{start}-{end} natija {total} dan ko\'rsatilmoqda',
    'uz-cyrl': '{start}-{end} натижа {total} дан кўрсатилмоқда',
    ru: 'Показано {start}-{end} из {total} результатов'
  },

  // Certificate Modal
  'certificate.downloadTitle': {
    uz: 'Sertifikatni yuklab olish',
    'uz-cyrl': 'Сертификатни юклаб олиш',
    ru: 'Скачать сертификат'
  },
  'certificate.downloadMessage': {
    uz: '{userName} uchun sertifikatni yuklab olishni xohlaysizmi? Bu sertifikat sahifasini yangi tabda ochadi.',
    'uz-cyrl': '{userName} учун сертификатни юклаб олишни хоҳлайсизми? Бу сертификат саҳифасини янги табда очиди.',
    ru: 'Хотите скачать сертификат для {userName}? Это откроет страницу сертификата в новой вкладке.'
  },
  'certificate.download': { uz: 'Yuklab olish', 'uz-cyrl': 'Юклаб олиш', ru: 'Скачать' },
  'certificate.cancel': { uz: 'Bekor qilish', 'uz-cyrl': 'Бекор қилиш', ru: 'Отмена' },
  'certificate.noCompletedSessions': {
    uz: 'Bu foydalanuvchi uchun tugallangan sessiyalar topilmadi',
    'uz-cyrl': 'Бу фойдаланувчи учун тугалланган сессиялар топилмади',
    ru: 'Для этого пользователя не найдено завершенных сессий'
  },
  'certificate.noSurveyHistory': {
    uz: 'Bu foydalanuvchi uchun so\'rov tarixi topilmadi',
    'uz-cyrl': 'Бу фойдаланувчи учун сўров тарихи топилмади',
    ru: 'Для этого пользователя не найдена история опросов'
  },
  'admin.aboutEmployee': { uz: 'Xodim haqida', 'uz-cyrl': 'Ходим ҳақида', ru: 'О сотруднике' },
  'admin.noEmployees': { uz: 'Xodimlar topilmadi', 'uz-cyrl': 'Ходимлар топилмади', ru: 'Сотрудники не найдены' },
  'admin.errorLoadingDetails': {
    uz: 'Xodim tafsilotlarini yuklashda xatolik',
    'uz-cyrl': 'Ходим тафсилотларини юклашда хато',
    ru: 'Ошибка загрузки деталей сотрудника'
  },
  'admin.noDetailsAvailable': {
    uz: 'Xodim tafsilotlari mavjud emas',
    'uz-cyrl': 'Ходим тафсилотлари мавжуд эмас',
    ru: 'Детали сотрудника недоступны'
  },
  'admin.totalAttempts': { uz: 'Jami urinishlar', 'uz-cyrl': 'Жами уринишлар', ru: 'Всего попыток' },
  'admin.bestScore': { uz: 'Eng yaxshi ball', 'uz-cyrl': 'Энг яхши балл', ru: 'Лучший балл' },
  'admin.completedTests': { uz: 'O\'tilgan testlar', 'uz-cyrl': 'Ўтилган тестлар', ru: 'Пройдено тестов' },
  'admin.averageScore': { uz: 'O\'rtacha ball', 'uz-cyrl': 'Ўртача балл', ru: 'Средний балл' },
  'admin.testHistory': { uz: 'Test tarixi', 'uz-cyrl': 'Тест тарихи', ru: 'История тестов' },
  'admin.score': { uz: 'Ball', 'uz-cyrl': 'Балл', ru: 'Балл' },
  'admin.of': { uz: 'dan', 'uz-cyrl': 'дан', ru: 'из' },
  'admin.passed': { uz: 'O\'tdi', 'uz-cyrl': 'Ўтди', ru: 'Прошел' },
  'admin.failed': { uz: 'O\'tmadi', 'uz-cyrl': 'Ўтмади', ru: 'Не прошел' },
  'admin.unknown': { uz: 'Noma\'lum', 'uz-cyrl': 'Номаълум', ru: 'Неизвестно' },
  'admin.na': { uz: 'N/A', 'uz-cyrl': 'Н/Д', ru: 'Н/Д' },
  'na': { uz: 'N/A', 'uz-cyrl': 'Н/Д', ru: 'Н/Д' },
  'admin.totalStatistics': { uz: 'Umumiy statistika', 'uz-cyrl': 'Умумий статистика', ru: 'Общая статистика' },

  // Table Headers
  'table.name': { uz: 'F.I.Sh.', 'uz-cyrl': 'Ф.И.Ш.', ru: 'Ф.И.О.' },
  'table.branch': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'table.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'table.lastScore': { uz: 'Oxirgi ball', 'uz-cyrl': 'Охирги балл', ru: 'Последний балл' },
  'table.attempts': { uz: 'Urinishlar soni', 'uz-cyrl': 'Уринишлар сони', ru: 'Количество попыток' },
  'table.status': { uz: 'Holat', 'uz-cyrl': 'Ҳолат', ru: 'Статус' },
  'table.totalQuestions': {
    uz: 'Jami urinishlar soni',
    'uz-cyrl': 'Жами уринишлар сони',
    ru: 'Общее количество попыток'
  },
  'table.totalQuestions30': {
    uz: 'Jami savollar soni',
    'uz-cyrl': 'Жами саволлар сони',
    ru: 'Общее количество вопросов'
  },
  'table.totalCorrectQuestions': {
    uz: 'Tog\'ri javoblar soni',
    'uz-cyrl': 'Тўғри жавоблар сони',
    ru: 'Количество правильных ответов'
  },
  'table.finalScore': { uz: 'Yakuniy ball', 'uz-cyrl': 'Якуний балл', ru: 'Финальный балл' },
  'table.phone': { uz: 'Telefon', 'uz-cyrl': 'Телефон', ru: 'Телефон' },
  'table.dateJoined': { uz: 'Ro\'yxatdan o\'tgan sana', 'uz-cyrl': 'Рўйхатдан ўтган сана', ru: 'Дата регистрации' },
  'table.lastLogin': { uz: 'Oxirgi kirish', 'uz-cyrl': 'Охирги кириш', ru: 'Последний вход' },

  // Test Rules Page
  'rules.title': { uz: 'Test qoidalari', 'uz-cyrl': 'Тест қоидалари', ru: 'Правила теста' },
  'rules.timing': { uz: 'Vaqt', 'uz-cyrl': 'Вақт', ru: 'Время' },
  'rules.timingDesc': {
    uz: 'Mashq testlari vaqt bilan cheklangan, lekin siz ularni pauza qilishingiz mumkin. Boshqa qurilmada davom ettirish uchun qaytadan boshlashingiz kerak. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    'uz-cyrl': 'Машқ тестлари вақт билан чекланган, лекин сиз уларни пауза қилишингиз мумкин. Бошқа қурилмада давом этириш учун қайтадан бошлашингиз керак. Биз тўлиқ бўлмаган машқ тестларини 90 кундан кейин ўчирамиз.',
    ru: 'Практические тесты ограничены по времени, но вы можете их приостанавливать. Чтобы продолжить на другом устройстве, вам нужно начать заново. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.scores': { uz: 'Balllar', 'uz-cyrl': 'Балллар', ru: 'Баллы' },
  'rules.scoresDesc': {
    uz: 'Mashq testini tugatganda, ballaringizni ko\'rish va shaxsiylashtirilgan o\'quv maslahatlarini olish uchun "Mening mashqlarim"ga o\'ting. Biz to\'liq bo\'lmagan mashq testlarini 90 kundan keyin o\'chiramiz.',
    'uz-cyrl': 'Машқ тестини тугатганда, балларингизни кўриш ва шахсийлаштирилган ўқув маслаҳатларини олиш учун "Менинг машқларим"га ўтинг. Биз тўлиқ бўлмаган машқ тестларини 90 кундан кейин ўчирамиз.',
    ru: 'Когда вы завершите практический тест, перейдите в "Мои практики", чтобы увидеть свои баллы и получить персонализированные советы по обучению. Мы удаляем незавершенные практические тесты через 90 дней.'
  },
  'rules.assistiveTech': {
    uz: 'Yordamchi texnologiya (YT)',
    'uz-cyrl': 'Ёрдамчи технология (ЁТ)',
    ru: 'Вспомогательные технологии (ВТ)'
  },
  'rules.assistiveTechDesc': {
    uz: 'Test uchun foydalanadigan har qanday YT bilan mashq qilishni unutmang. Agar siz bu yerda YT sozlamalarini sozlasangiz, test kunida bu qadamni takrorlashingiz kerak bo\'lishi mumkin.',
    'uz-cyrl': 'Тест учун фойдаланадиган ҳар қандай ЁТ билан машқ қилишни унутманг. Агар сиз бу ерда ЁТ созламаларини созласангиз, тест кунида бу қадамни такрорлашингиз керак бўлиши мумкин.',
    ru: 'Обязательно практикуйтесь с любыми ВТ, которые вы используете для тестирования. Если вы настроите параметры ВТ здесь, вам может потребоваться повторить этот шаг в день теста.'
  },
  'rules.noDeviceLock': {
    uz: 'Qurilma qulfi yo\'q',
    'uz-cyrl': 'Қурилма қулфи йўқ',
    ru: 'Блокировка устройства отсутствует'
  },
  'rules.noDeviceLockDesc': {
    uz: 'Biz mashq paytida qurilmangizni qulflamaymiz. Test kunida siz boshqa dasturlar yoki ilovalardan foydalanishdan cheklanadi.',
    'uz-cyrl': 'Биз машқ пайтида қурилманингизни қулфламаймиз. Тест кунида сиз бошқа дастурлар ёки иловалардан фойдаланишдан чекланади.',
    ru: 'Мы не блокируем ваше устройство во время практики. В день теста вам будет запрещено использовать другие программы или приложения.'
  },
  'rules.previous': { uz: 'Oldingi', 'uz-cyrl': 'Олдинги', ru: 'Предыдущий' },
  'rules.next': { uz: 'Keyingi', 'uz-cyrl': 'Кейинги', ru: 'Следующий' },

  // Header Dropdown
  'header.myProfile': { uz: 'Mening profilim', 'uz-cyrl': 'Менинг профилим', ru: 'Мой профиль' },
  'header.adminEmployees': { uz: 'Xodimlar boshqaruvi', 'uz-cyrl': 'Ходимлар бошқаруви', ru: 'Управление сотрудниками' },

  // Profile Form
  'profile.save': { uz: 'Saqlash', 'uz-cyrl': 'Сақлаш', ru: 'Сохранить' },
  'profile.saveSuccess': {
    uz: 'Ma\'lumotlar muvaffaqiyatli saqlandi',
    'uz-cyrl': 'Маълумотлар муваффақиятли сақланди',
    ru: 'Данные успешно сохранены'
  },
  'profile.saveError': {
    uz: 'Ma\'lumotlarni saqlashda xatolik',
    'uz-cyrl': 'Маълумотларни сақлашда хато',
    ru: 'Ошибка при сохранении данных'
  },

  // Session Details Page
  'session.scoreDetails': { uz: 'BAHOLASH TAFSILOTLARI', 'uz-cyrl': 'БАҲОЛАШ ТАФСИЛОТЛАРИ', ru: 'ДЕТАЛИ ОЦЕНКИ' },
  'session.scoreDetailsDesc': {
    uz: 'Amaliy test natijalaringizni ko\'rib chiqing, ishlash darajangizni chuqurroq o\'rganing va test kunidan oldin kuchli tomonlaringizni biling.',
    'uz-cyrl': 'Амалий тест натижаларингизни кўриб чиқинг, ишлаш даражаингизни чуқуррок ўрганинг ва тест кунидан олдин кучли томонларингизни билинг.',
    ru: 'Просмотрите результаты практического теста, углубитесь в свою производительность и изучите свои сильные стороны перед днем теста.'
  },
  'session.personalizedGreeting': {
    uz: 'Hurmatli {name}, oxirgi topshirgan testdan siz {score} bal topladingiz.',
    'uz-cyrl': 'Ҳурматли {name}, охирги топширган тестдан сиз {score} балл топладингиз.',
    ru: 'Уважаемый {name}, за последний сданный тест вы набрали {score} баллов.'
  },
  'session.testNumber': { uz: 'Test #{number}', 'uz-cyrl': 'Тест #{number}', ru: 'Тест #{number}' },
  'session.testDesc': {
    uz: 'Bu yerda siz test natijalaringizni bilib olishingiz mumkin.',
    'uz-cyrl': 'Бу ерда сиз тест натижаларингизни билиб олишингиз мумкин.',
    ru: 'Здесь вы можете узнать результаты вашего теста.'
  },
  'session.totalQuestions': { uz: 'Jami savollar', 'uz-cyrl': 'Жами саволлар', ru: 'Всего вопросов' },
  'session.correctAnswers': { uz: 'To\'g\'ri javoblar', 'uz-cyrl': 'Тўғри жавоблар', ru: 'Правильные ответы' },
  'session.incorrectAnswers': { uz: 'Noto\'g\'ri javoblar', 'uz-cyrl': 'Нотўғри жавоблар', ru: 'Неправильные ответы' },
  'session.scorePoints': { uz: 'Balllar', 'uz-cyrl': 'Балллар', ru: 'Баллы' },
  'session.questions': { uz: 'SAVOLLAR', 'uz-cyrl': 'САВОЛЛАР', ru: 'ВОПРОСЫ' },
  'session.questionTitle': { uz: 'SAVOL MATNI', 'uz-cyrl': 'САВОЛ МАТНИ', ru: 'ТЕКСТ ВОПРОСА' },
  'session.correctAnswer': { uz: 'TO\'G\'RI JAVOB', 'uz-cyrl': 'ТЎҒРИ ЖАВОБ', ru: 'ПРАВИЛЬНЫЙ ОТВЕТ' },
  'session.yourAnswer': { uz: 'SIZNING JAVOBINGIZ', 'uz-cyrl': 'СИЗНИНГ ЖАВОБИНГИЗ', ru: 'ВАШ ОТВЕТ' },
  'session.status': { uz: 'HOLAT', 'uz-cyrl': 'ҲОЛАТ', ru: 'СТАТУС' },
  'session.correct': { uz: 'To\'g\'ri', 'uz-cyrl': 'Тўғри', ru: 'Правильно' },
  'session.incorrect': { uz: 'Noto\'g\'ri', 'uz-cyrl': 'Нотўғри', ru: 'Неправильно' },
  'session.viewDetails': { uz: 'Tafsilotlarni ko\'rish', 'uz-cyrl': 'Тафсилотларни кўриш', ru: 'Просмотр деталей' },
  'session.pageNumber': { uz: 'Sahifa raqami', 'uz-cyrl': 'Саҳифа рақами', ru: 'Номер страницы' },
  'session.previous': { uz: 'Avvalgi', 'uz-cyrl': 'Аввалги', ru: 'Предыдущий' },
  'session.next': { uz: 'Keyingi', 'uz-cyrl': 'Кейинги', ru: 'Следующий' },
  'session.results': {
    uz: 'Natijalar: {showing} ta {total} tadan',
    'uz-cyrl': 'Натижалар: {showing} та {total} тадан',
    ru: 'Результаты: {showing} из {total}'
  },

  // Loading states for session details
  'loading.sessionDetails': {
    uz: 'Session tafsilotlari yuklanmoqda',
    'uz-cyrl': 'Сессия тафсилотлари юкланмоқда',
    ru: 'Загрузка деталей сессии'
  },
  'loading.sessionDetailsDesc': {
    uz: 'Session ma\'lumotlari yuklanmoqda, iltimos kuting...',
    'uz-cyrl': 'Сессия маълумотлари юкланмоқда, илтимос кутинг...',
    ru: 'Загружаются данные сессии, пожалуйста подождите...'
  },
  'session.noQuestions': { uz: 'Savollar topilmadi', 'uz-cyrl': 'Саволлар топилмади', ru: 'Вопросы не найдены' },
  'session.testResults': { uz: 'Test natijalari', 'uz-cyrl': 'Тест натижалари', ru: 'Результаты теста' },
  'session.violationCases': { uz: 'Qoidabuzarliklar', 'uz-cyrl': 'Қоидабузарликлар', ru: 'Нарушения' },
  'session.recordingTitle': { uz: 'Video yozuv', 'uz-cyrl': 'Видео ёзув', ru: 'Видеозапись' },
  'session.recordingProcessing': {
    uz: 'Video yozuv hali tayyor emas. Iltimos, keyinroq qaytib keling.',
    'uz-cyrl': 'Видео ёзув ҳали тайёр эмас. Илтимос, кейинроқ қайта келинг.',
    ru: 'Видеозапись ещё обрабатывается. Пожалуйста, попробуйте позже.'
  },
  'session.recordingUnavailable': {
    uz: 'Video havolasi mavjud emas.',
    'uz-cyrl': 'Видео ҳаволаси мавжуд эмас.',
    ru: 'Ссылка на видео отсутствует.'
  },
  'session.duration': { uz: 'Davomiylik', 'uz-cyrl': 'Давомийлик', ru: 'Длительность' },
  'session.fileSize': { uz: 'Fayl hajmi', 'uz-cyrl': 'Файл ҳажми', ru: 'Размер файла' },
  'session.videoChunks': { uz: 'Video bo\'laklari', 'uz-cyrl': 'Видео бўлаклари', ru: 'Видео-фрагменты' },
  'session.chunkNumber': { uz: 'Bo\'lak raqami', 'uz-cyrl': 'Бўлак рақами', ru: 'Номер фрагмента' },
  'session.violationsTitle': { uz: 'Qoidabuzarliklar ro\'yxati', 'uz-cyrl': 'Қоидабузарликлар рўйхати', ru: 'Список нарушений' },
  'session.faceCount': { uz: 'Yuzlar soni', 'uz-cyrl': 'Юзлар сони', ru: 'Количество лиц' },
  'session.violationId': { uz: 'Qoidabuzarlik ID', 'uz-cyrl': 'Қоидабузарлик ID', ru: 'ID нарушения' },
  'session.noViolations': { uz: 'Qoidabuzarliklar topilmadi', 'uz-cyrl': 'Қоидабузарликлар топилмади', ru: 'Нарушения не найдены' },
  'session.noViolationsDesc': {
    uz: 'Monitoring davomida hech qanday qoidabuzarlik qayd etilmadi.',
    'uz-cyrl': 'Мониторинг давомида ҳеч қандай қоидабузарлик қайд этилмади.',
    ru: 'Во время мониторинга нарушений не обнаружено.'
  },
  'session.violationType.no_face': {
    uz: 'Yuz aniqlanmadi',
    'uz-cyrl': 'Юз аниқланмади',
    ru: 'Лицо не обнаружено'
  },
  'session.violationType.multiple_faces': {
    uz: 'Bir nechta yuz',
    'uz-cyrl': 'Бир нечта юз',
    ru: 'Несколько лиц'
  },
  'session.violationType.multiple_face': {
    uz: 'Bir nechta yuz',
    'uz-cyrl': 'Бир нечта юз',
    ru: 'Несколько лиц'
  },
  'session.violationType.one_face': {
    uz: 'Tasdiqlanmagan yuz',
    'uz-cyrl': 'Тасдиқланмаган юз',
    ru: 'Стороннее лицо',
    en: 'Face mismatch'
  },
  'session.violationType.face_lost': {
    uz: 'Yuz yo\'qotildi',
    'uz-cyrl': 'Юз йўқолди',
    ru: 'Лицо потеряно'
  },
  'session.violationType.tab_switched': {
    uz: 'Tab almashtirildi',
    'uz-cyrl': 'Таб алмаштирилди',
    ru: 'Переключение вкладки'
  },
  'session.violationType.switch_tab': {
    uz: 'Tab almashtirildi',
    'uz-cyrl': 'Таб алмаштирилди',
    ru: 'Переключение вкладки'
  },

  // Status translations
  'status.completed': { uz: 'Tugallangan', 'uz-cyrl': 'Тугалланган', ru: 'Завершено' },
  'status.passed': { uz: 'O\'tilgan', 'uz-cyrl': 'Ўтилган', ru: 'Пройдено' },
  'status.never_started': { uz: 'Boshlanmagan', 'uz-cyrl': 'Бошланмаган', ru: 'Не начато' },
  'status.active': { uz: 'Faol', 'uz-cyrl': 'Фаол', ru: 'Активный' },
  'status.started': { uz: 'Boshlangan', 'uz-cyrl': 'Бошланган', ru: 'Начато' },
  'status.in_progress': { uz: 'Jarayonda', 'uz-cyrl': 'Жараёнда', ru: 'В процессе' },
  'status.failed': { uz: 'Muvaffaqiyatsiz', 'uz-cyrl': 'Муваффақиятсиз', ru: 'Неудачно' },
  'status.expired': { uz: 'Muddati tugagan', 'uz-cyrl': 'Муддати тугаган', ru: 'Истек срок' },
  'status.cancelled': { uz: 'Bekor qilingan', 'uz-cyrl': 'Бекор қилинган', ru: 'Отменено' },
  'status.refunded': { uz: 'Qaytarilgan', 'uz-cyrl': 'Қайтарилган', ru: 'Возвращено' },
  'status.correct': { uz: 'To\'g\'ri', 'uz-cyrl': 'Тўғри', ru: 'Правильно' },
  'status.incorrect': { uz: 'Noto\'g\'ri', 'uz-cyrl': 'Нотўғри', ru: 'Неправильно' },
  'status.unknown': { uz: 'Noma\'lum', 'uz-cyrl': 'Номаълум', ru: 'Неизвестно' },

  // Common UI elements
  'close': { uz: 'Yopish', 'uz-cyrl': 'Ёпиш', ru: 'Закрыть' },
  'cancel': { uz: 'Bekor qilish', 'uz-cyrl': 'Бекор қилиш', ru: 'Отменить' },
  'save': { uz: 'Saqlash', 'uz-cyrl': 'Сақлаш', ru: 'Сохранить' },
  'edit': { uz: 'Tahrirlash', 'uz-cyrl': 'Таҳрирлаш', ru: 'Редактировать' },
  'delete': { uz: 'O\'chirish', 'uz-cyrl': 'Ўчириш', ru: 'Удалить' },
  'confirm': { uz: 'Tasdiqlash', 'uz-cyrl': 'Тасдиқлаш', ru: 'Подтвердить' },
  'yes': { uz: 'Ha', 'uz-cyrl': 'Ҳа', ru: 'Да' },
  'no': { uz: 'Yo\'q', 'uz-cyrl': 'Йўқ', ru: 'Нет' },
  'ok': { uz: 'OK', 'uz-cyrl': 'ОК', ru: 'ОК' },
  'loading': { uz: 'Yuklanmoqda...', 'uz-cyrl': 'Юкланмоқда...', ru: 'Загрузка...' },
  'error': { uz: 'Xatolik', 'uz-cyrl': 'Хато', ru: 'Ошибка' },
  'success': { uz: 'Muvaffaqiyatli', 'uz-cyrl': 'Муваффақиятли', ru: 'Успешно' },
  'warning': { uz: 'Ogohlantirish', 'uz-cyrl': 'Огоҳлантириш', ru: 'Предупреждение' },
  'info': { uz: 'Ma\'lumot', 'uz-cyrl': 'Маълумот', ru: 'Информация' },

  // Categories Page
  'categories.title': { uz: 'Kategoriyalar', 'uz-cyrl': 'Категориялар', ru: 'Категории' },
  'categories.iqQuestions': { uz: 'Umumiy Kompetensiya', 'uz-cyrl': 'Умумий Компетенция', ru: 'Общая компетенция' },
  'categories.iqQuestionsDesc': {
    uz: 'Psixologiya, IQ va Xavfsizlik qoidalari bo\'yicha savollarni o\'z ichiga oladi. Fikr yuritish, xulq-atvor va asosiy xavfsizlik bilimlarini baholash uchun mo\'ljallangan. 5 ta savol asosiy ko\'nikmalarni tezkor tekshiradi.',
    'uz-cyrl': 'Психология, IQ ва Хавфсизлик қоидалари бўйича саволларни ўз ичига олади. Фикр юритиш, хулқ-атвор ва асосий хавфсизлик билимларини баҳолаш учун мўлжалланган. 5 та савол асосий кўникмаларни тезкор текширади.',
    ru: 'Включает вопросы по психологии, IQ и правилам безопасности. Предназначена для оценки мышления, поведения и знаний по базовой безопасности. Содержит 5 вопросов для быстрой проверки ключевых навыков.'
  },
  'categories.mainQuestions': { uz: 'Kasbiy Yo\'nalish', 'uz-cyrl': 'Касбий Йўналиш', ru: 'Профессиональная область' },
  'categories.mainQuestionsDesc': {
    uz: 'Mazmun tanlangan yo\'nalishga qarab belgilanadi: Suyultirilgan gaz yoki Tabiiy gaz. Maxsus bilimlar, amaliy ko\'nikmalar va soha standartlariga yo\'naltirilgan. 25 ta savol kasbiy kompetensiyani batafsil tekshiradi.',
    'uz-cyrl': 'Мазмун танланган йўналишга қараб белгиланади: Суюлтирилган газ ёки Табиий газ. Махсус билимлар, амалий кўникмалар ва соҳа стандартларига йўналтирилган. 25 та савол касбий компетенцияни батафсил текширади.',
    ru: 'Содержание зависит от выбранного направления: Сжиженный газ или Природный газ. Ориентирована на специализированные знания, практические навыки и отраслевые стандарты. Содержит 25 вопросов для детальной проверки профессиональной компетенции.'
  },
  'categories.additionalQuestions': {
    uz: 'Qo\'shimcha savollar',
    'uz-cyrl': 'Қўшимча саволлар',
    ru: 'Дополнительные вопросы'
  },
  'categories.additionalQuestionsDesc': {
    uz: 'Test uchun foydalanadigan har qanday YT bilan mashq qilishni unutmang. Agar siz bu yerda YT sozlamalarini sozlasangiz, test kunida bu qadamni takrorlashingiz kerak bo\'lishi mumkin.',
    'uz-cyrl': 'Тест учун фойдаланадиган ҳар қандай ЁТ билан машқ қилишни унутманг. Агар сиз бу ерда ЁТ созламаларини созласангиз, тест кунида бу қадамни такрорлашингиз керак бўлиши мумкин.',
    ru: 'Обязательно практикуйтесь с любыми ВТ, которые вы используете для тестирования. Если вы настроите параметры ВТ здесь, вам может потребоваться повторить этот шаг в день теста.'
  },
  'categories.regionalGasSupply': {
    uz: 'Hududiy Gaz Ta\'minotiga aloqadar',
    'uz-cyrl': 'Ҳудудий Газ Таъминотига алоқадар',
    ru: 'Связано с региональным газоснабжением'
  },
  'categories.regionalGasSupplyDesc': {
    uz: 'Biz mashq paytida qurilmangizni qulflamaymiz. Test kunida siz boshqa dasturlar yoki ilovalardan foydalanishdan cheklanadi.',
    'uz-cyrl': 'Биз машқ пайтида қурилманингизни қулфламаймиз. Тест кунида сиз бошқа дастурлар ёки иловалардан фойдаланишдан чекланади.',
    ru: 'Мы не блокируем ваше устройство во время практики. В день теста вам будет запрещено использовать другие программы или приложения.'
  },

  // User Profile Completion
  'profileCompletion.title': {
    uz: 'Profilni to\'ldiring',
    'uz-cyrl': 'Qo\'shimcha ma\'lumot',
    ru: 'Дополнительная информация'
  },
  'profileCompletion.subtitle': {
    uz: 'Iltimos, o\'z ma\'lumotlaringizni kiriting',
    'uz-cyrl': 'Илтимос, ўз маълумотларингизни киритинг',
    ru: 'Пожалуйста, введите свои данные'
  },
  'profileCompletion.name': { uz: 'To\'liq ism', 'uz-cyrl': 'Тўлиқ исм', ru: 'Полное имя' },
  'profileCompletion.namePlaceholder': {
    uz: 'Ismingizni kiriting',
    'uz-cyrl': 'Исмингизни киритинг',
    ru: 'Введите ваше имя'
  },
  'profileCompletion.branch': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'profileCompletion.branchPlaceholder': {
    uz: 'GTF nomini kiriting',
    'uz-cyrl': 'ГТФ номини киритинг',
    ru: 'Введите название ГТФ'
  },
  'profileCompletion.selectBranch': {
    uz: 'GTFni tanlang',
    'uz-cyrl': 'ГТФни танланг',
    ru: 'Выберите ГТФ'
  },
  'profileCompletion.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'profileCompletion.positionPlaceholder': {
    uz: 'Lavozimingizni kiriting',
    'uz-cyrl': 'Лавозимингизни киритинг',
    ru: 'Введите вашу должность'
  },
  'profileCompletion.selectPosition': {
    uz: 'Lavozimni tanlang',
    'uz-cyrl': 'Лавозимни танланг',
    ru: 'Выберите должность'
  },
  'profileCompletion.save': { uz: 'Saqlash', 'uz-cyrl': 'Сақлаш', ru: 'Сохранить' },
  'profileCompletion.nameRequired': {
    uz: 'Ism kiritilishi shart',
    'uz-cyrl': 'Исм киритилиши шарт',
    ru: 'Имя обязательно'
  },
  'profileCompletion.branchRequired': {
    uz: 'GTF kiritilishi shart',
    'uz-cyrl': 'ГТФ киритилиши шарт',
    ru: 'ГТФ обязателен'
  },
  'profileCompletion.positionRequired': {
    uz: 'Lavozim kiritilishi shart',
    'uz-cyrl': 'Лавозим киритилиши шарт',
    ru: 'Должность обязательна'
  },
  'profileCompletion.region': { uz: 'Viloyat', 'uz-cyrl': 'Вилоят', ru: 'Область' },
  'profileCompletion.selectRegion': {
    uz: 'Viloyatni tanlang',
    'uz-cyrl': 'Вилоятни танланг',
    ru: 'Выберите область'
  },
  'profileCompletion.regionRequired': {
    uz: 'Viloyat tanlanishi shart',
    'uz-cyrl': 'Вилоят танланиши шарт',
    ru: 'Область обязательна'
  },
  'profileCompletion.saveSuccess': {
    uz: 'Profil muvaffaqiyatli saqlandi',
    'uz-cyrl': 'Профил муваффақиятли сақланди',
    ru: 'Профиль успешно сохранен'
  },
  'profileCompletion.saveError': {
    uz: 'Profilni saqlashda xatolik',
    'uz-cyrl': 'Профилни сақлашда хато',
    ru: 'Ошибка при сохранении профиля'
  },
  'profileCompletion.employeeLevelRequired': {
    uz: 'Ishchi darajasi tanlanishi shart',
    'uz-cyrl': 'Ишчи даражаси танланиши шарт',
    ru: 'Уровень сотрудника обязателен'
  },
  'profileCompletion.workDomainRequired': {
    uz: 'Gaz turi tanlanishi shart',
    'uz-cyrl': 'Газ тури танланиши шарт',
    ru: 'Тип газа обязателен'
  },

  // Logout
  'logout': { uz: 'Chiqish', 'uz-cyrl': 'Чиқиш', ru: 'Выйти' },

  // Auth Pages
  'auth.login': { uz: 'Login', 'uz-cyrl': 'Логин', ru: 'Логин' },
  'auth.phoneNumber': { uz: 'Telefon raqami', 'uz-cyrl': 'Телефон рақами', ru: 'Номер телефона' },
  'auth.getCode': { uz: 'Kod olish', 'uz-cyrl': 'Код олиш', ru: 'Получить код' },
  'auth.fieldRequired': { uz: 'Maydon majburiy', 'uz-cyrl': 'Майдон мажбурий', ru: 'Поле обязательно' },
  'auth.invalidPhone': { uz: 'Noto\'g\'ri raqam', 'uz-cyrl': 'Нотўғри рақам', ru: 'Неверный номер' },
  'auth.phonePlaceholder': { uz: '+998', 'uz-cyrl': '+998', ru: '+998' },
  'auth.confirmLogin': { uz: 'Kirishni tasdiqlash', 'uz-cyrl': 'Киришни тасдиқлаш', ru: 'Подтверждение входа' },

  // New password-based auth
  'auth.loginPlaceholder': { uz: 'Loginni kiriting', 'uz-cyrl': 'Логинни киритинг', ru: 'Введите логин' },
  'auth.loginMinLength': {
    uz: 'Login kamida 1 belgidan iborat bo\'lishi kerak',
    'uz-cyrl': 'Логин камида 1 белгидан иборат бўлиши керак',
    ru: 'Логин должен содержать минимум 1 символ'
  },
  'auth.password': { uz: 'Parol', 'uz-cyrl': 'Парол', ru: 'Пароль' },
  'auth.passwordPlaceholder': { uz: 'Parolingizni kiriting', 'uz-cyrl': 'Паролингизни киритинг', ru: 'Введите пароль' },
  'auth.passwordMinLength': {
    uz: 'Parol kamida 6 belgidan iborat bo\'lishi kerak',
    'uz-cyrl': 'Парол камида 6 белгидан иборат бўлиши керак',
    ru: 'Пароль должен содержать минимум 6 символов'
  },
  'auth.confirmPassword': { uz: 'Parolni tasdiqlash', 'uz-cyrl': 'Паролни тасдиқлаш', ru: 'Подтверждение пароля' },
  'auth.confirmPasswordPlaceholder': {
    uz: 'Parolni qayta kiriting',
    'uz-cyrl': 'Паролни қайта киритинг',
    ru: 'Повторите пароль'
  },
  'auth.loginError': {
    uz: 'Kirishda xatolik yuz berdi. Texnik yordamga murojaat qiling yoki keyinroq urinib ko\'ring.',
    'uz-cyrl': 'Киришда хатолик юз берди. Техник ёрдамга муроожаат қилинг ёки кейинроқ уриниб кўринг.',
    ru: 'Ошибка при входе. Обратитесь в тех. поддержку или повторите позже.'
  },
  'auth.registerError': {
    uz: 'Ro\'yxatdan o\'tishda xatolik yuz berdi. Texnik yordamga murojaat qiling yoki keyinroq urinib ko\'ring.',
    'uz-cyrl': 'Рўйхатдан ўтишда хатолик юз берди. Техник ёрдамга муроожаат қилинг ёки кейинроқ уриниб кўринг.',
    ru: 'Ошибка при регистрации. Обратитесь в тех. поддержку или повторите позже.'
  },
  'auth.register': { uz: 'Ro\'yxatdan o\'tish', 'uz-cyrl': 'Рўйхатдан ўтиш', ru: 'Регистрация' },
  'auth.fullName': { uz: 'To\'liq ism', 'uz-cyrl': 'Тўлиқ исм', ru: 'Полное имя' },
  'auth.fullNamePlaceholder': {
    uz: 'To\'liq ismingizni kiriting',
    'uz-cyrl': 'Тўлиқ исмингизни киритинг',
    ru: 'Введите полное имя'
  },
  'auth.nameMinLength': {
    uz: 'Ism kamida 2 belgidan iborat bo\'lishi kerak',
    'uz-cyrl': 'Исм камида 2 белгидан иборат бўлиши керак',
    ru: 'Имя должно содержать минимум 2 символа'
  },
  'auth.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'auth.selectPosition': { uz: 'Lavozimni tanlang', 'uz-cyrl': 'Лавозимни танланг', ru: 'Выберите должность' },
  'auth.branch': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'auth.selectBranch': { uz: 'GTFni tanlang', 'uz-cyrl': 'ГТФни танланг', ru: 'Выберите ГТФ' },
  'auth.noAccount': { uz: 'Hisobingiz yo\'qmi?', 'uz-cyrl': 'Ҳисобингиз йўқми?', ru: 'Нет аккаунта?' },
  'auth.haveAccount': { uz: 'Hisobingiz bormi?', 'uz-cyrl': 'Ҳисобингиз борми?', ru: 'Есть аккаунт?' },
  'auth.optional': { uz: 'ixtiyoriy', 'uz-cyrl': 'ихтиёрий', ru: 'необязательно' },
  'auth.fetch': { uz: 'Yuklash', 'uz-cyrl': 'Юклаш', ru: 'Загрузить' },
  'auth.pinflEmpty': { uz: 'PINFL raqamini kiriting', 'uz-cyrl': 'PINFL рақамини киритинг', ru: 'Введите номер PINFL' },
  'auth.pinflNotFound': { uz: 'PINFL bo\'yicha foydalanuvchi topilmadi', 'uz-cyrl': 'PINFL бўйича фойдаланувчи топилмади', ru: 'Пользователь с таким PINFL не найден' },

  // Additional Information Form
  'additionalInfo.title': { uz: 'Qo\'shimcha ma\'lumot', 'uz-cyrl': 'Қўшимча маълумот', ru: 'Дополнительная информация' },
  'additionalInfo.name': { uz: 'Ism', 'uz-cyrl': 'Исм', ru: 'Имя' },
  'additionalInfo.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'additionalInfo.gasType': { uz: 'Gaz turi', 'uz-cyrl': 'Газ тури', ru: 'Gaz turi' },
  'additionalInfo.region': { uz: 'Qaysi viloyat', 'uz-cyrl': 'Қайси вилоят', ru: 'Какой регион' },
  'additionalInfo.namePlaceholder': { uz: 'Mardon', 'uz-cyrl': 'Мардон', ru: 'Mardon' },
  'additionalInfo.positionPlaceholder': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'additionalInfo.naturalGas': { uz: 'Tabiiy gaz', 'uz-cyrl': 'Табиий газ', ru: 'Tabiy gaz' },
  'additionalInfo.tashkent': { uz: 'Toshkent', 'uz-cyrl': 'Тошкент', ru: 'Ташкент' },
  'additionalInfo.enter': { uz: 'Kirish', 'uz-cyrl': 'Кириш', ru: 'Войти' },
  'additionalInfo.nameRequired': { uz: 'Ism kiritilishi shart', 'uz-cyrl': 'Исм киритилиши шарт', ru: 'Имя обязательно' },
  'additionalInfo.positionRequired': {
    uz: 'Lavozim tanlanishi shart',
    'uz-cyrl': 'Лавозим танланиши шарт',
    ru: 'Должность обязательна'
  },
  'additionalInfo.gasTypeRequired': {
    uz: 'Gaz turi tanlanishi shart',
    'uz-cyrl': 'Газ тури танланиши шарт',
    ru: 'Тип газа обязателен'
  },
  'additionalInfo.regionRequired': {
    uz: 'Viloyat tanlanishi shart',
    'uz-cyrl': 'Вилоят танланиши шарт',
    ru: 'Регион обязателен'
  },

  // Settings Modal
  'settings.title': { uz: 'Sozlamalar', 'uz-cyrl': 'Созламалар', ru: 'Настройки' },
  'settings.fullName': { uz: 'To\'liq ism', 'uz-cyrl': 'Тўлиқ исм', ru: 'ФИО' },
  'settings.branch': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'settings.position': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'settings.fullNamePlaceholder': { uz: 'To\'liq ism', 'uz-cyrl': 'Тўлиқ исм', ru: 'ФИО' },
  'settings.branchPlaceholder': { uz: 'GTF', 'uz-cyrl': 'ГТФ', ru: 'ГТФ' },
  'settings.positionPlaceholder': { uz: 'Lavozim', 'uz-cyrl': 'Лавозим', ru: 'Должность' },
  'settings.save': { uz: 'Saqlash', 'uz-cyrl': 'Сақлаш', ru: 'Сохранить' },
  'settings.logout': { uz: 'Hisobdan chiqish', 'uz-cyrl': 'Ҳисобдан чиқиш', ru: 'Выйти' },
  'settings.fullNameRequired': {
    uz: 'To\'liq ism kiritilishi shart',
    'uz-cyrl': 'Тўлиқ исм киритилиши шарт',
    ru: 'ФИО обязательно'
  },
  'settings.branchRequired': {
    uz: 'GTF tanlanishi shart',
    'uz-cyrl': 'ГТФ танланиши шарт',
    ru: 'ГТФ обязателен'
  },
  'settings.positionRequired': {
    uz: 'Lavozim tanlanishi shart',
    'uz-cyrl': 'Лавозим танланиши шарт',
    ru: 'Должность обязательна'
  },
  'settings.saveSuccess': {
    uz: 'Ma\'lumotlar muvaffaqiyatli saqlandi',
    'uz-cyrl': 'Маълумотлар муваффақиятли сақланди',
    ru: 'Данные успешно сохранены'
  },
  'settings.saveError': {
    uz: 'Ma\'lumotlarni saqlashda xatolik',
    'uz-cyrl': 'Маълумотларни сақлашда хато',
    ru: 'Ошибка при сохранении данных'
  },
  'settings.employeeLevelRequired': {
    uz: 'Ishchi darajasi tanlanishi shart',
    'uz-cyrl': 'Ишчи даражаси танланиши шарт',
    ru: 'Уровень сотрудника обязателен'
  },
  'settings.workDomainRequired': {
    uz: 'Gaz turi tanlanishi shart',
    'uz-cyrl': 'Газ тури танланиши шарт',
    ru: 'Тип газа обязателен'
  },
  'settings.employeeLevel': {
    uz: 'Ishchi darajasi',
    'uz-cyrl': 'Ишчи даражаси',
    ru: 'Уровень сотрудника'
  },
  'settings.workDomain': {
    uz: 'Gaz turi',
    'uz-cyrl': 'Газ тури',
    ru: 'Тип газа'
  },
  'settings.selectPosition': {
    uz: 'Lavozimni tanlang',
    'uz-cyrl': 'Лавозимни танланг',
    ru: 'Выберите должность'
  },
  'settings.selectAdministration': {
    uz: 'GTFni tanlang',
    'uz-cyrl': 'ГТФни танланг',
    ru: 'Выберите ГТФ'
  },

  // Administration Options
  'admin.administration1': {
    uz: 'GTF',
    'uz-cyrl': 'ГТФ',
    ru: 'ГТФ'
  },
  'admin.administration2': {
    uz: 'GTF 2',
    'uz-cyrl': 'ГТФ 2',
    ru: 'ГТФ 2'
  },
  'admin.administration3': {
    uz: 'GTF 3',
    'uz-cyrl': 'ГТФ 3',
    ru: 'ГТФ 3'
  },

  // Position Options
  'position.position1': {
    uz: 'Lavozim 1',
    'uz-cyrl': 'Лавозим 1',
    ru: 'Должность 1'
  },
  'position.position2': {
    uz: 'Lavozim 2',
    'uz-cyrl': 'Лавозим 2',
    ru: 'Должность 2'
  },
  'position.position3': {
    uz: 'Lavozim 3',
    'uz-cyrl': 'Лавозим 3',
    ru: 'Должность 3'
  },

  // Auth Layout
  'auth.contactSpecialist': {
    uz: 'Mutaxassis bilan bog\'lanish',
    'uz-cyrl': 'Мутахассис билан богланиш',
    ru: 'Связь со специалистом'
  },
  'auth.offer': {
    uz: 'Taklif',
    'uz-cyrl': 'Таклиф',
    ru: 'Оферта'
  },

  // DataTable
  'table.results': {
    uz: 'Natijalar',
    'uz-cyrl': 'Натижалар',
    ru: 'Результаты'
  },

  // Timer
  'timer.minutes': { uz: 'daq', 'uz-cyrl': 'дақ', ru: 'мин' },
  'timer.noTime': { uz: '--:--', 'uz-cyrl': '--:--', ru: '--:--' },
  'timer.expired': { uz: '00:00', 'uz-cyrl': '00:00', ru: '00:00' },

  // Question Card
  'question.number': { uz: 'Savol', 'uz-cyrl': 'Савол', ru: 'Вопрос' },
  'question.typeAnswer': { uz: 'Javobingizni yozing...', 'uz-cyrl': 'Жавобингизни ёзинг...', ru: 'Введите ваш ответ...' },

  // Job Positions
  'position.manager': { uz: 'Menejer', 'uz-cyrl': 'Менежер', ru: 'Менеджер' },
  'position.engineer': { uz: 'Muhandis', 'uz-cyrl': 'Муҳандис', ru: 'Инженер' },
  'position.technician': { uz: 'Texnik', 'uz-cyrl': 'Техник', ru: 'Техник' },
  'position.supervisor': { uz: 'Nazoratchi', 'uz-cyrl': 'Назоратчи', ru: 'Супервайзер' },
  'position.operator': { uz: 'Operator', 'uz-cyrl': 'Оператор', ru: 'Оператор' },
  'position.specialist': { uz: 'Mutaxassis', 'uz-cyrl': 'Мутахассис', ru: 'Специалист' },
  'position.analyst': { uz: 'Tahlilchi', 'uz-cyrl': 'Таҳлилчи', ru: 'Аналитик' },

  // Regions
  'region.tashkent': { uz: 'Toshkent', 'uz-cyrl': 'Тошкент', ru: 'Ташкент' },
  'region.samarkand': { uz: 'Samarqand', 'uz-cyrl': 'Самарқанд', ru: 'Самарканд' },
  'region.bukhara': { uz: 'Buxoro', 'uz-cyrl': 'Бухоро', ru: 'Бухара' },
  'region.namangan': { uz: 'Namangan', 'uz-cyrl': 'Наманган', ru: 'Наманган' },
  'region.andijan': { uz: 'Andijon', 'uz-cyrl': 'Андижон', ru: 'Андижан' },
  'region.fergana': { uz: 'Farg\'ona', 'uz-cyrl': 'Фарғона', ru: 'Фергана' },
  'region.kashkadarya': { uz: 'Qashqadaryo', 'uz-cyrl': 'Қашқадарё', ru: 'Кашкадарья' },
  'region.surkhandarya': { uz: 'Surxondaryo', 'uz-cyrl': 'Сурхондарё', ru: 'Сурхандарья' },
  'region.khorezm': { uz: 'Xorazm', 'uz-cyrl': 'Хоразм', ru: 'Хорезм' },
  'region.karakalpakstan': { uz: 'Qoraqalpog\'iston', 'uz-cyrl': 'Қорақалпоғистон', ru: 'Каракалпакстан' },
  'region.jizzakh': { uz: 'Jizzax', 'uz-cyrl': 'Жиззах', ru: 'Джизак' },
  'region.sirdarya': { uz: 'Sirdaryo', 'uz-cyrl': 'Сирдарё', ru: 'Сырдарья' },
  'region.tashkentRegion': { uz: 'Toshkent viloyati', 'uz-cyrl': 'Тошкент вилояти', ru: 'Ташкентская область' },

  // Progress Bar
  'progress.iqQuestions': { uz: 'IQ savollari', 'uz-cyrl': 'IQ саволлари', ru: 'IQ вопросы' },
  'progress.mainQuestions': { uz: 'Asosiy savollar', 'uz-cyrl': 'Асосий саволлар', ru: 'Основные вопросы' },
  'progress.additionalQuestions': {
    uz: 'Qo\'shimcha savollar',
    'uz-cyrl': 'Қўшимча саволлар',
    ru: 'Дополнительные вопросы'
  },
  'progress.regionalGasSupply': {
    uz: 'Hududiy Gaz Ta\'minotiga aloqadar',
    'uz-cyrl': 'Ҳудудий Газ Таъминотига алоқадар',
    ru: 'Связано с региональным газоснабжением'
  },
};

type I18nContextValue = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: keyof typeof dictionary | string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: FC<{ children: ReactNode; }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('uz');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as LanguageCode | null;
    if (stored === 'uz' || stored === 'uz-cyrl' || stored === 'ru') setLangState(stored);
  }, []);

  const setLang = (l: LanguageCode) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key, params) => {
      const dictionaryEntry = dictionary?.[key as keyof typeof dictionary];
      let text = dictionaryEntry?.[lang] ?? (typeof key === 'string' ? key : '');
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


