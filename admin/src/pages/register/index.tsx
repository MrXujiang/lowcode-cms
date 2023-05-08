import { Form, Input, Button, Select, Badge } from 'antd';
import { useEffect } from 'react';
import req from '@/utils/req';
import { history, Location } from 'umi';
import styles from './index.less';

interface IProps {
  location: Location
}

interface FormValueProps {
  name: string;
  pwd: string;
  tag: Array<any>;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const tailLayout = window.innerWidth > 700 ? {
  wrapperCol: { offset: 6, span: 16 },
} : null;

const { Option } = Select;

const Login:React.FC<IProps> = ({ location }) => {
  const { code, uid, name } = location.query;
  const [form] = Form.useForm();
  const onFinish = (values:FormValueProps) => {
    const { name, pwd, tag } = values;
    if(code) {
        req.post('/user/register', { name, pwd, tag, code }).then((res:any) => history.push('/login'))
        return
    }
    uid && req.post('/user/mod', { uid, name, pwd, tag }).then((res:any) => history.push('/login'))
  };

  useEffect(() => {
    if(uid && name) {
       req.get(`/user/check?uid=${uid}&name=${name}`).then(res => {
           res && form.setFieldsValue(res)
       })
    }
  }, [])

  return (
    <div className={styles.loginWrap}>
      <Badge.Ribbon text="LC媒体注册">
        <Form
          {...layout}
          name="register"
          form={form}
          className={styles.formWrap}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <div className={styles.tit}>LC媒体管理平台<span style={{marginLeft: '20px',fontSize: '18px',color: '#06c'}}>注册</span></div>
          <Form.Item
            label="用户名"
            name="name"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="pwd"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="行业标签"
            name="tag"
          >
            <Select mode="tags" style={{ width: '100%' }} placeholder="请输入行业标签">
            {
                [
                    { cn: '低代码服务商' },
                    { cn: '行业媒体' },
                    { cn: '个人自媒体' }
                ].map((item, i) => {
                    return <Option key={i.toString(36) + i} value={item.cn}>{ item.cn }</Option>
                })
            }
          </Select>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" block>
              { (uid || name) ? '修改' : '注册' }
            </Button>
          </Form.Item>
        </Form>
      </Badge.Ribbon>
    </div>
    
  );
};

export default Login
