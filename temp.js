const { default: axios } = require('axios')
const { Stocks, TempStocks, BaseSchema, LastStocks } = require('./model')
const dayjs = require('dayjs')

const batchSize = 1000;
const utils = require('./utils')


const calValue = utils.calValue
async function batchInsert(target, list) {
    for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        await target.insertMany(batch);
        console.log(`成功插入第 ${i / batchSize + 1} 批数据`);
    }
}

/**
 * list 数据源
 * type temp 临时数据 history 历史数据 last 上一个交易日最新数据
 */
async function insert(list, type) {
    try {
        const target = targetMap[type]
        if (type !== 'history') {
            await target.deleteMany({})
        }
        const resList = await batchInsert(target, list)
        if (type === 'history') {
            // 额外存一个缓存数据
            await batchInsert(LastStocks, list)
        }
        console.log('inserted', type, resList)
        // while (list.length > 0) {

        //     const part = list.length > 500 ? list.splice(0, 100) : list.splice(0, list.length)

        //     const insertedUsers = await Stocks.create(part)

        //     console.log('insertedUsers', insertedUsers)

        // }
    } catch (err) {
        console.warn('批量插入数据失败', err)
    } finally {
        console.log('数据插入成功')
    }
}

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
                }
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

/**
 * 获取所有股票线上数据
 * @returns 
 */
async function getAllStockListOnline() {
    const shList = await getStockList(data.sh)
    const szList = await getStockList(data.sz)
    return shList.concat(szList)
}

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

async function insertToday() {
    if(await isTradingDay()) {
    const allList = await getAllStockListOnline()
    insert(allList, 'temp')
    console.log('记录临时日志成功')
    }else {
      console.warn('非交易日,不执行任务')
}
}

insertToday()
