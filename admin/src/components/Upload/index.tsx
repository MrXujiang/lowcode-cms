import React from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { UploadFile, RcFile } from 'antd/lib/upload/interface';
import qnUpload from '@/utils/upload';
import styles from './index.less';

function getBase64(file: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

interface PicturesWallType {
  fileList?: UploadFile<any>[];
  action?: string;
  headers?: any;
  withCredentials?: boolean;
  maxLen?: number;
  onChange?: (v: any) => void;
  onRemove?: (v: any) => void;
  cropRate?: number | boolean;
  isCrop?: boolean;
}

class PicturesWall extends React.Component<PicturesWallType> {
  state = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: this.props.fileList || [],
    qnToken: localStorage.getItem('qnToken') ? JSON.parse(localStorage.getItem('qnToken') as string) : {domain: '', uptoken: ''},
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handleModalCancel = () => this.setState({ wallModalVisible: false });

  handlePreview = async (file: UploadFile<any>) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1),
    })
  }

  handleRemove = () => {
    this.props.onChange && this.props.onChange([])
    this.setState({fileList: []})
    return Promise.resolve(true)
  }

  handleBeforeUpload = (file:RcFile) => {
    const isJpgOrPng = file.type === 'image/svg+xml' || file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif';
    if (!isJpgOrPng) {
      message.error('只能上传格式为jpeg/png/gif/svg的图片');
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error('图片必须小于3MB!');
    }
    //七牛云上传
    if(isJpgOrPng && isLt3M) {
      qnUpload(file).then((res:any) => {
        const { url, filename } = res;
        const fileList = [{ uid: Date.now(), name: filename, status: 'done', url }];
        this.setState({
          fileList,
        })
        this.props.onChange && this.props.onChange(fileList)
      })
    }
    
    return isJpgOrPng && isLt3M;
  }

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
    const {
      action = 'http://123.com',
      headers,
      withCredentials = true,
      maxLen = 1,
      cropRate = 375/158,
      isCrop,
    } = this.props

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    return <>
      {
        isCrop ? (
          <ImgCrop modalTitle="裁剪图片" modalOk="确定" modalCancel="取消" rotate={true} aspect={cropRate as number}>
            <Upload
              fileList={fileList}
              onPreview={this.handlePreview}
              name="file"
              listType="picture-card"
              className={styles.avatarUploader}
              action={action}
              withCredentials={withCredentials}
              headers={{
                'x-requested-with': localStorage.getItem('user') || '',
                'authorization': localStorage.getItem('token') || '',
                ...headers
              }}
              beforeUpload={this.handleBeforeUpload}
              onRemove={this.handleRemove}
            >
              {fileList.length >= maxLen ? null : uploadButton}
            </Upload>
          </ImgCrop>) 
        : 
          <Upload
            fileList={fileList}
            onPreview={this.handlePreview}
            onRemove={this.handleRemove}
            name="file"
            listType="picture-card"
            className={styles.avatarUploader}
            action={action}
            withCredentials={withCredentials}
            headers={{
              'x-requested-with': localStorage.getItem('user') || '',
              'authorization': localStorage.getItem('token') || '',
              ...headers
            }}
            beforeUpload={this.handleBeforeUpload}
          >
            {fileList.length >= maxLen ? null : uploadButton}
          </Upload>
      }
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={this.handleCancel}
      >
        <img alt="预览图片" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  }
}

export default PicturesWall