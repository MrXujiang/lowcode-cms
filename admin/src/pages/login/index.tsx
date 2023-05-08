import { Form, Input, Button, Badge } from 'antd';
import req from '@/utils/req';
import { history, connect, Dispatch } from 'umi';
import { ConnectState } from '@/models/connect';
import styles from './index.less';

interface LoginProps {
  dispatch: Dispatch
}

interface FormValueProps {
  name: string;
  pwd: string;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = window.innerWidth > 800 ? {
  wrapperCol: { offset: 6, span: 16 },
} : null;

const Login:React.FC<LoginProps> = ({ dispatch }) => {
  const onFinish = (values:FormValueProps) => {
    const { name, pwd } = values;
    req.post('/user/login', { name, pwd }).then((res:any) => {
      localStorage.setItem('name', name)
      localStorage.setItem('role', res.role)
      dispatch({
        type: 'users/setUserConfig',
        paylod: res
      })
      history.push('/dashboard')
    })
  };

  const onFinishFailed = (errorInfo:Error) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.loginWrap}>
      <Badge.Ribbon text="LC媒体专享">
        <Form
          {...layout}
          name="login"
          className={styles.formWrap}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div className={styles.tit}>LC媒体管理平台<span style={{marginLeft: '20px',fontSize: '18px',color: '#06c'}}>登录</span></div>
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

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Badge.Ribbon>
    </div>
    
  );
};

export default connect(({ users }: ConnectState) => users)(Login)
