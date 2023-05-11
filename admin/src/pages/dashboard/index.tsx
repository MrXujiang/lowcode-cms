import { Statistic, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import Empty from '@/components/Empty';
import req from '@/utils/req';
import styles from './index.less';

export default function DashBoard() {
  const [data, setData] = useState<any>({views: {}});
  const { home, articles, products, videos } = data.views;
  useEffect(() => {
    req.get('/dashboard').then(res => {
      setData(res)
    })
  }, [])
  return (
    <div className={styles.dashboard}>
      <div className={styles.staticBox}>
        <Row gutter={16}>
          <Col span={4}>
            <Statistic title="总访问量" value={home + articles + products + videos} />
          </Col>
          <Col span={4}>
            <Statistic title="机构数" value={data.users || 2} />
          </Col>
          <Col span={4}>
            <Statistic title="文章数" value={data.articles} />
          </Col>
          <Col span={4}>
            <Statistic title="产品数" value={data.products} />
          </Col>
          <Col span={4}>
            <Statistic title="视频数" value={data.videos} />
          </Col>
          <Col span={4}>
            <Statistic title="合作社区数" value={data.cors} />
          </Col>
        </Row>
      </div>
      <div className={styles.content}>
        <img src="http://cdn.dooring.cn/dr/qtqd_code.png" alt="徐小夕——趣谈前端公众号" width="120px" />
        <Empty text="今天又是充实的一天, 持续为着梦想加油!" />
      </div>
    </div>
  );
}
