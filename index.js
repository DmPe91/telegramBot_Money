const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const utils = require("./utils");
const axios = require("axios");
const cc = require("currency-codes");
const convert = require("xml-js");

const dec = new TextDecoder("windows-1251");
let valute_rates;
let date_rates;
let sum, variant;
const valute_Api = async () => {
  await axios
    .get("http://www.cbr.ru/scripts/XML_daily.asp", {
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    .then((res) => {
      const dec_valute = dec.decode(Buffer.from(res.data));
      var valute = convert.xml2js(dec_valute, { compact: true });
      date_rates = valute.ValCurs._attributes.Date;
      valute_rates = valute.ValCurs.Valute;
    })
    .catch((err) => {
      console.log(err);
      return ctx.reply("error");
    });
};
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.reply(
    `Добро пожаловать, ${
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

bot.hears("Курс валют", (ctx) => {
  valute_Api().then(() => {
    const test_arr = valute_rates.map((el) => {
      return [
        {
          text: `${el.CharCode._text} ${el.Name._text}`,
          callback_data: el.CharCode._text,
        },
      ];
    });
    ctx.reply(`Акутальный курс ЦБ РФ ${date_rates}.Выберите валюту:`, {
      reply_markup: { inline_keyboard: test_arr },
    });
  });
});
bot.hears("Конвертер валют", (ctx) => {
  ctx.reply("Конвертировать во что", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "В рубли", callback_data: "rub" },
          { text: "В валюту", callback_data: "val" },
        ],
      ],
    },
  });
});
bot.action("rub", (ctx) => {
  variant = "rub";
  ctx.reply("Введите сумму");
});
bot.action("val", (ctx) => {
  variant = "val";
  ctx.reply("Введите сумму");
});
bot.hears(/[\d.,]*$/, (ctx) => {
  sum = ctx.message.text;
  valute_Api().then(() => {
    const test_arr = valute_rates.map((el) => {
      return [
        {
          text: `${el.CharCode._text} ${el.Name._text}`,
          callback_data: el.CharCode._text,
        },
      ];
    });
    ctx.reply(`Выберите валюту:`, {
      reply_markup: { inline_keyboard: test_arr },
    });
  });
});

bot.action(/^[A-Z]+$/i, (ctx) => {
  const currency = cc.code(ctx.update.callback_query.data);

  if (!currency) {
    return ctx.reply("Валюта не найдена!Воспользуйтес меню");
  }
  axios
    .get("https://www.cbr-xml-daily.ru/daily_json.js")
    .then((res) => {
      const valute = res.data.Valute;

      for (let key in valute) {
        if (valute[key].NumCode === currency.number) {
          console.log(Number(valute[key].Value));
          sum = Number(sum);

          if (variant === "rub") {
            var result = sum * (valute[key].Value / valute[key].Nominal);
            variant = "";
            return ctx.reply(
              `${result} рублей  в ${sum} ${valute[key].CharCode}`
            );
          }
          if (variant === "val") {
            var result = (1 / (valute[key].Value / valute[key].Nominal)) * sum;
            variant = "";
            return ctx.reply(
              `${result} ${valute[key].CharCode} в ${sum} в рублях`
            );
          } else {
            return ctx.reply(
              String(`1 ${valute[key].CharCode} = ${valute[key].Value} рублей`)
            );
          }
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
