import { Table, Space, Popconfirm, Tooltip } from 'antd';

export default ({data, onDel, onEdit}:any) => {
  const columns = [
    {
      title: '媒体logo',
      dataIndex: 'img',
      key: 'img',
      render: (img:string) => {
          return <img style={{width: 60}} src={img} alt="" />
      }
    },
    {
      title: '媒体名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '媒体描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      render: (link:string) => {
          return <Tooltip title={link}>
                      <span>{ link }</span>
                  </Tooltip>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record:any) => (
        <Space size="middle">
          <a onClick={() => onEdit(record)}>编辑</a>
          <Popconfirm
              title="确定要删除吗?"
              onConfirm={() => onDel(record.tid)}
              okText="是"
              cancelText="否"
            >
              <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return <Table columns={columns} dataSource={data} rowKey="title" />
}