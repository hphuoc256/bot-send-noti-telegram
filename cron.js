require('dotenv').config()

process.env.NTBA_FIX_319 = '1';

const schedule = require('node-schedule');
const request = require('request');

const API_URL_OTC = process.env.API_URL_OTC
const VOLUME = process.env.API_VOLUME;

const db = require('./knex/knex');


let buy_referencePrice_old = 0;
let buy_price_old = 0;
let sell_referencePrice_old = 0;
let sell_price_old = 0;

const ID_TELEGRAM = process.env.ID_TELEGRAM;
const ID_TELEGRAM_OTC_TIMEBIT = process.env.ID_TELEGRAM_OTC_TIMEBIT;
const ID_TELEGRAM_OTC_EPLUS = process.env.ID_TELEGRAM_OTC_EPLUS;

let chat_id = [ID_TELEGRAM, ID_TELEGRAM_OTC_EPLUS, ID_TELEGRAM_OTC_TIMEBIT];

const everyMinute = async function (bot) {

    let sell_otc = await db("bot_noti").orderBy('created_at', 'desc').where({type: 'sell'}).first();
    let buy_otc = await db("bot_noti").orderBy('created_at', 'desc').where({type: 'buy'}).first();
    let sell_otc_value = sell_otc && sell_otc.value ? parseFloat((sell_otc.value + '').trim()) : 0;
    let buy_otc_value = buy_otc && buy_otc.value ? parseFloat((buy_otc.value + '').trim()) : 0;

    request({
        method: "GET",
        url: `${API_URL_OTC + ((VOLUME > 0) ? `?volume=${VOLUME}` : '')}`,
        form: {}
    }, function (err, data, body) {
        body = JSON.parse(body);
        const res = {
            buy: {
                price: body.buy.newPrice,
                referencePrice: body.buy.price,
            },
            sell: {
                price: body.sell.newPrice,
                referencePrice: body.sell.price,
            }
        };

        let buy_referencePrice = res.buy.referencePrice ? res.buy.referencePrice + buy_otc_value : 0; //Giá gốc của  binance đăng
        let buy_price = res.buy.price ? res.buy.price : 0; //Giá đã + - 
        let sell_referencePrice = res.sell.referencePrice ? res.sell.referencePrice + sell_otc_value : 0; //Giá gốc của  binance đăng
        let sell_price = res.sell.price ? res.sell.price : 0; //Giá đã + - 


        // if ((buy_referencePrice !== buy_referencePrice_old) || (sell_referencePrice !== sell_referencePrice_old)) {

        //Gửi tin nhắn tới nhóm telegram
        //Cập nhật lại thông tin cũ
        buy_referencePrice_old = buy_referencePrice;
        buy_price_old = buy_price;
        sell_referencePrice_old = sell_referencePrice;
        sell_price_old = sell_price;


        const text = `
Buy Price: <b> ${buy_referencePrice} </b> 
Sell Price: <b> ${sell_referencePrice} </b>
Amplitude Sell: <i> ${sell_otc_value}   Amplitude Buy: ${buy_otc_value} </i>
`;
        for (const cid of chat_id) {
            try {
                bot.sendMessage(cid, text, {parse_mode: 'HTMl'}).then(() => {
                    console.log(`Gửi vào ${cid} thành công`, text)
                }).catch(e => {

                })
            } catch (e) {
            }
        }

        /*} else {
            console.log(`Dữ liệu không thay đổi: ${JSON.stringify(res)}`);
        }*/
    })


}

module.exports = {
    sendData: everyMinute,
    run: async function (bot) {
        bot.onText(/\/start/, async (msg) => {
            const me = await bot.getMe();
            for (const cid of chat_id) {
                try {
                    const t = `${me.first_name}: Join Group`;
                    bot.sendMessage(cid, t).then(() => {
                        console.log(`Gửi vào ${cid} thành công`, t)
                    }).catch(e => {

                    });
                } catch (e) {
                }
            }
        })
        schedule.scheduleJob('* * * * *', () => {
            everyMinute(bot)
        });

    }
}
