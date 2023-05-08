import { Button, Tabs, message, Input, Modal, Dropdown, Form, Select } from 'antd'
import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import BraftEditor from 'braft-editor'
import MyUpload from '@/components/Upload'
import 'braft-editor/dist/index.css'
import req from '@/utils/req'
import qnUpload from '@/utils/upload'
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
  const [editorState, setEditorState] = useState<any>(BraftEditor.createEditorState(null))
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [curFormVal, setCurFormVal] = useState<any>(null);
  const [form] = Form.useForm();
  const id = location?.query?.id;

  // BraftEditor
  const __html = useMemo(() => editorState.toHTML(), [editorState])

  const handleEditorChange = useCallback(editorState => {
    setEditorState(editorState)
  }, [])

  const myUploadFn = (param:any) => {
    qnUpload(param.file).then((res:any) => {
      param.success({
        url: res.url,
        meta: {
          id: Date.now(),
          title: res.filename,
          alt: 'lowcode开发者社区'
        }
      })
    }).catch(err => {
      param.error({
        msg: '上传失败.'
      })
    })
  }

  useEffect(() => {
      if(id) {
        req.get(`/products/get?id=${id}`).then((res:any) => {
            if(res) {
                const { val, title, cate, desc, face, ct } = res;
                titleRef.current.state.value = title;
                setCurFormVal({
                    cate,
                    desc,
                    ct,
                    face: [{
                        name: title + '.png',
                        status: 'done',
                        url: face,
                        uid: Date.now()
                    }]
                })
                setEditorState(BraftEditor.createEditorState(val))
            }
        })
      }
  }, [])

  const handleSave = () => {
      if(titleRef.current.state.value) {
        setIsModalVisible(true)
        form.setFieldsValue(curFormVal)
      }else {
        message.error('请输入标题')
      }
  }

  const handleOk = () => {
    form.validateFields().then(values => {
        const { cate, face, desc } = values;
        const author = userConfig.name || localStorage.getItem('name')
        const val = __html;
        if(id) {
            req.put('/products/mod', {
                fid: id,
                title: titleRef.current.state.value,
                author,
                cate,
                ct: curFormVal.ct,
                face: face[0].url,
                desc,
                val
             }).then(res => {
                setIsModalVisible(false);
                message.success('发布成功', 1, () => {
                    goBack()
                 })
             })
        }else {
            req.post('/products/add', {
                title: titleRef.current.state.value,
                author,
                cate,
                face: face && face[0].url,
                desc,
                val
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
      history.push('/products')
  }

  const doReview = (flag: 1 | 2) => {
    req.post('/product/review', { id, flag }).then(res => {
        history.push('/products')
    })
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
            <TabPane tab="富文本" key="0">
                <div id="bf-container">
                    <BraftEditor
                        style={{
                            height: 'calc(100vh - 50px)',
                        }}
                        placeholder="开始编辑..."
                        value={editorState}
                        media={{uploadFn: myUploadFn}}
                        onChange={handleEditorChange}
                    />
                </div>
            </TabPane>
      </Tabs>
      <div className={styles.preview}>
        <div className={styles.richText} id="preview_rich" dangerouslySetInnerHTML={{ __html }} />
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
         name={`product_form`}
         {...formItemLayout}
        >
            <Form.Item
                label="分类"
                name="cate"
                rules={[{ required: true, message: '请输入产品分类' }]}
            >
                <Select mode="tags" style={{ width: '100%' }} placeholder="请选择产品分类">
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
                rules={[{ required: true, message: '请输入文章描述' }]}
            >
                <TextArea rows={4} maxLength={30} showCount />
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
