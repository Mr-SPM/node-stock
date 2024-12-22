import { Button, Card, Row, Space, Spin, Table } from 'antd'
import { getList } from '@/api';
import { useState } from 'react';
import { ColumnType } from 'antd/es/table';
export default function HomePage() {
    const [info, setInfo] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const items: ColumnType[] = [{
        title: '股票',
        dataIndex: 'name',
    }, {
        title: '成交额',
        dataIndex: 'todayAmount',
        render: (t) => <span style={{ color: 'red' }}>{t}</span>
    }, {
        title: '昨日成交额',
        dataIndex: 'yesterdayAmount',
    }, {
        title: '涨幅',
        dataIndex: 'amountIncrease',
        render: (t) => <span style={{ color: 'red' }}>{t}</span>
    }, {
        title: '日期',
        dataIndex: 'date'
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
    return (
        <Card title="量化实时" style={{ width: 880 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Space>
                    <Button type='primary' onClick={() => onGetList()} style={{ width: '100%' }}>日志查询</Button>
                    <Button type='primary' onClick={() => onGetList(1)} style={{ width: '100%' }}>实时查询</Button>
                </Space>
            </Row>
            <Spin spinning={loading}>
                <Table columns={items} dataSource={info} />
            </Spin>
        </Card>
    );
}
