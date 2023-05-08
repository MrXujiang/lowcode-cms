import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { history } from 'umi';
import req from '@/utils/req'
import ArticleTable from './ArticleTable';
import styles from './index.less';

export default function ArticleManage() {
  const [data, setData] = useState([]);
  const toEdit = () => {
    history.push('/note/edit')
  }
  const delArticle = (id:string) => {
    req.delete(`/note/del?id=${id}`).then(() => {
      getData()
    })
  }

  const getData = () => {
    req.get('/note/all').then(res => {
      res && setData(res)
    })
  }

  const doTop = (id:string, flag:boolean) => {
    req.post(flag ? `/note/untop?id=${id}` : `/note/top?id=${id}`).then(res => {
      getData()
    })
  }

  const doEdit = (id:string) => {
    history.push(`/note/edit?id=${id}`)
  }

  useEffect(() => {
    getData()
  }, [])
  return (
    <div className={styles.articleWrap}>
      <h3 className={styles.title}>
         手记管理  <div style={{float: 'right'}}><Button type="primary" onClick={toEdit}>写手记</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <ArticleTable data={data} onDel={delArticle} onTop={doTop} onEdit={doEdit} />
      </div>
    </div>
  );
}
