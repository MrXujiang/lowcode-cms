import { Table, Space, Popconfirm } from 'antd';

export default ({data, onDel, onEdit}:any) => {
  const columns = [
    {
      title: '编号',
      dataIndex: 'uid',
      key: 'uid'
    },
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '行业标签',
      dataIndex: 'tag',
      key: 'tag'
    },
    {
      title: '文章数',
      dataIndex: 'articles',
      key: 'articles'
    },
    {
      title: '操作',
      key: 'action',
      render: (record:any) => (
        <Space size="middle">
          <a onClick={() => onEdit(record.uid, record.name)}>编辑</a>
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() => onDel(record.uid)}
            okText="是"
            cancelText="否"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return <Table columns={columns} dataSource={data} rowKey="uid" />
}