import { Button, Card, message, Row, Space, Spin, Statistic, Table, Tag } from 'antd'
import { getList, goLog } from '@/api';
import { useState } from 'react';
import { ColumnType } from 'antd/es/table';
export default function HomePage() {
    const [info, setInfo] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const items: ColumnType[] = [{
        title: '股票',
        dataIndex: 'name',
    }, {
        title: '成交额（亿）',
        dataIndex: 'todayAmount',
        align: 'right',
        sorter: (a, b) => a.todayAmount - b.todayAmount,
        defaultSortOrder: 'descend',
        render: (t) => <span style={{ color: 'red' }}>{t}</span>
    }, {
        title: '昨日成交额（亿）',
        align: 'right',
        dataIndex: 'yesterdayAmount',
    }, {
        title: '涨幅',
        dataIndex: 'amountIncrease',
        sorter: (a, b) => a.amountIncrease - b.amountIncrease,
        render: (t) => <span style={{ color: 'red' }}>{t}</span>
    }, {
        title: '记录时间',
        dataIndex: 'time'
    }]

    const onGetList = async (isOnline = 0 as any) => {
        setLoading(true)
        try {
            const res = await getList({ isOnline })
            console.log(res)
            setInfo(res.data)
        } finally {
            setLoading(false)
        }
    }

    const onLog = async () => {
        try {
            const res = await goLog()
            message.success('操作成功')
        } catch (e) {
            message.error('记录日志失败')
        }
    }

    return (
        <Card title="量化实时" style={{ width: 880 }} extra={<Statistic title="交易日" value={info[0]?.date} />}>
            <div style={{ marginBottom: 16 }}>
                <Space align='center' style={{ width: '100%' }}>

                    <Button type='primary' onClick={() => onGetList()} style={{ width: '100%' }}>日志查询</Button>
                    <Button type='primary' onClick={() => onGetList(1)} style={{ width: '100%' }}>实时查询</Button>
                    <Button type='primary' onClick={onLog} style={{ width: '100%' }}>记录日志</Button>
                </Space>
            </div>
            <Spin spinning={loading}>
                <Table columns={items} dataSource={info} pagination={false} />
            </Spin>
        </Card>
    );
}
