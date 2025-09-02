**Cursor**

Для понимания архитектуры и создания flow для frontend разработчика, мне нужно изучить текущие модели и API endpoints в
проекте.

Теперь я создам детальный flow для frontend разработчика, основываясь на изученной архитектуре системы опросов.

Позвольте исправить синтаксическую ошибку в диаграмме:

Теперь создам подробную документацию по использованию API:

## Flow для Frontend Разработчика: Система Прохождения Опросов

### Обзор системы

Система построена на основе Django REST Framework с JWT аутентификацией. Поддерживает многоязычность (узбекский
латинский, узбекский кириллический, русский) и различные типы вопросов.

### 1. Аутентификация и авторизация

#### 1.1 Отправка OTP кода

```http
POST /api/auth/send-otp/
Content-Type: application/json

{
  "phone_number": "+998901234567"
}

Response 200:
{
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

#### 1.2 Верификация OTP и получение токена

```http
POST /api/auth/verify-otp/
Content-Type: application/json

{
  "phone_number": "+998901234567",
  "otp_code": "123456"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Иван Иванов",
    "phone_number": "+998901234567",
    "branch": "Ташкент",
    "position": "Менеджер"
  }
}
```

### 2. Проверка активной сессии

При запуске приложения всегда проверяйте наличие активной сессии:

```http
GET /api/current-session/
Authorization: Bearer {access_token}

Response 200:
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "survey": {
      "id": 1,
      "title": "Тест по JavaScript",
      "time_limit_minutes": 60
    },
    "status": "in_progress",
    "expires_at": "2024-01-15T15:30:00Z",
    "time_remaining": 45,
    "current_question": {
      "question": {
        "id": 5,
        "question_type": "single",
        "text": "Что такое замыкание в JavaScript?",
        "choices": [...]
      }
    }
  }
}

// Если активной сессии нет:
{
  "session": null
}
```

### 3. Получение списка доступных опросов

```http
GET /api/surveys/?lang=ru
Authorization: Bearer {access_token}

Response 200:
[
  {
    "id": 1,
    "title": "Тест по JavaScript",
    "description": "Базовые вопросы по JavaScript",
    "time_limit_minutes": 60,
    "questions_count": 20,
    "passing_score": 70,
    "max_attempts": 3,
    "total_questions": 50,
    "user_attempts": 1,
    "can_start": true
  },
  {
    "id": 2,
    "title": "Тест по Python",
    "description": "Основы Python программирования",
    "time_limit_minutes": 45,
    "questions_count": 15,
    "passing_score": 75,
    "max_attempts": 2,
    "total_questions": 30,
    "user_attempts": 2,
    "can_start": false  // Превышен лимит попыток
  }
]
```

### 4. Получение деталей опроса

```http
GET /api/surveys/1/?lang=ru
Authorization: Bearer {access_token}

Response 200:
{
  "id": 1,
  "title": "Тест по JavaScript",
  "description": "Подробное описание теста...",
  "time_limit_minutes": 60,
  "questions_count": 20,
  "passing_score": 70,
  "max_attempts": 3,
  "total_questions": 50
}
```

### 5. Начало прохождения опроса

```http
POST /api/surveys/1/start/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "questions_count": 10,  // Опционально, по умолчанию берется из настроек опроса
  "language": "ru"        // Опционально, по умолчанию "uz"
}

Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "survey": {
    "id": 1,
    "title": "Тест по JavaScript"
  },
  "status": "in_progress",
  "attempt_number": 2,
  "started_at": "2024-01-15T14:30:00Z",
  "expires_at": "2024-01-15T15:30:00Z",
  "language": "ru",
  "progress": {
    "total_questions": 10,
    "answered_questions": 0,
    "remaining_questions": 10,
    "progress_percentage": 0
  },
  "time_remaining": 60,
  "current_question": {
    "question": {
      "id": 5,
      "question_type": "single",
      "text": "Что такое замыкание в JavaScript?",
      "points": 5,
      "choices": [
        {
          "id": 15,
          "text": "Функция внутри другой функции",
          "order": 1
        },
        {
          "id": 16,
          "text": "Способ скрыть переменные",
          "order": 2
        }
      ]
    },
    "order": 1,
    "is_answered": false
  }
}

// Ошибка при превышении лимита попыток:
Response 400:
{
  "non_field_errors": [
    "Maximum attempts reached. Contact moderator for permission to retake."
  ]
}
```

### 6. Отправка ответа на вопрос

#### 6.1 Одиночный выбор

```http
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 5,
  "choice_ids": [15]
}
```

#### 6.2 Множественный выбор

```http
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 6,
  "choice_ids": [18, 20, 22]
}
```

#### 6.3 Открытый ответ

```http
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 7,
  "text_answer": "Замыкание - это способность функции обращаться к переменным из внешней области видимости даже после того, как внешняя функция завершила выполнение."
}
```

#### Ответ при промежуточном вопросе:

```http
Response 200:
{
  "message": "Answer submitted successfully",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "progress": {
      "total_questions": 10,
      "answered_questions": 1,
      "remaining_questions": 9,
      "progress_percentage": 10
    },
    "current_question": {
      "question": {
        "id": 8,
        "question_type": "multiple",
        "text": "Какие из следующих являются типами данных в JavaScript?"
      }
    }
  }
}
```

#### Ответ при последнем вопросе:

```http
Response 200:
{
  "message": "Survey completed",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "score": 42,
    "total_points": 50,
    "percentage": 84.0,
    "is_passed": true
  },
  "final_score": {
    "score": 42,
    "total_points": 50,
    "percentage": 84.0,
    "is_passed": true
  }
}
```

### 7. Получение детальной информации о сессии

```http
GET /api/sessions/550e8400-e29b-41d4-a716-446655440000/
Authorization: Bearer {access_token}

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "survey": {
    "id": 1,
    "title": "Тест по JavaScript"
  },
  "status": "in_progress",
  "attempt_number": 2,
  "started_at": "2024-01-15T14:30:00Z",
  "expires_at": "2024-01-15T15:30:00Z",
  "language": "ru",
  "progress": {
    "total_questions": 10,
    "answered_questions": 3,
    "remaining_questions": 7,
    "progress_percentage": 30
  },
  "time_remaining": 45,
  "current_question": {
    "question": {
      "id": 12,
      "question_type": "open",
      "text": "Объясните разницу между var, let и const"
    },
    "order": 4,
    "is_answered": false
  },
  "score": null,
  "total_points": null,
  "percentage": null,
  "is_passed": null
}
```

### 8. Отмена сессии

```http
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/cancel/
Authorization: Bearer {access_token}

Response 200:
{
  "message": "Session cancelled successfully",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

### 9. Получение истории прохождения

```http
GET /api/surveys/my_history/
Authorization: Bearer {access_token}

Response 200:
[
  {
    "survey": {
      "id": 1,
      "title": "Тест по JavaScript"
    },
    "total_attempts": 2,
    "best_score": 42,
    "best_percentage": 84.0,
    "last_attempt_at": "2024-01-15T14:30:00Z",
    "is_passed": true,
    "current_status": "completed",
    "can_continue": true
  }
]
```

### 10. Получение прогресса сессии

```http
GET /api/sessions/550e8400-e29b-41d4-a716-446655440000/progress/
Authorization: Bearer {access_token}

Response 200:
{
  "progress": {
    "total_questions": 10,
    "answered_questions": 3,
    "remaining_questions": 7,
    "progress_percentage": 30
  },
  "questions": [
    {
      "order": 1,
      "question_id": 5,
      "is_answered": true,
      "points_earned": 5,
      "max_points": 5,
      "answer": {
        "id": 15,
        "selected_choices": [
          {
            "id": 15,
            "text": "Функция внутри другой функции"
          }
        ],
        "is_correct": true,
        "points_earned": 5
      }
    },
    {
      "order": 2,
      "question_id": 6,
      "is_answered": false,
      "points_earned": 0,
      "max_points": 3,
      "answer": null
    }
  ],
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "in_progress"
  }
}
```

### Важные моменты для Frontend

1. **Управление состоянием**: Всегда проверяйте статус сессии при загрузке приложения
2. **Таймер**: Отслеживайте `time_remaining` и автоматически завершайте сессию при истечении времени
3. **Статусы сессии**: `started`, `in_progress`, `completed`, `expired`, `cancelled`
4. **Обработка ошибок**: Проверяйте превышение лимита попыток и истечение сессии
5. **Многоязычность**: Используйте параметр `lang` для получения контента на нужном языке
6. **Типы вопросов**: Корректно обрабатывайте `single`, `multiple`, `open` типы
7. **JWT токены**: Обновляйте токены по мере необходимости

```plaintext
POST /api/auth/send-otp/
Content-Type: application/json

{
  "phone_number": "+998901234567"
}

Response 200:
{
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

```plaintext
POST /api/auth/verify-otp/
Content-Type: application/json

{
  "phone_number": "+998901234567",
  "otp_code": "123456"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Иван Иванов",
    "phone_number": "+998901234567",
    "branch": "Ташкент",
    "position": "Менеджер"
  }
}
```

```plaintext
GET /api/current-session/
Authorization: Bearer {access_token}

Response 200:
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "survey": {
      "id": 1,
      "title": "Тест по JavaScript",
      "time_limit_minutes": 60
    },
    "status": "in_progress",
    "expires_at": "2024-01-15T15:30:00Z",
    "time_remaining": 45,
    "current_question": {
      "question": {
        "id": 5,
        "question_type": "single",
        "text": "Что такое замыкание в JavaScript?",
        "choices": [...]
      }
    }
  }
}

// Если активной сессии нет:
{
  "session": null
}
```

```plaintext
GET /api/surveys/?lang=ru
Authorization: Bearer {access_token}

Response 200:
[
  {
    "id": 1,
    "title": "Тест по JavaScript",
    "description": "Базовые вопросы по JavaScript",
    "time_limit_minutes": 60,
    "questions_count": 20,
    "passing_score": 70,
    "max_attempts": 3,
    "total_questions": 50,
    "user_attempts": 1,
    "can_start": true
  },
  {
    "id": 2,
    "title": "Тест по Python",
    "description": "Основы Python программирования",
    "time_limit_minutes": 45,
    "questions_count": 15,
    "passing_score": 75,
    "max_attempts": 2,
    "total_questions": 30,
    "user_attempts": 2,
    "can_start": false  // Превышен лимит попыток
  }
]
```

```plaintext
GET /api/surveys/1/?lang=ru
Authorization: Bearer {access_token}

Response 200:
{
  "id": 1,
  "title": "Тест по JavaScript",
  "description": "Подробное описание теста...",
  "time_limit_minutes": 60,
  "questions_count": 20,
  "passing_score": 70,
  "max_attempts": 3,
  "total_questions": 50
}
```

```plaintext
POST /api/surveys/1/start/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "questions_count": 10,  // Опционально, по умолчанию берется из настроек опроса
  "language": "ru"        // Опционально, по умолчанию "uz"
}

Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "survey": {
    "id": 1,
    "title": "Тест по JavaScript"
  },
  "status": "in_progress",
  "attempt_number": 2,
  "started_at": "2024-01-15T14:30:00Z",
  "expires_at": "2024-01-15T15:30:00Z",
  "language": "ru",
  "progress": {
    "total_questions": 10,
    "answered_questions": 0,
    "remaining_questions": 10,
    "progress_percentage": 0
  },
  "time_remaining": 60,
  "current_question": {
    "question": {
      "id": 5,
      "question_type": "single",
      "text": "Что такое замыкание в JavaScript?",
      "points": 5,
      "choices": [
        {
          "id": 15,
          "text": "Функция внутри другой функции",
          "order": 1
        },
        {
          "id": 16,
          "text": "Способ скрыть переменные",
          "order": 2
        }
      ]
    },
    "order": 1,
    "is_answered": false
  }
}

// Ошибка при превышении лимита попыток:
Response 400:
{
  "non_field_errors": [
    "Maximum attempts reached. Contact moderator for permission to retake."
  ]
}
```

```plaintext
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 5,
  "choice_ids": [15]
}
```

```plaintext
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 6,
  "choice_ids": [18, 20, 22]
}
```

```plaintext
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/submit_answer/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 7,
  "text_answer": "Замыкание - это способность функции обращаться к переменным из внешней области видимости даже после того, как внешняя функция завершила выполнение."
}
```

```plaintext
Response 200:
{
  "message": "Answer submitted successfully",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "progress": {
      "total_questions": 10,
      "answered_questions": 1,
      "remaining_questions": 9,
      "progress_percentage": 10
    },
    "current_question": {
      "question": {
        "id": 8,
        "question_type": "multiple",
        "text": "Какие из следующих являются типами данных в JavaScript?"
      }
    }
  }
}
```

```plaintext
Response 200:
{
  "message": "Survey completed",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "score": 42,
    "total_points": 50,
    "percentage": 84.0,
    "is_passed": true
  },
  "final_score": {
    "score": 42,
    "total_points": 50,
    "percentage": 84.0,
    "is_passed": true
  }
}
```

```plaintext
GET /api/sessions/550e8400-e29b-41d4-a716-446655440000/
Authorization: Bearer {access_token}

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "survey": {
    "id": 1,
    "title": "Тест по JavaScript"
  },
  "status": "in_progress",
  "attempt_number": 2,
  "started_at": "2024-01-15T14:30:00Z",
  "expires_at": "2024-01-15T15:30:00Z",
  "language": "ru",
  "progress": {
    "total_questions": 10,
    "answered_questions": 3,
    "remaining_questions": 7,
    "progress_percentage": 30
  },
  "time_remaining": 45,
  "current_question": {
    "question": {
      "id": 12,
      "question_type": "open",
      "text": "Объясните разницу между var, let и const"
    },
    "order": 4,
    "is_answered": false
  },
  "score": null,
  "total_points": null,
  "percentage": null,
  "is_passed": null
}
```

```plaintext
POST /api/sessions/550e8400-e29b-41d4-a716-446655440000/cancel/
Authorization: Bearer {access_token}

Response 200:
{
  "message": "Session cancelled successfully",
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

```plaintext
GET /api/surveys/my_history/
Authorization: Bearer {access_token}

Response 200:
[
  {
    "survey": {
      "id": 1,
      "title": "Тест по JavaScript"
    },
    "total_attempts": 2,
    "best_score": 42,
    "best_percentage": 84.0,
    "last_attempt_at": "2024-01-15T14:30:00Z",
    "is_passed": true,
    "current_status": "completed",
    "can_continue": true
  }
]
```

```plaintext
GET /api/sessions/550e8400-e29b-41d4-a716-446655440000/progress/
Authorization: Bearer {access_token}

Response 200:
{
  "progress": {
    "total_questions": 10,
    "answered_questions": 3,
    "remaining_questions": 7,
    "progress_percentage": 30
  },
  "questions": [
    {
      "order": 1,
      "question_id": 5,
      "is_answered": true,
      "points_earned": 5,
      "max_points": 5,
      "answer": {
        "id": 15,
        "selected_choices": [
          {
            "id": 15,
            "text": "Функция внутри другой функции"
          }
        ],
        "is_correct": true,
        "points_earned": 5
      }
    },
    {
      "order": 2,
      "question_id": 6,
      "is_answered": false,
      "points_earned": 0,
      "max_points": 3,
      "answer": null
    }
  ],
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "in_progress"
  }
}
```

## Заключение

Я создал полный flow для frontend разработчика системы прохождения опросов. Вот что включено:

### 📊 Диаграмма Flow

Визуальная схема показывает полный пользовательский путь от авторизации до завершения опроса, включая все возможные
сценарии и API вызовы.

### 📝 Детальная документация API

**Ключевые особенности системы:**

1. **Аутентификация через OTP** - безопасная авторизация по номеру телефона
2. **Управление сессиями** - система отслеживает активные попытки прохождения
3. **Многоязычность** - поддержка узбекского (латиница/кириллица) и русского языков
4. **Типы вопросов** - одиночный выбор, множественный выбор, открытые ответы
5. **Система ограничений** - лимит попыток, время прохождения, возможность повторного прохождения через модератора

**Основные endpoints для frontend:**

- `/api/auth/send-otp/` и `/api/auth/verify-otp/` - авторизация
- `/api/current-session/` - проверка активной сессии
- `/api/surveys/` - список доступных опросов
- `/api/surveys/{id}/start/` - начало прохождения
- `/api/sessions/{id}/submit_answer/` - отправка ответов
- `/api/sessions/{id}/cancel/` - отмена сессии
- `/api/surveys/my_history/` - история прохождений

**Важные моменты для реализации:**

- Обязательная проверка активной сессии при запуске
- Корректная обработка таймеров и истечения времени
- Управление состояниями сессии
- Обработка ошибок и ограничений
- Поддержка различных типов вопросов

Этот flow обеспечивает полное понимание архитектуры и позволит frontend разработчику эффективно интегрироваться с
backend API.

