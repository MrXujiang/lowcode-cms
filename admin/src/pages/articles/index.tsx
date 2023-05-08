import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { history } from 'umi';
import req from '@/utils/req'
import ArticleTable from './ArticleTable';
import styles from './index.less';

export default function ArticleManage() {
  const [data, setData] = useState([]);
  const toEdit = () => {
    history.push('/articles/edit')
  }
  const delArticle = (id:string) => {
    req.delete(`/articles/del?id=${id}`).then(() => {
      getData()
    })
  }

  const getData = () => {
    req.get('/articles/all').then(res => {
      res && setData(res)
    })
  }

  const doTop = (id:string, flag:boolean) => {
    req.post(flag ? `/article/untop?id=${id}` : `/article/top?id=${id}`).then(res => {
      getData()
    })
  }

  const doEdit = (id:string) => {
    history.push(`/articles/edit?id=${id}`)
  }

  useEffect(() => {
    getData()
  }, [])
  return (
    <div className={styles.articleWrap}>
      <h3 className={styles.title}>
         文章管理  <div style={{float: 'right'}}><Button type="primary" onClick={toEdit}>写文章</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <ArticleTable data={data} onDel={delArticle} onTop={doTop} onEdit={doEdit} />
      </div>
    </div>
  );
}
