const { default: axios } = require('axios')

const express = require('express')

const app = express()

const port = 3002

const a = require('iconv-lite');

const data = require('./data')

const utils = require('./utils')

const mongoose = require('mongoose');

const { Stocks, tempStocks, BaseSchema } = require('./model')
const cron = require('node-cron')
const dayjs = require('dayjs')
require('dotenv').config();  // 加载 .env 文件中的变量


const calValue = utils.calValue

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


mongoose.connect(uri, dbOptions).then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));


async function insert(list, isTemp = false) {
    try {
        const target = isTemp ? tempStocks : Stocks
        if (isTemp) {
            await tempStocks.deleteMany({})
        }
        const resList = await target.create(list)
        console.log('inserted', isTemp, resList)
        // while (list.length > 0) {

        //     const part = list.length > 500 ? list.splice(0, 100) : list.splice(0, list.length)

        //     const insertedUsers = await Stocks.create(part)

        //     console.log('insertedUsers', insertedUsers)

        // }

        console.log('全部插入成功');
    } catch (err) {
        console.warn('批量插入数据失败', err)
    } finally {
        console.log('数据插入成功')
    }
}

app.get('/', async (req, res) => {
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

/**
 * 获取所有股票线上数据
 * @returns 
 */
async function getAllStockListOnline() {
    const shList = await getStockList(data.sh)
    const szList = await getStockList(data.sz)
    return shList.concat(szList)
}

/**
 * 存储当日数据
 */
async function insertToday(isTemp = false) {
    const allList = getAllStockListOnline()
    insert(allList, isTemp)
}

app.get('/temp', async (req, res) => {
    console.log('记录temp数据')
    await insertTodayTemp()
    res.send('操作成功！')
})


app.get('/init', (req, res) => {

    res.send('inited!')

})



// 查询函数
async function findAmountIncrease() {
    try {
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
                // 计算amount的增长
                const amountIncrease = (todayStock.amount - yesterdayStock.amount) / yesterdayStock.amount * 100;

                // 如果amount增长超过9%，则记录该数据
                if (amountIncrease > 9) {
                    result.push({
                        name: todayStock.name,
                        todayAmount: todayStock.amount,
                        yesterdayAmount: yesterdayStock.amount,
                        amountIncrease: amountIncrease.toFixed(2) + '%',
                        date: todayStock.date,
                        time: todayStock.time
                    });
                }
            }
        });

        console.log('Amount increase > 9%:', result);

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

/** 查询temp列表数据 */
async function queryTempStocks() {
    try {
        const list = await tempStocks.find();
        if (list.length === 0) {
            return res.status(404).send('No matching stocks found');
        }
        // 返回查询到的结果
        return list;
    } catch (error) {
        console.error('Error occurred while fetching stock data:', error);
        return res.status(500).send('Internal server error');
    }
}

// 实时查询成交额是否超过昨日的9%
async function findRealAmountIncrease(useDb = false) {
    try {

        const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
        // 查询今天和昨天相同name的记录
        let stocksToday = []
        if (useDb) {
            stocksToday = await queryTempStocks()
        } else {
            stocksToday = await getAllStockListOnline();
        }
        const stocksYesterday = await Stocks.find({ date: yesterday });

        const result = [];

        // 对比今天和昨天的数据
        stocksToday.forEach(todayStock => {
            // 查找昨天相同name的股票数据
            const yesterdayStock = stocksYesterday.find(yesterdayStock => yesterdayStock.name === todayStock.name);

            if (yesterdayStock) {
                // 计算amount的增长
                const amountIncrease = todayStock.amount / yesterdayStock.amount * 100;

                // 如果amount增长超过9%，则记录该数据
                if (amountIncrease > 9) {
                    result.push({
                        name: todayStock.name,
                        todayAmount: todayStock.amount,
                        yesterdayAmount: yesterdayStock.amount,
                        amountIncrease: amountIncrease.toFixed(2) + '%',
                        date: todayStock.date,
                        time: todayStock.time
                    });
                }
            }
        });

        console.log('Amount increase > 9%:', result);
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}




app.get('/list', async (req, res) => {
    const { isOnline } = req.query;
    const data = await findRealAmountIncrease(isOnline === '0')
    console.log(data, '查询完毕')
    res.json(data)
})

// 定义 /getInfo 路由
app.get('/getInfo', async (req, res) => {
    const { code } = req.query; // 获取查询参数 `code`

    if (!code) {
        return res.status(400).send('Code is required');
    }

    try {
        // 使用正则进行模糊查询
        const regex = new RegExp(code, 'i'); // 'i' 表示忽略大小写
        const stocks = await Stocks.find({ code: { $regex: regex } }).sort({ date: -1 });;

        if (stocks.length === 0) {
            return res.status(404).send('No matching stocks found');
        }

        // 返回查询到的结果
        return res.json(stocks);
    } catch (error) {
        console.error('Error occurred while fetching stock data:', error);
        return res.status(500).send('Internal server error');
    }
});


app.get('/getStockList', async (req, res) => {
    try {
        const list = await BaseSchema.find();
        if (list.length === 0) {
            return res.status(404).send('No matching stocks found');
        }
        // 返回查询到的结果
        return res.json(list);
    } catch (error) {
        console.error('Error occurred while fetching stock data:', error);
        return res.status(500).send('Internal server error');
    }
})

app.get('/initStockList', async (req, res) => {
    const batchSize = 1000; // 设置每批插入1000条数据
    const _data = data.allData.map(item => ({
        name: item.name,
        value: `${item.type.toLocaleLowerCase()}${item.value}`,
        type: item.type
    }))
    for (let i = 0; i < _data.length; i += batchSize) {
        const batch = _data.slice(i, i + batchSize);
        await BaseSchema.insertMany(batch);
        console.log(`成功插入第 ${i / batchSize + 1} 批数据`);
    }
    res.send('操作完毕')
})

app.listen(port, () => {

    console.log(`Example app listening on port ${port}`)

})



process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});


// #region 定时任务存储数据

// 判断是否是工作日（周一到周五）
function isWeekday() {
    const dayOfWeek = dayjs().day(); // 0: 周日, 1: 周一, ..., 6: 周六
    return dayOfWeek >= 1 && dayOfWeek <= 5; // 判断是否是工作日
}

// 请求新浪财经的股票数据
async function checkIfTradingDay(stockCode) {
    try {
        // 新浪财经的 URL
        const url = `https://hq.sinajs.cn/list=${stockCode}`;

        // 发送 GET 请求
        const response = await axios.get(url);

        // 从响应数据中提取股票数据
        const data = response.data;

        // 判断是否包含 "今日休市" 或类似的休市信息
        if (data.includes("今日休市") || data.includes("停牌")) {
            console.log('今天是休市日');
            return false; // 今天不是交易日
        }

        console.log('今天是交易日');
        return true; // 今天是交易日

    } catch (error) {
        console.error('请求新浪财经接口失败:', error);
        return false; // 请求失败，认为不是交易日
    }
}

// 检查今天是否是 A 股的交易日
async function isTradingDay() {
    if (!isWeekday()) {
        console.log('今天是周末，不是交易日');
        return false;
    }

    // 检查是否是工作日，并通过新浪财经获取某只股票的数据来验证
    const stockCode = 'sh600519'; // 可以替换成任意的股票代码
    const result = await checkIfTradingDay(stockCode);
    return result;
}

cron.schedule('25 9 * * 1-5', async () => {
    if (await isTradingDay()) {
        console.log('今天是交易日，执行任务');
        await insertToday(true)
        console.log('竞价数据已缓存！')
    } else {
        console.log('今天不是交易日');
    }
}, {
    timezone: 'Asia/Shanghai',  // 设置时区为上海时间
});

// 定时任务：每天 15:30 执行任务
cron.schedule('10 15 * * 1-5', async () => {
    if (await isTradingDay()) {
        console.log('今天是交易日，执行任务');
        // 存储今日交易信息
        await insertToday()
        console.log('收盘数据已缓存！')
    } else {
        console.log('今天不是交易日');
    }
}, {
    timezone: 'Asia/Shanghai',  // 设置时区为上海时间
});
// #endregion 