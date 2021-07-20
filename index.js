require('dotenv').config()

process.env.NTBA_FIX_319 = '1';

const Excel = require("exceljs");
const path = require("path");
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELE_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const db = require('./knex/knex');

(async function () {

    if (!bot.isPolling()) {
        const updates = await bot.getUpdates();
        console.log({updates})
    }
    const {sendData, run} = require('./cron');
    await run(bot)

    // Bắt đầu nhận tin nhắn từ GROUP
    bot.on('message', async (msg) => {
        if (msg.text) {
            try {
                let text = msg.text.replace(/\s+/g, '');
                let check_type = msg.text.substring(0, msg.text.lastIndexOf(' '));
                let type = msg.text.substring(msg.text.lastIndexOf('_') + 1, msg.text.lastIndexOf(' '));
                let number = msg.text.substring(msg.text.lastIndexOf(' ') + 1);
                number = parseFloat(number);
                if (check_type === '/usdt_buy' || check_type === '/usdt_sell') {
                    if (isNaN(number)) {
                        await bot.sendMessage(msg.chat.id, `Value must be a number`);
                        return;
                    }
                    await db('bot_noti').insert({
                        user_id: msg.from.id,
                        type: type,
                        value: number
                    });

                    const t = (msg.from.last_name + " " + msg.from.first_name) + ": Amplitude " + type + " " + number;
                    bot.sendMessage(msg.chat.id, t).then(v => {
                        console.log(`Gửi vào ${msg.chat.id} thành công`, t)
                        sendData(bot)
                    }).catch(e => {

                    });

                } else if (text === '/send') {
                    let data = await db('bot_noti').select('*');
                    const workbook = new Excel.Workbook();
                    const worksheet = workbook.addWorksheet();

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

                    await workbook.xlsx.writeFile("newSave.xlsx");
                    await bot.sendDocument(msg.chat.id, path.join(__dirname, "./newSave.xlsx"));

                } else {
                    // await bot.sendMessage(msg.from.id, "Not exist");
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    });
})()
