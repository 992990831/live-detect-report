import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Table, Modal, Space, Select, Input } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

type ClientDataType = {
    merchantId: string,
    name: string
}

type RecordType = {
    clientId: string,
    clientName: string,
    terms: string,
    createdAt: string
}

export const Config = () => {
    const [visible, setVisible] = useState(false);
    const [clientsList, setClientsList] = useState<ClientDataType[]>([]);
    const [clientId, setClientId] = useState('');
    const [terms, setTerms] = useState('');

    const columns = [
        {
            title: '商户名称',
            dataIndex: 'merchantName',
            key: 'merchantName',
        },
        {
            title: '条款',
            dataIndex: 'terms',
            key: 'terms',
            render: (value: string) => <p>{ (value && value.length>50) ? value.substring(0, 50) + '......' : value}</p>,
        },
        {
            title: '修改隐私条款',
            key: 'action',
            render: (text: any, record: any) => (
                <Space size="middle">
                    <Button onClick={() => { setVisible(true); setTerms(record.terms); setClientId(record.merchantId);  }} type="primary">修改</Button>
                </Space>
            ),
        },
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
        let url = `http://106.75.216.135:8004/api/livedetect/configs?pageIndex=${current}&pageSize=${pageSize}`;

        clientId && (url += `&clientId=${clientId}`)
       
        axios(url, {
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            let records = res.data.list as RecordType[];
            setRecords(records);

            pagination.total = res.data.count;
        });
    }

    const SaveTerms = async (clientId: string, terms: string ) => {
   
        const url = 'http://106.75.216.135:8004/api/livedetect/config';
        /// 如果客户端用content-type: application/json的话，这里可以在入参中使用对象(FromBody)
        /// 但遇到了preflight的问题，由于现在的方式，服务是host在另一个.net framework IIS服务上，所以遇到了options preflight无法处理的情况
        /// 只能把content-type改为application/x-www-form-urlencoded;charset=utf-8，这样就不能在入参中使用对象。 只能读取body再做json转换
    
        const request = axios.create({
            timeout: 10000
        });
    
        let data = {
            merchantId: clientId,
            terms
        }
        
        //提交数据
        await request({
            url,
            method:'post',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data:JSON.stringify(data)//注意这里要使用data，如果需要在url上面拼接参数则需要使用param
        });
    
        await getRecords(pagination.current, pagination.pageSize);
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


    return(
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

            <Modal visible={visible} title="条款"
                footer={[
                    <Button key="save" onClick={() => {setVisible(false); SaveTerms(clientId, terms); }} type='primary'>
                        保存
                    </Button>,
                    <Button key="cancel" onClick={() => setVisible(false)}>
                        取消
                    </Button>,
                ]}
                onCancel={() => {
                    setVisible(false);
                }}

            >
                <TextArea rows={20} placeholder="限500字" maxLength={500} value={terms} onChange={e=>setTerms(e.target.value)} />
            </Modal>

        </div>
    )
}