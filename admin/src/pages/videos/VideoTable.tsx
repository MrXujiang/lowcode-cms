import { Table, Space, Tag, Popconfirm } from 'antd';
import ImageView from '@/components/ImageView';

export default ({data, onDel, onTop, onEdit}:any) => {
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '封面',
      dataIndex: 'face',
      key: 'face',
      render: (img:string) => {
        return <ImageView url={img} />
      }
    },
    {
      title: '分类',
      dataIndex: 'cate',
      key: 'cate',
      render: (cate:[any]) => {
        return cate.map(v => <Tag color="processing" key={v}> { v } </Tag>)
      }
    },
    {
      title: '审核状态',
      dataIndex: 'review',
      key: 'review',
      render: (status: 0 | 1 | 2) => {
        const statusMap = {
          0: { t: '待审核', c: '#2db7f5' },
          1: { t: '审核通过', c: '#87d068' },
          2: { t: '不通过', c: '#f50' },
        }
        return <Tag color={statusMap[status].c}>{ statusMap[status].t }</Tag>
      }
    },
    {
      title: '置顶',
      dataIndex: 'top',
      key: 'top',
      render: (flag:boolean) => {
        return flag ? <Tag color={"processing"}> 已置顶 </Tag> : null
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record:any) => (
        <Space size="middle">
          <a onClick={() => onTop(record.fid, record.top)}>{record.top ? '取消置顶' : '置顶'}</a>
          <a onClick={() => onEdit(record.fid)}>编辑</a>
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() => onDel(record.fid)}
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