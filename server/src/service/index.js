import { RF } from '../lib/upload'
import config from '../config'
import htr from '../lib/htr'
import { createHash } from 'crypto'

const useVip = (ctx) => ({ 
    co: ctx.cookies.get('uid'), 
    n: decodeURIComponent(ctx.request.header['x-requested-with']),
    role: ctx.cookies.get('role')
})

const encrypt = (content) => {
    let hash = createHash('sha1')
    hash.update(config.key + content)
    return hash.digest('hex')
}
const auth = async (ctx, next) => {
    const filePath = `${config.publicPath}/db/user/user.json`;
    const { co, n } = useVip(ctx);
    const data = RF(filePath);
    const vip = data.filter(item => (item.name === n) && (item.pwd === co))[0];
    if(vip) {
        await next()
    }else {
        ctx.status = 403;
        ctx.body = htr(403, null, '会员登录过期,请重新登录')
    }  
}

// 超级管理员专享
const superEntry = async (ctx, next) => {
    const isSuper = ctx.cookies.get('role') === '0';
    if(isSuper) {
        await next()
    }else {
        ctx.status = 406;
        ctx.body = htr(406, null, '权限不足')
    }  
}

export {
    auth,
    superEntry,
    encrypt,
    useVip
}