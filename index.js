const { Telegraf } = require("telegraf");
const axios = require("axios");
const cc = require("currency-codes");

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "6445975625:AAHew3zIWohR7B5PnLHKTzJkt8TJhqoQMv4";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  return ctx.reply("Добро пожаловать!");
});

bot.hears(/^[A-Z]+$/i, (ctx) => {
  const currency = cc.code(ctx.message.text);
  if (!currency) {
    return ctx.reply("Валюта не найдена!");
  }
  axios
    .get("https://www.cbr-xml-daily.ru/daily_json.js")
    .then((res) => {
      const foundCurrency = res.data.Valute.find((cur) => {
        return cur.NumCode === currency.number;
      });
      return ctx.reply(foundCurrency);
    })
    .catch((err) => {
      return ctx.reply(err);
    });
});

bot.startPolling();
