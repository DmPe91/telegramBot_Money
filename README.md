# Telegram Bot: Курс валют

Telegram-бот, который выдаёт актуальный курс валют и конвертирует суммы в рубли и обратно.

## Стек

- Node.js
- Telegraf.js
- Axios
- Currency-Codes
- xml-js
- Dotenv

## Возможности

- Актуальный курс валют (данные с API ЦБ РФ, обновляются ежедневно)
- Конвертация валют в рубли
- Конвертация рублей в валюту

## Запуск

```bash
git clone git@github.com:DmPe91/telegramBot_Money.git
cd telegramBot_Money
npm install
```

Создай `.env`:

```
BOT_TOKEN=твой_токен_от_BotFather
```

Запуск:

```bash
npm start
```

## Лицензия

MIT
