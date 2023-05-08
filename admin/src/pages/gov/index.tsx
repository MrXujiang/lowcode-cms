import { Button, Modal, message } from 'antd';
import { useEffect, useState  } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import InstitutionTable from './InstitutionTable';
import req from '@/utils/req';
import { SERVER_URL } from '@/utils/tool';
import styles from './index.less';

export default function Institution() {
  const [data, setData] = useState<any>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [link, setLink] = useState('');
  const handleAdd = () => {
    req.post('/user/code').then(res => {
      res && setLink(`${SERVER_URL}/user/register?code=${res}`)
      setIsVisible(true)
    })
  }

  const handleEdit = (uid:string, name:string) => {
    setLink(`${SERVER_URL}/user/register?uid=${uid}&name=${name}`)
    setIsVisible(true)
  }

  const getUserData = () => {
    req.get('/user/all').then(res => {
      res && setData(res)
    })
  }

  const handleOk = () => {
    setIsVisible(false)
  }

  const handleCancel = () => {
    setIsVisible(false)
  }

  const onCopy = () => {
    message.success('复制成功')
  }

  const onDel = (uid: string) => {
    req.delete('user/del?uid=' + uid).then(() => getUserData())
  }

  useEffect(() => {
    getUserData()
  }, [])
  return (
    <div className={styles.gov}>
      <h3 className={styles.title}>
        机构管理
        <div style={{float: 'right'}}><Button type="primary" onClick={handleAdd}>生成注册链接</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <InstitutionTable data={data} onDel={onDel} onEdit={handleEdit} />
      </div>
      <Modal 
        title="激活链接" 
        visible={isVisible} 
        width={660}
        onOk={handleOk} 
        onCancel={handleCancel}
        style={{textAlign: 'center'}}
        okText="确定"
        cancelText="取消"
      >
        <span className={styles.link}>{ link }</span>
        <CopyToClipboard text={link} onCopy={onCopy}>
          <Button type="primary">复制</Button>
        </CopyToClipboard>
      </Modal>
    </div>
  );
}
