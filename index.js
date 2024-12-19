const { default: axios } = require('axios')

const express = require('express')

const app = express()

const port = 3002

const a = require('iconv-lite');

const data = require('./data')

const utils = require('./utils')

const mongoose = require('mongoose');

const Stocks = require('./model')
const dayjs = require('dayjs')

// 从环境变量中获取数据库连接信息
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// 构建数据库连接字符串
const uri = `mongodb://${dbHost}:${dbPort}/${dbName}`;


const dbOptions = {
    user: dbUser,
    pass: dbPassword,
    dbName: dbName,
    connectTimeoutMS: 200000,
}

async function insert(list) {

    try {

        // 连接到MongoDB服务器 

        await mongoose.connect(uri, dbOptions)

        console.log('连接成功');

        try {

            try {
                const insertedUsers = await Stocks.create(list)
                console.log('insertedUsers', insertedUsers)
                // while (list.length > 0) {

                //     const part = list.length > 500 ? list.splice(0, 100) : list.splice(0, list.length)

                //     const insertedUsers = await Stocks.create(part)

                //     console.log('insertedUsers', insertedUsers)

                // }

                console.log('全部插入成功');

            } catch (err) {

                console.warn('批量插入数据失败', err)

            }

        }

        finally {

            console.log('finish')

        }



    } catch (error) {

        console.error(error);

    } finally {

        await mongoose.disconnect();

    }

}




const calValue = utils.calValue

app.get('/', async (req, res) => {

    await run()

    res.send('Hello World!')

})




async function getStockList(datas) {
    const stockList = datas.map(item => `${item.type.toLocaleLowerCase()}${item.value}`)
    const getList = async (part) => {

        const url = `https://hq.sinajs.cn/list=${part.join(',')}`;

        const resp = await axios.get(url, {

            // axios 乱码解决 

            responseType: 'arraybuffer',

            transformResponse: [

                (data) => {

                    const body = a.decode(data, 'GB18030');

                    return body;

                },

            ],

            headers: {

                ...utils.randHeader(),

                Referer: 'http://finance.sina.com.cn/',

            },

        })

        const splitData = resp.data.split(';\n');

        const list = []

        for (let i = 0; i < splitData.length - 1; i++) {

            const code = splitData[i].split('="')[0].split('var hq_str_')[1];

            const params = splitData[i].split('="')[1].split(',');

            let type = code.substr(0, 2) || 'sh';

            let symbol = code.substr(2);

            let stockItem;

            let fixedNumber = 2;

            if (params.length > 1) {

                if (/^(sh|sz|bj)/.test(code)) {

                    // A股 

                    let open = params[1];

                    let yestclose = params[2];

                    let price = params[3];

                    let high = params[4];

                    let low = params[5];

                    fixedNumber = utils.calcFixedPriceNumber(open, yestclose, price, high, low);

                    stockItem = {
                        code,
                        name: params[0],
                        open: calValue(open, fixedNumber, false),
                        yestclose: calValue(yestclose, fixedNumber, false),
                        price: calValue(price, fixedNumber, false),
                        low: calValue(low, fixedNumber, false),
                        high: calValue(high, fixedNumber, false),
                        volume: calValue(params[8], 2),
                        amount: calValue(params[9], 2),
                        date: params[30],
                        time: `${params[30]} ${params[31]}`,
                        percent: '',

                    };

                }

            }

            list.push(stockItem)

        }

        console.log(list)

        return list

    }

    let resList = []
    let count = 0
    try {
        while (stockList.length > 0) {
            const part = stockList.length > 500 ? stockList.splice(0, 500) : stockList.splice(0, stockList.length)
            console.log(`抓取${count++}次`)
            const list = await getList(part)
            resList = resList.concat(list)
        }
    }
    catch (err) {
        console.warn(err)
    }

    return resList

}




app.get('/sh', async (req, res) => {

    try {

        const list = await getStockList(data.sh)

        await insert(list)

        res.send('操作成功')

    } catch (e) {
        res.send(e)
    }

})

app.get('/sz', async (req, res) => {
    try {
        console.log('开始获取深市数据')
        const list = await getStockList(data.sz)
        console.log('抓取成功！')
        await insert(list)
        res.send('操作成功')
    } catch (e) {
        res.send(e)
    }
})




app.get('/init', (req, res) => {

    res.send('inited!')

})



// 查询函数
async function findVolumeIncrease() {
    try {
        await mongoose.connect(uri, dbOptions)

        console.log('连接成功');

        // 获取今天和昨天的日期
        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
        // 查询今天和昨天相同name的记录
        const stocksToday = await Stocks.find({ date: today });
        const stocksYesterday = await Stocks.find({ date: yesterday });

        const result = [];

        // 对比今天和昨天的数据
        stocksToday.forEach(todayStock => {
            // 查找昨天相同name的股票数据
            const yesterdayStock = stocksYesterday.find(yesterdayStock => yesterdayStock.name === todayStock.name);

            if (yesterdayStock) {
                // 计算volume的增长
                const volumeIncrease = (todayStock.volume - yesterdayStock.volume) / yesterdayStock.volume * 100;

                // 如果volume增长超过9%，则记录该数据
                if (volumeIncrease > 9) {
                    result.push({
                        name: todayStock.name,
                        todayVolume: todayStock.volume,
                        yesterdayVolume: yesterdayStock.volume,
                        volumeIncrease: volumeIncrease.toFixed(2) + '%',
                        date: todayStock.date,
                        time: todayStock.time
                    });
                }
            }
        });

        console.log('Volume increase > 9%:', result);

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        mongoose.disconnect()
    }
}

app.get('/find', async (req, res) => {
    const data = await findVolumeIncrease()
    console.log(data, '查询完毕')
    res.send(data)
})


// 构建获取股票基本信息的函数，参数stockCodes为股票代码数组
async function getStockInfo(stockCodes) {
    const baseUrl = 'http://stock.finance.sina.com.cn/stock/api/openapi.php/StockSearchService.search';
    const params = {
        keyword: stockCodes.join(',') // 将股票代码数组用逗号拼接为字符串作为参数
    };
    try {
        const response = await axios.get(baseUrl, {
            params, headers: {
                ...utils.randHeader(),
                Referer: 'http://finance.sina.com.cn/',
            }
        });
        return response.data;
    } catch (error) {
        console.error('请求出错：', error);
        return null;
    }
}

app.get('/history', async (req, res) => {
    const data = await getStockInfo(['sz002162'])
    console.log(data, '查询完毕')
    res.send(data)
})

app.listen(port, () => {

    console.log(`Example app listening on port ${port}`)

})



