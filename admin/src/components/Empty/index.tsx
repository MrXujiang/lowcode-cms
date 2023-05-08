interface IProps {
    width?: string;
    text?: string;
}

export default function({ width, text }:IProps) {
    return <div style={{padding: '20px', textAlign: 'center'}}>
    <img style={{width: `${width || 360}px`}} src="https://vvbin.cn/next/assets/illustration.8e82152d.svg" alt="" />
    { !!text && 
      <div style={{
          color: '#888', 
          textAlign: 'center',
          marginTop: '6px'
        }}>
            { text }
        </div> 
    }
  </div>
}