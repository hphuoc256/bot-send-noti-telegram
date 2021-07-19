const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const Excel = require("exceljs");
const path = require("path");
const TelegramBot = require('node-telegram-bot-api');
const token = '1702199758:AAFDpG7Ku1Jzr1-FcGVPx-4WpM3BhTqfdx0';
const bot = new TelegramBot(token, {
    polling: true
});

app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const db = require('./knex/knex');

bot.on('message', async (msg) => {
    if (msg.text) {
        let text = msg.text.replace(/\s+/g, '');
        let check_type = msg.text.substring(0, msg.text.lastIndexOf(' '));
        let type = msg.text.substring(msg.text.lastIndexOf('_') + 1, msg.text.lastIndexOf(' '));
        let number = msg.text.substring(msg.text.lastIndexOf(' ') + 1);

        if (check_type == '/usdt_buy' || check_type == '/usdt_sell') {
            await db('bot_noti').insert({
                user_id: msg.from.id,
                type: type,
                value: type == 'buy' ? ' + ' + number : ' - ' + number
            });

            bot.sendMessage(msg.from.id, msg.from.last_name + " " + type + " " + number + " USDT");

        } else if (text == '/send') {
            let data = await db('bot_noti').select('*');
            try {
                var workbook = new Excel.Workbook();
                var worksheet = workbook.addWorksheet();

                worksheet.columns = [{
                        header: "id",
                        key: "id",
                        width: 10
                    },
                    {
                        header: "user_id",
                        key: "user_id",
                        width: 20
                    },
                    {
                        header: "type",
                        key: "type",
                        width: 15
                    },
                    {
                        header: "value",
                        key: "value",
                        width: 30
                    },
                    {
                        header: "created_at",
                        key: "created_at",
                        width: 20
                    }
                ];

                data.forEach(function (row) {
                    worksheet.addRow(row);
                });

                workbook.xlsx
                    .writeFile("newSave.xlsx")
                    .then(response => {
                        bot.sendDocument(msg.chat.id, path.join(__dirname, "./newSave.xlsx"));
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } catch (err) {
                console.log(err);
            }

        } else {
            bot.sendMessage(msg.from.id, "Not exist");
        }
    }
});

app.listen(process.env.APP_PORT, () => {
    console.log(`App running at port:${process.env.APP_PORT}`)
})