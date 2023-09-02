const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const utils = require("./utils");
const axios = require("axios");
const cc = require("currency-codes");
const convert = require("xml-js");
const dec = new TextDecoder("windows-1251");

const valute_Api = () => {
  axios
    .get("http://www.cbr.ru/scripts/XML_daily.asp", {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then((res) => {
      const dec_valute = dec.decode(Buffer.from(res.data));
      var valute = convert.xml2js(dec_valute, { compact: true });

      return valute.ValCurs.Valute;
    })
    .catch((err) => {
      console.log(err);
      return ctx.reply("error");
    });
};
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.reply(
    `Добро пожаловать ${
      ctx.message.from.first_name
        ? ctx.message.from.first_name
        : "пользователь без имени"
    }! Ниже появятся кнопки для получения курса валют и конвертации любой суммы рубля`,
    Markup.keyboard([["Курс валют", "Конвертер валют"]])
  );
});

bot.help((ctx) => {
  ctx.reply(utils.commands);
});

bot.hears("Курс валют", async (ctx) => {
  const valute = valute_Api;
  await console.log(valute);
  ctx.reply("Выберите валюту");
});

bot.hears("hi", (ctx) => {
  axios
    .get("http://www.cbr.ru/scripts/XML_daily.asp", {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then((res) => {
      const dec_valute = dec.decode(Buffer.from(res.data));
      var valute = convert.xml2js(dec_valute, { compact: true });
      console.log(valute.ValCurs.Valute[0]);

      ctx.reply(valute.ValCurs.Valute[0].Name._text);
    })
    .catch((err) => {
      console.log(err);
      return ctx.reply("error");
    });
});

bot.hears(/^[A-Z]+$/i, (ctx) => {
  const currency = cc.code(ctx.message.text);

  if (!currency) {
    return ctx.reply("Валюта не найдена!");
  }
  axios
    .get("https://www.cbr-xml-daily.ru/daily_json.js")
    .then((res) => {
      const valute = res.data.Valute;
      for (let key in valute) {
        if (valute[key].NumCode === currency.number) {
          return ctx.reply(String(valute[key].Value));
        }
      }
    })
    .catch((err) => {
      return ctx.reply(err);
    });
});
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
