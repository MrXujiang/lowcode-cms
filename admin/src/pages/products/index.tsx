import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { history } from 'umi';
import req from '@/utils/req'
import ProductTable from './ProductTable';
import styles from './index.less';

export default function ArticleManage() {
  const [data, setData] = useState([]);
  const toEdit = () => {
    history.push('/products/edit')
  }
  const delArticle = (id:string) => {
    req.delete(`/products/del?id=${id}`).then(() => {
      getData()
    })
  }

  const getData = () => {
    req.get('/products/all').then(res => {
      res && setData(res)
    })
  }

  const doTop = (id:string, flag:boolean) => {
    req.post(flag ? `/product/untop?id=${id}` : `/product/top?id=${id}`).then(res => {
      getData()
    })
  }

  const doEdit = (id:string) => {
    history.push(`/products/edit?id=${id}`)
  }

  useEffect(() => {
    getData()
  }, [])
  return (
    <div className={styles.articleWrap}>
      <h3 className={styles.title}>
         产品管理  <div style={{float: 'right'}}><Button type="primary" onClick={toEdit}>发布产品</Button></div>
      </h3>
      <div className={styles.tableWrap}>
        <ProductTable data={data} onDel={delArticle} onTop={doTop} onEdit={doEdit} />
      </div>
    </div>
  );
}
