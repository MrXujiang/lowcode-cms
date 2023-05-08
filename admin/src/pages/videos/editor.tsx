import { Button, Tabs, message, Input, Modal, Dropdown, Form, Select } from 'antd'
import { useRef, useState, useEffect } from 'react'
import MyUpload from '@/components/Upload'
import req from '@/utils/req'
import { history, connect, Dispatch, Location } from 'umi';
import { ConnectState } from '@/models/connect';
import styles from './index.less';

interface ArticleEditProps {
    userConfig: any,
    dispatch: Dispatch,
    location: Location
}

const { TabPane } = Tabs;
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};
const { TextArea } = Input;
const { Option } = Select;

const ArticleEdit:React.FC<ArticleEditProps> = ({ dispatch, userConfig, location }) => {
  const titleRef = useRef<any>(null)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [val, setVal] = useState<any>({});
  const [curFormVal, setCurFormVal] = useState<any>(null);
  const [form] = Form.useForm();
  const [formContent] = Form.useForm();
  const id = location?.query?.id;

  useEffect(() => {
      if(id) {
        req.get(`/videos/get?id=${id}`).then((res:any) => {
            if(res) {
                const { link, code, title, cate, desc, face } = res;
                titleRef.current.state.value = title;
                formContent.setFieldsValue({ link, code })
                setVal({ link, code })
                setCurFormVal({
                    cate,
                    desc,
                    face: [{
                        name: title + '.png',
                        status: 'done',
                        url: face,
                        uid: Date.now()
                    }]
                })
            }
        })
      }
  }, [])

  const handleSave = () => {
    const {link, code } = formContent.getFieldsValue()
      if(titleRef.current.state.value && (link || code)) {
        setIsModalVisible(true)
        form.setFieldsValue(curFormVal)
      }else {
        message.error('请输入标题或者视频内容')
      }
  }

  const handleOk = () => {
    form.validateFields().then(values => {
        const { cate, face, desc } = values;
        const { link, code } = formContent.getFieldsValue();
        const author = userConfig.name || localStorage.getItem('name')
        if(id) {
            req.put('/videos/mod', {
                fid: id,
                title: titleRef.current.state.value,
                author,
                cate,
                face: face && face[0] && face[0].url,
                desc,
                link,
                code
             }).then(res => {
                setIsModalVisible(false);
                message.success('发布成功', 1, () => {
                    goBack()
                 })
             })
        }else {
            req.post('/videos/add', {
                title: titleRef.current.state.value,
                author,
                cate,
                face: face && face[0] && face[0].url,
                desc,
                link,
                code
             }).then(res => {
                 setIsModalVisible(false);
                 message.success('发布成功', () => {
                    goBack()
                 })
             })
        }
    })
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const goBack = () => {
      history.push('/videos')
  }

  const doReview = (flag: 1 | 2) => {
    req.post('/video/review', { id, flag }).then(res => {
        history.push('/videos')
    })
  }

  const handleChange = (v:any) => {
    console.log(v)
    setVal(v)
  }

  const controls = (
      <div className={styles.editContorls}>
          <span className={styles.btn} onClick={() => doReview(1)}>审核通过</span>
          <span className={styles.btn} onClick={() => doReview(2)}>审核不通过</span>
          <span className={styles.btn} onClick={goBack}>返回</span>
      </div>
  )

  const operations = (
      <div style={{display: 'flex'}}>
          <Input bordered={false} placeholder="请在此输入标题" size="large" style={{width: '292px'}} ref={titleRef} />
          <Button type="primary" shape="round" style={{marginLeft: '12px'}} onClick={handleSave}>保存</Button>
          <Dropdown overlay={controls} placement="bottomCenter" arrow>
            <Button shape="round" style={{marginLeft: '12px'}}>操作</Button>
          </Dropdown>
      </div>
  )

  return (
    <div className={styles.editWrap}>
      <Tabs 
        tabBarExtraContent={operations} 
        className={styles.tabWrap}
      >
            <TabPane tab="视频编辑" key="0">
              <Form
                form={formContent}
                name={`video_content_form`}
                layout="vertical"
                onValuesChange={handleChange}
                >
                  <Form.Item
                      label="视频链接(可选)"
                      name="link"
                  >
                      <TextArea rows={2} maxLength={300} showCount />
                  </Form.Item>
                  <Form.Item
                      label="视频嵌入代码(参考bibili的iframe模式)"
                      name="code"
                  >
                      <TextArea rows={3} maxLength={300} showCount />
                  </Form.Item>
              </Form>
            </TabPane>
      </Tabs>
      <div className={styles.preview}>
        {
          !!val.link && <video src={val.link} controls style={{width: '100%'}}></video>
        }
        {
          !!val.code && <div dangerouslySetInnerHTML={{__html: val.code}} />
        }
      </div>
      <Modal 
        title="发布设置" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="立即发布"
        cancelText="取消"
      >
        <Form
         form={form}
         name={`video_form`}
         {...formItemLayout}
        >
            <Form.Item
                label="分类"
                name="cate"
                rules={[{ required: true, message: '请输入视频分类' }]}
            >
                <Select mode="tags" style={{ width: '100%' }} placeholder="请选择视频分类">
                    {
                        [
                            { key: 'lowcode', cn: '低代码平台' },
                            { key: 'screen', cn: '可视化大屏编辑器' },
                            { key: 'h5', cn: 'H5编辑器' },
                            { key: 'admin', cn: '后台管理模版' },
                            { key: 'github', cn: '开源项目' },
                        ].map((item, i) => {
                            return <Option key={i.toString(36) + i} value={item.cn}>{ item.cn }</Option>
                        })
                    }
                </Select>
            </Form.Item>
            <Form.Item
                label="描述"
                name="desc"
                rules={[{ required: true, message: '请输入视频描述' }]}
            >
                <TextArea rows={4} maxLength={150} showCount />
            </Form.Item>
            <Form.Item
                label="封面"
                name="face"
                valuePropName="fileList"
            >
                <MyUpload />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default connect(({ users }: ConnectState) => ({
    userConfig: users.userConfig
  }))(ArticleEdit)
