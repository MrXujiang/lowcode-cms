import glob from 'glob'
import { uploadSingleCatchError, delFile } from '../lib/upload'
import config from '../config'
import htr from '../lib/htr'
import { auth } from '../service'
import os from 'os'
import qiniu from 'qiniu'
import multiparty from 'multiparty'

const mac = new qiniu.auth.digest.Mac(config.ak, config.sk);
const config2 = new qiniu.conf.Config();
// 这里主要是为了用 node sdk 的 form 直传，结合 demo 中 form 方式来实现无刷新上传
config2.zone = qiniu.zone.Zone_z0;
const formUploader = new qiniu.form_up.FormUploader(config2);
const putExtra = new qiniu.form_up.PutExtra();
const options = {
  scope: config.Bucket,
// 上传策略设置文件过期时间，正式环境中要谨慎使用，文件在存储空间保存一天后删除
  // deleteAfterDays: 1, 
  callbackBodyType: "application/json",
  callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),}',
  returnBody:
    '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize)}'
};

const putPolicy = new qiniu.rs.PutPolicy(options);
const bucketManager = new qiniu.rs.BucketManager(mac, null);

const os_flag = (os.platform().toLowerCase() === 'win32') ? '\\' : '/';

const uploadRouter = (router, apiPath) => {
    const api = {
      qnUploadToken: apiPath + '/uptoken',
      qnUpload: apiPath + '/upload',
      upload: apiPath + '/files/upload',
      uploadFree: apiPath + '/files/upload/free',
      uploadTx: apiPath + '/files/upload/tx',
      files: apiPath + '/files/all',
      del: apiPath + '/files/del',
    }
    // 获取token
    router.get(api.qnUploadToken,
      auth,
      ctx => {
        const token = putPolicy.uploadToken(mac);
        ctx.set("Cache-Control", "max-age=0, private, must-revalidate");
        ctx.set("Pragma", "no-cache");
        ctx.set("Expires", 0);
        if (token) {
          ctx.status = 200;
          ctx.body = htr(200, {
            uptoken: token,
            domain: config.Domain
          })
        }
      }
    );
    // 上传文件到七牛云
    router.post(api.qnUpload,
      auth,
      ctx => {
        const form = new multiparty.Form();
        form.parse(ctx.req, function(err, fields, files) {
          const path = files.file[0].path;
          const token = fields.token[0];
          const key = fields.key[0];
          formUploader.putFile(token, key, path, putExtra, function(
            respErr,
            respBody,
            respInfo
          ) {
            if (respErr) {
              console.log(respErr);
              throw respErr;
            }
            if (respInfo.statusCode == 200) {
              ctx.body = htr(200, respBody)
            } else {
              console.log(respInfo.statusCode);
              console.log(respBody);
            }
          });
        });
      }
    );
    // 上传文件
    router.post(api.upload, auth, uploadSingleCatchError,
      ctx => {
          let { filename, path, size } = ctx.file;
          let { source } = ctx.request.body || 'unknow';

          let url = `${config.staticPath}${path.split(`${os_flag}public`)[1]}`
          
          ctx.body = htr(200, {filename, url, source, size}, '文件上传成功')
      }
    );

    // 免费上传文件
    router.post(api.uploadFree, uploadSingleCatchError,
      ctx => {
          let { filename, path, size } = ctx.file;
          let { source } = ctx.request.body || 'unknow';

          let url = `${config.staticPath}${path.split(`${os_flag}public`)[1]}`
          
          ctx.body = htr(200, {filename, url, source, size}, '文件上传成功')
      }
    );

    router.post(api.uploadTx, uploadSingleCatchError,
      ctx => {
          let { filename, path, size } = ctx.file;
          let { source } = ctx.request.body || 'unknow';

          let url = `${config.staticPath}${path.split(`${os_flag}public`)[1]}`
          
          ctx.body = htr(200, {filename, url, source, size}, '文件上传成功')
      }
    );

    // 读取文件
    router.get(api.files,
      ctx => {
          const files = glob.sync(`${config.publicPath}${os_flag}uploads/*`)
          const result = files.map(item => {
              return `${config.staticPath}${item.split('public')[1]}`
          })
          ctx.body = htr(200, result)
      }
    );

    // 删除文件
    router.delete(api.del,
      auth,
      async ctx => {
        const { id } = ctx.query
        if(id) {
            const err = await delFile(`${config.publicPath}${os_flag}uploads${os_flag}${id}`)
            if(!err) {
              ctx.body = htr(200, null, '删除成功')
            }else {
              ctx.code = 500
              ctx.body = htr(500, null, '文件不存在，删除失败')
            } 
        }else {
            ctx.status = 200
            ctx.body = htr(500, null, 'id不能为空')
        }  
      }
    );
}

export default uploadRouter