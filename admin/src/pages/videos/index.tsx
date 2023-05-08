import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { history } from 'umi';
import req from '@/utils/req'
import VideoTable from './VideoTable';
import styles from './index.less';

export default function ArticleManage() {
  const [data, setData] = useState([]);
  const toEdit = () => {
    history.push('/videos/edit')
  }
  const delArticle = (id:string) => {
    req.delete(`/videos/del?id=${id}`).then(() => {
      getData()
    })
  }

  const getData = () => {
    req.get('/videos/all').then(res => {
      res && setData(res)
    })
  }

  const doTop = (id:string, flag:boolean) => {
    req.post(flag ? `/video/untop?id=${id}` : `/video/top?id=${id}`).then(res => {
      getData()
    })
  }

  const doEdit = (id:string) => {
    history.push(`/videos/edit?id=${id}`)
  }

  useEffect(() => {
    getData()
  }, [])
  return (
    <div className={styles.videoWrap}>
      <h3 className={styles.title}>
         视频管理  <div style={{float: 'right'}}><Button type="primary" onClick={toEdit}>发布视频</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <VideoTable data={data} onDel={delArticle} onTop={doTop} onEdit={doEdit} />
      </div>
    </div>
  );
}
