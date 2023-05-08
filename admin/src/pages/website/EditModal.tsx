import { Modal, Form, Input } from 'antd'
import { useEffect, memo, Fragment } from 'react'
import MyUpload from '@/components/Upload'

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

const { TextArea } = Input;

const formConfig = {
    banner: [
        {
            name: 'title',
            label: '标题',
            type: 'Input',
            require: true
        },
        {
            name: 'img',
            label: '图片',
            type: 'Upload',
            require: true
        },
        {
            name: 'link',
            label: '链接',
            type: 'Input',
            require: false
        }
    ],
    news: [
        {
            name: 'title',
            label: '标题',
            type: 'Input',
            require: true
        },
        {
            name: 'desc',
            label: '描述',
            type: 'TextArea',
            require: true
        },
    ],
    cors: [
        {
            name: 'title',
            label: '媒体名称',
            type: 'Input',
            require: true
        },
        {
            name: 'img',
            label: '媒体logo',
            type: 'Upload',
            require: true
        },
        {
            name: 'desc',
            label: '媒体描述',
            type: 'Input',
            require: false
        },
        {
            name: 'link',
            label: '媒体网址',
            type: 'Input',
            require: false
        },
    ]
}

export type ConfigType = 'banner' | 'news' | 'cors'

interface EditModalProp {
    showModal: boolean
    type: ConfigType
    initValue: any
    onOk:Function
    onCancel: Function
}

export default memo(({ showModal, type, initValue, onOk, onCancel }:EditModalProp) => {
    const [form] = Form.useForm();
    const handleOk = () => {
        form.validateFields().then((values:any) => {
            values.img && (values.img = values.img[0].url)
            onOk ? 
              initValue ? 
                onOk(1)(type, {...values, tid: initValue.tid}) : 
                  onOk(0)(type, values) : null
            form.resetFields()
        })
    }
    const handleCancel = () => {
        form.resetFields()
        onCancel && onCancel()
    }
    useEffect(() => {
        showModal && form.setFieldsValue(initValue)
    }, [showModal, initValue])
    return <div>
        <Modal 
            title="编辑内容" 
            visible={showModal} 
            onOk={handleOk} 
            onCancel={handleCancel}
            okText="发布"
            cancelText="取消"
            destroyOnClose
        >
            <Form
            form={form}
            name={`website_form`}
            {...formItemLayout}
            >
                {
                    formConfig[type].map((v, i) => {
                        return <Fragment key={i}>
                            {
                                v.type === 'Input' &&
                                <Form.Item
                                    label={v.label}
                                    name={v.name}
                                    rules={[{ required: v.require, message: '请输入' + v.name }]}
                                >
                                    <Input placeholder={'请输入' + v.label} />
                                </Form.Item>
                            }
                            {
                                v.type === 'TextArea' &&
                                <Form.Item
                                    label={v.label}
                                    name={v.name}
                                    rules={[{ required: v.require, message: '请输入' + v.label }]}
                                >
                                    <TextArea placeholder={'请输入' + v.label} maxLength={80} showCount />
                                </Form.Item>
                            }
                            {
                                v.type === 'Upload' &&
                                <Form.Item
                                    label={v.label}
                                    name={v.name}
                                    valuePropName="fileList"
                                    rules={[{ required: v.require, message: '请输入' + v.label }]}
                                >
                                    <MyUpload />
                                </Form.Item>
                            }
                        </Fragment>
                    })
                }
            </Form>
        </Modal>
    </div>
})