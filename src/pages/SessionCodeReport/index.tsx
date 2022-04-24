import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Table, DatePicker, Form, List, Divider, Modal, message, Tag, Space, Select, Input, notification, Popconfirm } from 'antd';

import axios from 'axios';

const { Option } = Select;
const { RangePicker } = DatePicker;

type ClientDataType = {
    merchantId: string,
    name: string
}

type RecordType = {
    clientId: string,
    clientName: string,
    account: string,
    transId: string,
    createdAt: string
}

//记录验证码生成情况的报表
//验证码的使用也会产生费用，所以需要记录
export const SessionCodeReport = () => {
    const [visible, setVisible] = useState(false);
    const [clientsList, setClientsList] = useState<ClientDataType[]>([]);
    const [clientId, setClientId] = useState();
    const [range, setRange] = useState<[string, string]>();

    const columns = [
        {
            title: '商户号',
            dataIndex: 'clientName',
            key: 'clientName',
        },
        {
            title: '账号',
            key: 'account',
            dataIndex: 'account',
        },
        {
            title: '交易ID',
            dataIndex: 'transId',
            key: 'transId',
            width: '100px',
        },
        {
            title: '生成时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 'result',
        }
    ];

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [records, setRecords] = useState<RecordType[]>([]);

    useEffect(() => {
        getUsersList();
        getRecords(pagination.current, pagination.pageSize);
    }, [])

    const getUsersList = () => {
        axios(`http://106.75.216.135:8004/api/livedetect/users`, {
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            let records = res.data as ClientDataType[];
            records.unshift({ merchantId: '', name: '-请选择-' });
            setClientsList(records);
        })
    }

    const getRecords = (current: number, pageSize: number) => {
        let url = `http://106.75.216.135:8004/api/livedetect/codes?pageIndex=${current}&pageSize=${pageSize}`;

        clientId && (url += `&clientId=${clientId}`)
        range && (url += `&start=${range[0]}&end=${range[1]}`)

        axios(url, {
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            let records = res.data.list as RecordType[];
            setRecords(records);

            pagination.total = res.data.count;
        });
    }
   
    const onPaginationChange = (pageIndex: number, pageSize: number) => {
        pagination.current = pageIndex;
        pagination.pageSize = pageSize;
        setPagination(pagination);
        getRecords(pageIndex, pageSize);
    }

    const onShowSizeChange = (pageIndex: number, pageSize: number) => {
        pagination.current = pageIndex;
        pagination.pageSize = pageSize;
        setPagination(pagination);
        getRecords(pageIndex, pageSize);
    }

    return (
        <div>
            <Row justify='center' style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '5px' }}>
                <Col span={6}>
                    <span>商户:</span>
                    <Select style={{ marginLeft: '20px', width: '40%' }} onChange={(value) => {
                        setClientId(value);
                    }}>
                        {
                            clientsList.map(u => (
                                <Option key={u.merchantId} value={u.merchantId}>{u.name}</Option>
                            ))
                        }
                    </Select>
                </Col>
                <Col span={8}>
                    <span>日期范围:</span>
                    <RangePicker style={{ marginLeft: '20px', width: '70%' }} onChange={(values, format) => {
                        setRange(format);
                    }} />
                </Col>
                <Col span={4}>
                    <Button type="primary" onClick={() => {
                        getRecords(1, pagination.pageSize);
                    }}>搜索</Button>
                </Col>
            </Row>
            <Table style={{ margin: '20px' }}
                columns={columns} dataSource={records}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: onPaginationChange,
                    onShowSizeChange: onShowSizeChange,
                    showTotal: ((total) => {
                        return `共 ${total} 条`;
                    }),
                }}
            />
        </div>
    )
}