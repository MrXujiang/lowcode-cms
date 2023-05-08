import { useState, useEffect } from 'react';
import { Button } from 'antd';
import BannerTable from './BannerTable';
import NewsTable from './NewsTable';
import CorsTable from './CorsTable';
import EditModal, { ConfigType } from './EditModal';
import req from '@/utils/req';
import styles from './index.less';

export default function Website() {
  const [config, setConfig] = useState<any>({})
  const [type, setType] = useState<ConfigType>('banner')
  const [showModal, setShowModal] = useState(false)
  const [formValue, setFormValue] = useState<any>(null)

  const handleAdd = (type: ConfigType) => {
    setType(type)
    setShowModal(true)
    setFormValue(null)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const saveForm = (saveType: 0 | 1) => {
    return saveType ? editForm : handleAddRow
  }

  const handleAddRow = (type: ConfigType, values:any) => {
    req.post(`/config/${type}/add`, values).then(res => {
      getInitData()
      setFormValue(null)
      setShowModal(false)
    })
  }

  const editForm = (type: ConfigType, values:any) => {
    req.put(`/config/${type}/edit`, values).then(res => {
      getInitData()
      setFormValue(null)
      setShowModal(false)
    })
  }

  const handleEdit = (type: ConfigType, values:any) => {
    setType(type)
    setShowModal(true)
    setFormValue(
      values.img ? 
        {
          ...values, 
          img: [{ 
              uid: Date.now(),
              status: 'done', 
              url: values.img, 
              name: Date.now() + '.png'
            }]
        } : values)
  }

  const delRow = (type: ConfigType, tid:string) => {
    req.delete(`/config/${type}/del?tid=${tid}`).then(() => {
      getInitData()
      setShowModal(false)
    })
  }

  const getInitData = () => {
    req.get('/config/get').then(res => {
      res && setConfig(res)
    })
  }
  useEffect(() => {
    getInitData()
  }, [])
  return (
    <div className={styles.website}>
      <h3 className={styles.title}>
        首页轮播图管理 
        <div style={{float: 'right'}}><Button type="primary" onClick={() => handleAdd('banner')}>添加</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <BannerTable data={config.banner} onDel={delRow.bind(Website, 'banner')} onEdit={handleEdit.bind(Website, 'banner')} />
      </div>
      <h3 className={styles.title}>
        资讯管理
        <div style={{float: 'right'}}><Button type="primary" onClick={() => handleAdd('news')}>添加</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <NewsTable data={config.news} onDel={delRow.bind(Website, 'news')} onEdit={handleEdit.bind(Website, 'news')} />
      </div>
      <h3 className={styles.title}>
        合作媒体管理
        <div style={{float: 'right'}}><Button type="primary" onClick={() => handleAdd('cors')}>添加</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <CorsTable data={config.cors} onDel={delRow.bind(Website, 'cors')} onEdit={handleEdit.bind(Website, 'cors')} />
      </div>
      <EditModal 
        type={type} 
        showModal={showModal} 
        initValue={formValue}
        onOk={saveForm} 
        onCancel={closeModal}
      />
    </div>
  );
}
