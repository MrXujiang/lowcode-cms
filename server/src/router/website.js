import { WF, RF } from '../lib/upload'
import { auth, superEntry } from '../service'
import { nanoid } from 'nanoid'
import config from '../config'
import htr from '../lib/htr'

const settingRouter = (router, apiPath) => {
  // api路径
  const api = {
    // 页面统计面板
    getDashBoard: apiPath + '/dashboard',
    getConfig: apiPath + '/config/get',
    // banner
    addBanner: apiPath + '/config/banner/add',
    editBanner: apiPath + '/config/banner/edit',
    delBanner: apiPath + '/config/banner/del',
    // news
    addNew: apiPath + '/config/news/add',
    editNew: apiPath + '/config/news/edit',
    delNew: apiPath + '/config/news/del',
    // social
    addCor: apiPath + '/config/cors/add',
    editCor: apiPath + '/config/cors/edit',
    delCor: apiPath + '/config/cors/del',
  }

  // 页面统计
  router.get(api.getDashBoard,
    auth,
    async ctx => {
      const viewPath = `${config.publicPath}/db/views.json`;
      const articlePath = `${config.publicPath}/db/article_index.json`;
      const productPath = `${config.publicPath}/db/product_index.json`;
      const videoPath = `${config.publicPath}/db/video_index.json`;
      const corsPath = `${config.publicPath}/db/homeConfig.json`;
      const views = RF(viewPath);
      const articles = RF(articlePath);
      const products = RF(productPath);
      const videos = RF(videoPath);
      const cors = RF(corsPath);
      ctx.status = 200;
      ctx.body = htr(200, {
        views,
        articles: articles.length,
        videos: videos.length,
        products: products.length,
        cors: cors.cors.length
      });
    }
  );

  // 查看配置信息
  router.get(api.getConfig,
    auth,
    superEntry,
    async ctx => {
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      const data = RF(filePath);
      ctx.status = 200;
      ctx.body = htr(200, data);
    }
  );
  // 添加banner
  router.post(api.addBanner,
    auth,
    superEntry,
    async ctx => {
      let { title, img, link } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(title && img) {
        const config = RF(filePath);
        config.banner.push({
          tid: nanoid(6),
          title,
          img,
          link
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '添加成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 修改banner
  router.put(api.editBanner,
    auth,
    superEntry,
    async ctx => {
      let { tid, title, img, link } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid && title && img) {
        const config = RF(filePath);
        config.banner = config.banner.map(v => {
          if(tid === v.tid) {
            return { tid, title, img, link }
          }
          return v
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '修改成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 删除banner
  router.delete(api.delBanner,
    auth,
    superEntry,
    async ctx => {
      let { tid } = ctx.query;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid) {
        const config = RF(filePath);
        config.banner = config.banner.filter(v => v.tid !== tid)
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '删除成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 添加new
  router.post(api.addNew,
    auth,
    superEntry,
    async ctx => {
      let { title, desc } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(title && desc) {
        const config = RF(filePath);
        config.news.push({
          tid: nanoid(6),
          title,
          desc
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '添加成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 修改new
  router.put(api.editNew,
    auth,
    superEntry,
    async ctx => {
      let { tid, title, desc } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid && title) {
        const config = RF(filePath);
        config.news = config.news.map(v => {
          if(tid === v.tid) {
            return { tid, title, desc }
          }
          return v
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '修改成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 删除new
  router.delete(api.delNew,
    auth,
    superEntry,
    async ctx => {
      let { tid } = ctx.query;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid) {
        const config = RF(filePath);
        config.news = config.news.filter(v => v.tid !== tid)
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '删除成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 添加cor
  router.post(api.addCor,
    auth,
    superEntry,
    async ctx => {
      let { title, desc, img, link } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(title && img) {
        const config = RF(filePath);
        config.cors.push({
          tid: nanoid(6),
          title,
          img,
          desc,
          link
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '添加成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 修改cor
  router.put(api.editCor,
    auth,
    superEntry,
    async ctx => {
      let { tid, title, desc, img, link } = ctx.request.body;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid && title && img) {
        const config = RF(filePath);
        config.cors = config.cors.map(v => {
          if(tid === v.tid) {
            return { tid, title, desc, img, link }
          }
          return v
        })
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '修改成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );

  // 删除cor
  router.delete(api.delCor,
    auth,
    superEntry,
    async ctx => {
      let { tid } = ctx.query;
      const filePath = `${config.publicPath}/db/homeConfig.json`;
      
      if(tid) {
        const config = RF(filePath);
        config.cors = config.cors.filter(v => v.tid !== tid)
        WF(filePath, config)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '删除成功')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数缺少')
      }
    }
  );
}

export default settingRouter