/**
 * Выполняется ПЕРЕД каждым тест-файлом, до любых импортов модулей.
 * Задаёт переменные окружения, необходимые для безопасного запуска приложения в тестах.
 */

// Обязательные переменные — без них env.ts выбросит ошибку
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long!!';
process.env.DATABASE_PATH = ':memory:';
process.env.NODE_ENV = 'test';

// Ускоряем bcrypt для тестов (1 раунд вместо 10)
process.env.BCRYPT_ROUNDS = '1';

// Отключаем CORS-ограничения в тестах
process.env.ALLOWED_ORIGINS = '';
