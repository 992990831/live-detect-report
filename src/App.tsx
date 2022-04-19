import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Table, DatePicker, Form, List, Divider, Modal, message, Tag, Space, Select, Input, notification, Popconfirm } from 'antd';
import 'antd/dist/antd.css';
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
  result: boolean,
  createdAt: string
}

function App() {
  const [visible, setVisible] = useState(false);
  const [clientsList, setClientsList] = useState<ClientDataType[]>([]);
  const [clientId, setClientId] = useState();
  const [checkResult, setCheckResult] = useState();
  const [range, setRange] = useState<[string, string]>();
  const [bestImg, setBestImg] = useState();

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
      title: '检测结果',
      dataIndex: 'result',
      key: 'title',
      width: 'result',
      render: (value: boolean) => <p>{value ? "成功" : "失败"}</p>,
    },
    {
      title: '检测时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 'result',
    },
    {
      title: '查看结果',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <Button onClick={() => { setVisible(true); getBestImg(record.filePath);  }} type="primary">查看</Button>
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
      records.unshift({merchantId: '', name: '-请选择-' });
      setClientsList(records);
    })
  }

  const getRecords = (current: number, pageSize: number) => {
    let url = `http://106.75.216.135:8004/api/livedetect/records?pageIndex=${current}&pageSize=${pageSize}`;

    clientId && (url += `&clientId=${clientId}`)
    checkResult && (url += `&result=${checkResult}`)
    range && (url += `&start=${range[0]}&end=${range[1]}`)

    axios(url, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => {
      let records = res.data.list as RecordType[];
      setRecords(records);

      pagination.total = res.data.count;
    });
  }

  const getBestImg = (filePath: string) => {
    let url = `http://106.75.216.135:8004/api/livedetect/best-img?filePath=${filePath}`;
    axios(url, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => {
      setBestImg(res.data);
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
       <Row justify='center' style={{marginLeft:'20px', marginTop: '10px', marginBottom: '5px' }}>
        <Col span={6}>
          <span>商户:</span>
          <Select style={{ marginLeft:'20px', width: '40%' }} onChange={(value) => {
            setClientId(value);
          }}>
            {
              clientsList.map(u => (
                <Option key={u.merchantId} value={u.merchantId}>{u.name}</Option>
              ))
            }
          </Select>
        </Col>
        <Col span={6}>
          <span>检测结果:</span>
          <Select style={{ marginLeft:'20px', width: '40%' }} onChange={(value) => {
            setCheckResult(value);
          }}>
            <Option key={0} value="">-请选择-</Option>
            <Option key={1} value="1">成功</Option>
            <Option key={2} value="0">失败</Option>
          </Select>
        </Col>
        <Col span={8}>
          <span>日期范围:</span>
          <RangePicker style={{ marginLeft:'20px', width: '70%' }} onChange={(values, format) => {
            setRange(format);
          }} />
        </Col>
        <Col span={4}>
          <Button type="primary" onClick={()=>{
            getRecords(1, pagination.pageSize);
          }}>搜索</Button>
        </Col>
      </Row>
      <Table  style={{margin:'20px'}}
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

      <Modal visible={visible} title="视频截图"
        footer={[
          <Button key="back" onClick={() => setVisible(false)}>
            关闭
          </Button>,
        ]}
        onCancel={() => {
          setVisible(false);
        }}
        
      >
        {
            <img style={{width:'300px'}} src={`data:image/jpeg;base64,${bestImg}`} />
          }
        </Modal>
      
    </div>

  );
}

export default App;
