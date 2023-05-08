import { Table, Space, Tooltip, Popconfirm } from 'antd';
import ImageView from '@/components/ImageView';

export default ({data, onDel, onEdit}:any) => {
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '图片',
      dataIndex: 'img',
      key: 'img',
      render: (img:string) => {
          return <ImageView url={img} />
      }
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      render: (link:string) => {
          return <Tooltip title={link}>
                      <span>{ link.slice(0, 20) + '...' }</span>
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