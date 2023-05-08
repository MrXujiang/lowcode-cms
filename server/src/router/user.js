import { auth, superEntry } from '../service'
import { nanoid } from 'nanoid'
import { RF, WF } from '../lib/upload'
import config from '../config'
import htr from '../lib/htr'
import { encrypt } from '../service'

const userRouter = (router, apiPath) => {
  // api路径
  const api = {
    login: apiPath + '/user/login',
    getUsers: apiPath + '/user/all',
    generatCode: apiPath + '/user/code',
    delUser: apiPath + '/user/del',
    register: apiPath + '/user/register',
    checkUser: apiPath + '/user/check',
    modUser: apiPath + '/user/mod'
  }

  // 登录逻辑
  router.post(api.login,
    async ctx => {
        const { name, pwd } = ctx.request.body;
        const filePath = `${config.publicPath}/db/user/user.json`;
        const data = RF(filePath);
        const _pwd = encrypt(pwd);
        const user = data.filter(item => (item.name === name) && (item.pwd === _pwd))[0];
        if(user) {
            ctx.cookies.set('uid', _pwd, { maxAge: 3 * 24 * 3600 * 1000 });
            ctx.cookies.set('role', user.role,  { maxAge: 3 * 24 * 3600 * 1000 });
            ctx.status = 200;
            ctx.set('x-show-msg', 'zxzk_msg_200');
            const { name, role, uid } = user;
            ctx.body = htr(200, { name, role, uid, maxage: 3 * 24 * 3600 * 1000 }, '登录成功');
        }else {
            ctx.status = 500
            ctx.body = htr(500, null, '用户名/密码错误')
        }
    }
  );

  // 注册逻辑
  router.post(api.register,
    async ctx => {
      const { code, name, pwd, tag } = ctx.request.body;
      const filePath = `${config.publicPath}/db/user/codeList.json`;
      const userPath = `${config.publicPath}/db/user/user.json`;
      if(code && name && pwd) {
        // 判断用户名是否存在
        const users = RF(userPath)
        const isExist = users.filter(v => v.name === name)[0];
        if(isExist) {
          ctx.status = 500;
          ctx.body = htr(500, null, '用户名已存在');
          return
        }

        const whiteList = RF(filePath);
        if(whiteList.includes(code)) {
          const userData = {
            uid: nanoid(8),
            name,
            pwd: encrypt(pwd),
            tag,
            role: 1,
            articles: 0
          }
          WF(userPath, userData, 1)
          ctx.status = 200;
          ctx.set('x-show-msg', 'zxzk_msg_200');
          ctx.body = htr(200, null, '注册成功');
          // 删除白名单的code
          WF(filePath, whiteList.filter(v => v !== code))
        }else {
          ctx.status = 500;
          ctx.body = htr(500, null, '没有权限或您已注册, 请加 徐小夕 微信获取权限');
        }
      } else {
        ctx.status = 500;
        ctx.body = htr(500, null, '缺少参数');
      }
    }
  );

  // 查询用户信息
  router.get(api.checkUser,
    async ctx => {
        const { name, uid } = ctx.query;
        const filePath = `${config.publicPath}/db/user/user.json`;
        const data = RF(filePath);
        const user = data.filter(item => (item.name === name) && (item.uid === uid))[0];
        if(user) {
            ctx.status = 200;
            const { name, pwd, tag } = user;
            ctx.body = htr(200, { name, pwd, tag });
        }else {
            ctx.status = 500
            ctx.body = htr(500, null, '用户名不存在')
        }
    }
  );

  // 修改用户信息逻辑
  router.post(api.modUser,
    async ctx => {
        const { uid, name, pwd, tag } = ctx.request.body;
        const filePath = `${config.publicPath}/db/user/user.json`;
        const data = RF(filePath);
        const _pwd = encrypt(pwd);
        const user = data.filter(item => item.uid === uid)[0];
        if(user) {
            ctx.status = 200;
            ctx.set('x-show-msg', 'zxzk_msg_200');
            WF(filePath, data.map(v => {
              return v.uid === uid ? {...v, name, pwd: _pwd, tag} : v
            }))
            ctx.body = htr(200, null, '修改成功');
        }else {
            ctx.status = 500
            ctx.body = htr(500, null, '用户名不存在')
        }
    }
  );

  // 获取所有用户
  router.get(api.getUsers,
    auth,
    superEntry,
    async ctx => {
        const filePath = `${config.publicPath}/db/user/user.json`;
        const data = RF(filePath);
        ctx.status = 200;
        ctx.body = htr(200, data.map(v => {
          const { uid, tag, name, role, articles } = v;
          return { uid, tag, name, role, articles }
        }));
    }
  );

  // 生成激活码
  router.post(api.generatCode,
    auth,
    superEntry,
    async ctx => {
        const filePath = `${config.publicPath}/db/user/codeList.json`;
        const code = nanoid(8);
        WF(filePath, code, 1);
        ctx.status = 200;
        ctx.body = htr(200, code);
    }
  );

  // 删除用户
  router.delete(api.delUser,
    auth,
    superEntry,
    async ctx => {
      const { uid } = ctx.query;
      const filePath = `${config.publicPath}/db/user/user.json`;
      const data = RF(filePath);
      WF(filePath, data.filter(v => v.uid !== uid))
      ctx.status = 200;
      ctx.set('x-show-msg', 'zxzk_msg_200');
      ctx.body = htr(200, null, '删除成功');
    }
  );

}

export default userRouter