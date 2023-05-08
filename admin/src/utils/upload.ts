import * as qiniu from 'qiniu-js';
import req from '@/utils/req';

const _upload = (file:File, success?:Function, fail?:Function) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    req.post('/files/upload/free', formData).then((res:any) => {
        success && success({filename:file.name, url: res.url})
    }).catch(err => {
        fail && fail(err)
    })
}

const qnUpload = (file:File) => {
    return new Promise((resolve, reject) => {
        req.get('/uptoken').then((res:any) => {
            const { uptoken, domain } = res;
            const filename = file.name
            if(uptoken) {
                const suffix = filename.substring(filename.lastIndexOf('.'), filename.length)
                const putExtra = {
                  fname: filename,
                  params: {}
                }
                let config = {
                  useCdnDomain: true,
                  region: qiniu.region.z0,
                  debugLogLevel: 'INFO'
                };
                const uid = 'dr/' + Date.now() + suffix
                const observe = qiniu.upload(file, uid, uptoken, putExtra, config)
                observe.subscribe(() => {}, null, (res) => {
                    const url = `${domain}/${res.key}`;
                    resolve({filename, url})
                })
            }else {
                _upload(
                    file, 
                    (data:any) => resolve(data),
                    (err:Error) => reject(err)
                )
            }
        }).catch(err => {
            _upload(
                file, 
                (data:any) => resolve(data),
                (err:Error) => reject(err)
            )
        })
    })
}

export default qnUpload