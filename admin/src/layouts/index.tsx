import { useState, useEffect } from 'react';
import { Layout, Menu, ConfigProvider, Dropdown, Button } from 'antd';
import { connect, Link, history } from 'umi';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConnectState } from '@/models/connect';
import styles from './index.less';

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

interface BasicLayoutProps {
    // eslint-disable-next-line no-undef
    children: JSX.Element
    userConfig: any
    location: any
}

type MenuProp = Array<{
    key: string,
    path: string,
    text: string,
    sub: boolean,
    children?: MenuProp
}>
const menuData:MenuProp = [
    {
        key: '/dashboard',
        path: '/dashboard',
        text: '数据大盘',
        sub: false
    },
    {
        key: '/website',
        path: '/website',
        text: '网站管理',
        sub: false
    },
    {
        key: '/institution',
        path: '/institution',
        text: '机构管理',
        sub: false
    },
    {
        key: '/articles',
        path: '/articles',
        text: '文章管理',
        sub: false
    },
    {
        key: '/products',
        path: '/products',
        text: '产品管理',
        sub: false
    },
    {
        key: '/videos',
        path: '/videos',
        text: '视频管理',
        sub: false
    },
    {
        key: '/notes',
        path: '/notes',
        text: '手记管理',
        sub: false
    },
]

const LayoutWrap:React.FC<BasicLayoutProps> = ({ children, userConfig, location }) => {
    const [curSelected, setCurSelected] = useState(['/dashboard'])
    const createMenu = (menu:MenuProp) => {
        return menu.map(item => {
          if(item.sub) {
            return <SubMenu key={item.key} title={item.text}>
                      { createMenu(item.children) }
                   </SubMenu>
          }else {
            return <Menu.Item key={item.key}>
                       <Link to={item.path}>{ item.text }</Link>
                     </Menu.Item>
          }
        })
      }
    const exit = () => {
        localStorage.clear()
        history.push('/login')
    }
    const dropDownWrap = (
        <div className={styles.dropDownWrap}>
            <span onClick={exit}>退出</span>
        </div>
    )
    const handleSelect = (v:any) => {
        setCurSelected(v.selectedKeys)
    }

    useEffect(() => {
        setCurSelected([location.pathname])
    }, [])
    return <ConfigProvider locale={zhCN}>
        <Layout>
            <Header className={styles.header}>
            <div className={styles.logo}>LC社区管理后台</div>
            <Menu 
              className={styles.menuWrap} 
              theme="light" 
              mode="horizontal" 
              selectedKeys={curSelected}
              onSelect={handleSelect}
            >
                { createMenu(menuData) }
            </Menu>

            <div style={{marginRight: '40px'}}>
                <Button size="small" onClick={() => window.open('/')}>访问LowCode社区</Button>
            </div>
            
            <Dropdown overlay={dropDownWrap} placement="bottomCenter" arrow>
                <div>hi, { userConfig.name || localStorage.getItem('name') }</div>
            </Dropdown>
            </Header>
            <Content className={styles.container}>
            <div className={styles.content}>
                { children }
            </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>lowcode可视化社区 ©2021 Created by <a href="http://h5.dooring.cn" target="_blank">Dooring</a></Footer>
        </Layout>
    </ConfigProvider>
}

export default connect(({ users }: ConnectState) => ({
    userConfig: users.userConfig
  }))(LayoutWrap)