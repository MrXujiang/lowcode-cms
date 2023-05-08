import { Button, Tabs, message, Input, Modal, Dropdown, Form, Select } from 'antd'
import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import BraftEditor from 'braft-editor'
import MyUpload from '@/components/Upload'
import 'braft-editor/dist/index.css'
import { ContentUtils } from 'braft-utils'
import ForEditor from 'for-editor'
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
  const forEditor = useRef(null)
  const titleRef = useRef<any>(null)
  const [markdown, setMarkdown] = useState('')
  const [editType, setEditType] = useState(0)
  const [editorState, setEditorState] = useState<any>(BraftEditor.createEditorState(null))
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [curFormVal, setCurFormVal] = useState<any>(null);
  const [form] = Form.useForm();
  const id = location?.query?.id;
  // markdown
  const handleChangeText = useCallback(value => {
    setMarkdown(value)
  }, [])

  const addImg = useCallback((info) => {
    qnUpload(info).then((res:any) => {
      (forEditor.current as any).$img2Url(res.filename, res.url)
      // windows下正确显示
      // (forEditor.current as any).$img2Url(res.filename, res.url.replace(/\\/g, '/'))
    })
  }, [forEditor])

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
        req.get(`/note/get?id=${id}`).then((res:any) => {
            if(res) {
                const { val, title, type, cate, desc, face, ct } = res;
                titleRef.current.state.value = title;
                setCurFormVal({
                    cate,
                    desc,
                    face: [{
                        name: title + '.png',
                        status: 'done',
                        url: face,
                        uid: Date.now()
                    }],
                    ct
                })
                setEditType(type)
                if(type) {
                    setMarkdown(val)
                }else {
                    setEditorState(BraftEditor.createEditorState(val))
                }
            }
        })
      }
  }, [])

  useEffect(() => {
    function pasteFun(event: any) {
      const items = event.clipboardData && event.clipboardData.items
      let file
      if (items && items.length) {
        const item: any = Array.from(items).pop()
        if (item.type.indexOf('image') !== -1) {
          file = item.getAsFile()
          if (editType) {
            addImg(file)
          } else {
            qnUpload(file).then((res:any) => {
              setEditorState((prev: any) => {
                const result = ContentUtils.insertMedias(prev, [{
                  type: 'IMAGE',
                  url: res.url,
                }])
                return result
              })
            })
          }
        }
      }
    }

    document.querySelector('#for-container') && (document.querySelector('#for-container') as HTMLElement).addEventListener('paste', pasteFun, false);
    return () => {
      document.querySelector('#for-container') && (document.querySelector('#for-container') as HTMLElement).removeEventListener('paste', pasteFun, false)
    }
  }, [editType])

  const tabChange = (v:string) => {
    setEditType(+v)
  }

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
        const val = editType ? markdown : __html;
        if(id) {
            req.put('/note/mod', {
                fid: id,
                title: titleRef.current.state.value,
                author,
                cate,
                ct: curFormVal.ct,
                face: face && face[0].url,
                desc,
                type: editType,
                val
             }).then(res => {
                setIsModalVisible(false);
                message.success('发布成功', 1, () => {
                    goBack()
                 })
             })
        }else {
            req.post('/note/add', {
                title: titleRef.current.state.value,
                author,
                cate,
                face: face && face[0].url,
                desc,
                type: editType,
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

  const handlechange = () => {
    // onFinish(form.getFieldsValue());
    // console.log(1, form.getFieldsValue())
  };

  const goBack = () => {
      history.push('/notes')
  }

  const doReview = (flag: 1 | 2) => {
    req.post('/note/review', { id, flag }).then(res => {
        history.push('/notes')
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
        activeKey={editType + ''} 
        tabBarExtraContent={operations} 
        className={styles.tabWrap}
        onChange={tabChange}
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
            <TabPane tab="markdown" key="1">
                <div id="for-container">
                    <ForEditor
                        ref={forEditor}
                        height="calc(100vh - 50px)"
                        value={markdown}
                        onChange={handleChangeText}
                        addImg={addImg}
                        lineNum={0}
                        toolbar={{
                            h1: true,
                            h2: true,
                            h3: true,
                            h4: true,
                            img: true,
                            link: true,
                            code: true,
                            expand: true,
                            undo: true,
                            redo: true,
                        }}
                    />
                </div>  
            </TabPane>
      </Tabs>
      <div className={styles.preview}>
        {editType
            ? (
              <ForEditor
                preview
                height={'calc(100vh - 50px)'}
                value={markdown}
                lineNum={0}
                toolbar={{}}
              />
            )
            : (
              <div className={styles.richText} id="preview_rich" dangerouslySetInnerHTML={{ __html }} />
            )}
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
         name={`article_form`}
         {...formItemLayout}
         onValuesChange={handlechange}
        >
            <Form.Item
                label="分类"
                name="cate"
                rules={[{ required: true, message: '请输入文章分类' }]}
            >
                <Select mode="tags" style={{ width: '100%' }} placeholder="请选择文章分类">
                    {
                        [
                            { key: 'product', cn: '产品分享' },
                            { key: 'think', cn: '深度思考' },
                            { key: 'tec', cn: '技术复盘' },
                            { key: 'github', cn: '开源推荐' },
                            { key: 'bussiness', cn: '商业报道' }
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
