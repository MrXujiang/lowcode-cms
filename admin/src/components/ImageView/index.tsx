import { Modal, Button } from 'antd'

interface IProps {
    url?: string;
    title?: string;
}

export default function({ url, title }:IProps) {
    const showFace = () => {
        Modal.info({
          title,
          icon: null,
          content: (
            <div style={{maxWidth: '800px'}}>
              <img src={url} alt="" style={{width: '100%'}} />
            </div>
          ),
          okText: "关闭"
        })
      }
    return <Button type="primary" size="small" onClick={showFace}> 查看 </Button>
}