# Pre-lander Factory

Фабрика прокладок (pre-lander) для арбитража трафика в нише нутра/e-com. 7 форматов, одна система.

## Стек

- **Astro** — статический генератор сайтов
- **Tailwind CSS v4** — стилизация
- **Sveltia CMS** — Git-based админка по адресу `/admin/`
- **Cloudflare Pages** — хостинг (безлимитный трафик)
- **GitHub Actions** — AI-агенты для генерации контента

## 7 форматов прокладок

| Формат | URL | Описание |
|--------|-----|----------|
| **Quiz-funnel** | `/quiz/[slug]` | 4-7 вопросов → персональная рекомендация → оффер |
| **Longread / Статья** | `/article/[slug]` | Экспертная статья с CTA в конце |
| **Сравнение продуктов** | `/comparison/[slug]` | Таблица, плюсы/минусы, рейтинги |
| **Обзор продукта** | `/review/[slug]` | Детальный обзор с рейтингом и вердиктом |
| **Калькулятор / Тест** | `/calculator/[slug]` | Интерактивный расчёт → рекомендация |
| **FAQ** | `/faq/[slug]` | Ответы на возражения (с JSON-LD FAQPage) |
| **Story** | `/story/[slug]` | История человека (с дисклеймером) |

## Быстрый старт

```bash
npm install
npm run dev     # Dev-сервер на localhost:4321
npm run build   # Сборка в dist/
npm run preview # Превью сборки
```

## Структура контента

```
src/content/
├── quiz/           # JSON-файлы квизов
├── articles/       # Markdown-статьи
├── comparisons/    # JSON-сравнения продуктов
├── reviews/        # Markdown-обзоры
├── calculators/    # JSON-калькуляторы
├── faqs/           # JSON FAQ-страницы
└── stories/        # Markdown-истории
```

## CMS-админка

Доступна по адресу `/admin/` (Sveltia CMS). Для работы нужен GitHub OAuth.

Конфиг: `public/admin/config.yml` — измените `repo` на ваш репозиторий.

## AI-агенты (GitHub Actions)

### Генератор контента
Запускается вручную через Actions → `AI Content Generator`:
- Выбираешь тип (article/quiz/comparison/review/faq/story)
- Указываешь тему, язык, URL оффера
- Агент генерит контент через Gemini API и коммитит в репо

### SEO-агент
Автоматически запускается при пуше в `src/content/`:
- Проверяет meta-теги, alt-тексты
- Предлагает улучшения

### A/B-вариатор
Запускается вручную:
- Указываешь путь к контенту и количество вариаций
- Генерирует N версий заголовка/CTA для тестов

## Трекинг

Каждая прокладка поддерживает интеграцию с трекерами (Keitaro, Binom, RedTrack, BeMob):

- Автоматический захват параметров: `click_id`, `sub1-sub5`, UTM-метки
- Все CTA-кнопки используют `data-offer-link` — клик редиректит на оффер с параметрами
- Настройка: поля `offerUrl` и `trackerId` в каждом контенте

## Деплой на Cloudflare Pages

1. Подключите репо к Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node.js version: `22`

## Secrets для GitHub Actions

| Secret | Назначение |
|--------|-----------|
| `GEMINI_API_KEY` | Google Gemini API для AI-агентов |

Получить ключ: https://aistudio.google.com/app/apikey

## Лицензия

MIT
