import fs from 'fs'
import { nanoid } from 'nanoid'
import { delFile, WF, RF } from '../lib/upload'
import { auth, superEntry, useVip } from '../service'
import config from '../config'
import htr from '../lib/htr'
import glob from 'glob'

/**
 * 视频路由
 * @param {*} router 
 * @param {*} apiPath
 * 待优化：1.将成功响应和失败响应统一封装 
 */
const articleRouter = (router, apiPath) => {
  // api路径
  const api = {
    add: apiPath + '/videos/add',
    mod: apiPath + '/videos/mod',
    get: apiPath + '/videos/get',
    del: apiPath + '/videos/del',
    all: apiPath + '/videos/all',
    allPublic: apiPath + '/videos/all/public',
    topArticle: apiPath + '/video/top',
    cancelTopArticle: apiPath + '/video/untop',
    review: apiPath + '/video/review',
    getArticleNum: apiPath + '/videos/num',
    getAnazly: apiPath + '/videos/anazly',
    getWeekLog: apiPath + '/videos/weeklog',
    comment: apiPath + '/video/comment/save',
    comments: apiPath + '/video/comments',
    addFlover: apiPath + '/video/flover/add',
    saveDraft: apiPath + '/videos/draft/save',
    getDrafts: apiPath + '/videos/drafts',
    getDraft: apiPath + '/videos/draft/get',
    delDraft: apiPath + '/videos/draft/del',
    editDraft: apiPath + '/videos/draft/edit'
  }
  // 添加视频
  router.post(api.add,
    auth,
    async ctx => {
      let { title, author, cate, face, desc, link, code } = ctx.request.body;
      if(title && cate && (link || code)) {
        // 1. 写入视频数据
        const fid = nanoid(10);
        const ct = Date.now();
        const filename = `${config.publicPath}/db/videos/${fid}.json`;
        try {
          const res = WF(filename, { fid, title, author, desc, face, cate, ct, link, code })
          if(res) {
            ctx.body = htr(200, {fid}, '视频发布成功')
          }
        }catch(err) {
          ctx.status = 200
          ctx.body = htr(500, null, '视频写入错误')
        }

        // 2. 将视频索引添加到索引文件中
        const indexFilePath = `${config.publicPath}/db/video_index.json`
        try{
          WF(indexFilePath, { fid, title, cate, face, ct, review: 0 }, 1)
        }catch(err) {
          console.log('addVideo', err)
        }
      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '内容不完整, 视频发布失败')
      }
    }
  );

  // 修改视频
  router.put(api.mod,
    auth,
    async ctx => {
      let { fid, title, author, cate, top, face, desc, link, code } = ctx.request.body;
      if(fid && title && (link || code)) {
        // 1. 更新文件
        const filePath = `${config.publicPath}/db/videos/${fid}.json`
        const ut = Date.now()
        try {
          const res = WF(filePath, { fid, title, author, face, desc, cate, link, code })
          if(res) {
            ctx.body = htr(200, { fid }, '视频修改成功')
          }
        }catch(err) {
          ctx.status =500
          ctx.body = htr(500, null, '服务器错误, 视频修改失败')
        }
        
        // 2. 修改视频索引
        const indexFilePath = `${config.publicPath}/db/video_index.json`
        
        try {
          let articles = RF(indexFilePath)
          articles = articles.map(item => {
            if(item.fid === fid) {
              return {
                fid, title, top, cate, face, review: 0
              }
            }
            return item
          })

          WF(indexFilePath, articles)
        }catch(err) {
          console.log('mod video', err)
        }
      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '内容不完整, 视频发布失败')
      }
    }
  );

  // 查看视频
  router.get(api.get,
    ctx => {
      let { id } = ctx.query;
      if(id) {
        const articlePath = `${config.publicPath}/db/videos/${id}.json`
        if (!fs.existsSync(articlePath)) {
          ctx.status = 200
          ctx.body = htr(500, null, '文件不存在')
        }else {
          const articleStr = fs.readFileSync(articlePath);
          try{
            const article = JSON.parse(articleStr);
            ctx.body = htr(200, article)
          }catch(err) {
            console.error(err)
          }
        }
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, '参数不存在')
      }
    }
  );

  // 删除视频
  router.delete(api.del,
    auth,
    async ctx => {
      const { id } = ctx.query
      if(id) {
        const articlePath = `${config.publicPath}/db/videos/${id}.json`
        const articleIdxPath = `${config.publicPath}/db/video_index.json`
        // 1.删除视频
        if(fs.existsSync(articlePath)) {
          const err = await delFile(articlePath)
          if(!err) {
            ctx.body = htr(200, null, '删除成功')
  
            // 2.删除视频索引
            let articles = RF(articleIdxPath);
            articles = articles.filter(item => item.fid !== id);
            const res = WF(articleIdxPath, articles);
            if(res) {
              ctx.set('x-show-msg', 'zxzk_msg_200')
              ctx.body = htr(200, { id }, '视频删除成功')
            }
          }else {
            ctx.status = 500
            ctx.body = htr(500, null, '文件不存在，删除失败')
          } 
        }else {
          ctx.status = 500
          ctx.body = htr(500, null, '文件不存在, 请刷新页面查看最新数据')
        }
        
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, 'id不能为空')
      }  
    }
  );

  // 获取视频列表(后台)
  router.get(api.all,
    auth,
    ctx => {
      const { q, p, s } = ctx.query
      const { n, role } = useVip(ctx)
      const articleIdxPath = `${config.publicPath}/db/video_index.json`
      let articleIdxs = RF(articleIdxPath)
      articleIdxs = role === '0' ? articleIdxs : articleIdxs.filter(v => v.author === n)
      if(!p || !s) {
        ctx.body = htr(200, q ? articleIdxs.filter(v => (v.title + v.desc).indexOf(q) > -1) : articleIdxs.reverse())
      }else {
        ctx.body = htr(200, articleIdxs.reverse().slice(0, p * s))
      }
    }
  );

  // 获取产品列表(前台)
  router.get(api.allPublic,
    ctx => {
      const { q, p, s } = ctx.query
      const articleIdxPath = `${config.publicPath}/db/video_index.json`
      const articleIdxs = RF(articleIdxPath)
      if(!p || !s) {
        ctx.body = htr(200, q ? articleIdxs.filter(v => v.review === 1).filter(v => (v.title + v.desc).indexOf(q) > -1) : articleIdxs.filter(v => v.review === 1))
      }else {
        ctx.body = htr(200, articleIdxs.filter(v => v.review === 1).slice((p - 1) * s, p * s))
      }
    }
  );

  // 置顶视频
  router.post(api.topArticle,
    auth,
    superEntry,
    ctx => {
      const { id } = ctx.query
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/video_index.json`
        let articleIdxs = RF(articleIdxPath)
        let curArticle = null
        articleIdxs = articleIdxs.filter(item => {
          if(item.fid === id) {
            curArticle = {...item, top: true}
            return false
          }
          return true
        })

        articleIdxs.unshift(curArticle)

        WF(articleIdxPath, articleIdxs)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '已置顶')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数不能为空')
      } 
    }
  );

  // 取消置顶视频
  router.post(api.cancelTopArticle,
    auth,
    superEntry,
    ctx => {
      const { id } = ctx.query
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/video_index.json`
        let articleIdxs = RF(articleIdxPath)
        articleIdxs = articleIdxs.map(item => {
          return {
            ...item,
            top: item.fid === id ? false : !!item.top
          }
        })

        WF(articleIdxPath, articleIdxs)

        ctx.status = 200
        ctx.body = htr(200, null, '已取消置顶')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数不能为空')
      } 
    }
  );

  // 审核视频
  router.post(api.review,
    auth,
    superEntry,
    ctx => {
      const { id, flag } = ctx.request.body;
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/video_index.json`
        let articleIdxs = RF(articleIdxPath)
        articleIdxs = articleIdxs.map(item => {
          return {
            ...item,
            review: item.fid === id ? flag : item.review
          }
        })

        WF(articleIdxPath, articleIdxs)

        ctx.status = 200
        ctx.set('x-show-msg', 'zxzk_msg_200')
        ctx.body = htr(200, null, '已审核')
      }else {
        ctx.status = 500
        ctx.body = htr(500, null, '参数不能为空')
      } 
    }
  );

  // 获取视频总数
  router.get(api.getArticleNum,
    ctx => {
      const articleIdxPath = `${config.publicPath}/db/video_index.json`
      const articleIdxs = RF(articleIdxPath)
      ctx.body = htr(200, {num: articleIdxs.length})
    }
  );

  // 获取视频统计数据(访问量, 点赞数, 评论数)
  router.get(api.getAnazly,
    auth,
    ctx => {
      const result = {
        flovers: 0,
        comments: 0,
        views: 0
      };
      glob.sync(`${config.publicPath}/db/comments/*.json`).forEach(item => {
        const row = RF(item);
        result.flovers += row.flover;
        result.comments += row.comments && row.comments.length || 0
        result.views += row.views;
      })
      ctx.body = htr(200, result)
    }
  );
  
  // 获取视频周统计数据(访问量, 点赞数, 评论数)
  router.get(api.getWeekLog,
    auth,
    ctx => {
      const weekLog = `${config.publicPath}/db/weekLog.json`;
      const result = RF(weekLog);
      ctx.body = htr(200, result)
    }
  );

  
  /******* 评论/点赞功能 **************/
  // 评论
  router.post(api.comment,
    auth,
    ctx => {
      let { id, comment } = ctx.request.body;
      if(id && comment) {
        const commentPath = `${config.publicPath}/db/comments/${id}.json`
        const res = RF(commentPath)
        let result
        if(res) {
          if(res.comments) {
            res.comments = [...res.comments, {text: comment, id: nanoid(4)}]
            result = WF(commentPath, res)
          }else {
            res.comments = [{text: comment, id: nanoid(4)}]
            result = WF(commentPath, res)
          }
        }else {
          const comment_config = {
            flover: 0,
            comments: [{text: comment, id: nanoid(4)}],
            views: 1
          }
          result = WF(commentPath, comment_config)
        }

        if(result) {
          ctx.status = 200
          ctx.body = htr(200, null, '评论成功')
          return
        }

        ctx.status = 500
        ctx.body = htr(500, null, '服务器错误')
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, '缺少参数')
      }
    }
  );

  // 点赞
  router.post(api.addFlover,
    ctx => {
      let { id } = ctx.request.body;
      if(id) {
        const commentPath = `${config.publicPath}/db/comments/${id}.json`
        const res = RF(commentPath)
        let result
        if(res) {
          if(res.flover) {
            res.flover = res.flover + 1
            result = WF(commentPath, res)
          }else {
            res.flover = 1
            result = WF(commentPath, res)
          }
        }else {
          const comment_config = {
            flover: 1,
            comments: [],
            views: 1
          }
          result = WF(commentPath, comment_config)
        }
        
        if(result) {
          ctx.status = 200
          ctx.body = htr(200, null, '已赞')
          return
        }

        ctx.status = 500
        ctx.body = htr(500, null, '服务器错误')
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, '缺少参数')
      }
    }
  );

  // 获取视频访问量, 点赞数据
  router.get(api.comments,
    ctx => {
      let { id } = ctx.query;
      if(id) {
        const commentPath = `${config.publicPath}/db/comments/${id}.json`
        const res = RF(commentPath)
        let result
        if(res) {
          res.views = res.views + 1;
          result = res
        }else {
          const comment_config = {
            flover: 0,
            comments: [],
            views: 1
          }
          result = comment_config
        }
        
        if(result) {
          ctx.status = 200
          ctx.body = htr(200, result)
          WF(commentPath, result)
          return
        }

        ctx.status = 500
        ctx.body = htr(500, null, '服务器错误')
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, '缺少参数')
      }
    }
  );
  
  /************* 草稿功能 ************/
  // 保存草稿
  router.post(api.saveDraft,
    auth,
    async ctx => {
      let { title, author, cate, face, visible, desc, type, val } = ctx.request.body;
      if(title) {
        // 1. 写入视频数据
        const fid = nanoid(10);
        const filename = `${config.publicPath}/db/drafts/${fid}.json`;
        const ct = Date.now();
        try {
          // type  0 富文本  1 markdown
          const res = WF(filename, { fid, title, author, face,  cate, ct, type, val })
          if(res) {
            ctx.body = htr(200, {fid}, '草稿保存成功')
          }
        }catch(err) {
          ctx.status = 200
          ctx.body = htr(500, null, '草稿写入错误')
        }

        // 2. 将草稿视频索引添加到索引文件中
        const indexFilePath = `${config.publicPath}/db/draft_index.json`
        try{
          WF(indexFilePath, { fid, title, author, cate, face, desc, ct }, 1)
        }catch(err) {
          console.log('saveDraft', err)
        }

      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '标题不能为空, 草稿保存失败')
      }
    }
  );

  // 修改草稿
  router.put(api.editDraft,
    auth,
    async ctx => {
      let { fid, title, author, cate, face, type, desc, val, ct } = ctx.request.body;
      if(fid && title && author && cate && val) {
        // 1. 更新文件
        const filePath = `${config.publicPath}/db/drafts/${fid}.json`
        const ut = Date.now()
        try {
          const res = WF(filePath, { fid, title, author, face, cate, ct, ut, type, val })
          if(res) {
            ctx.body = htr(200, { fid }, '草稿修改成功')
          }
        }catch(err) {
          ctx.status = 200
          ctx.body = htr(500, null, '服务器错误, 视频修改失败')
        }
        
        // 2. 修改视频索引
        const indexFilePath = `${config.publicPath}/db/draft_index.json`
        
        try {
          let articles = RF(indexFilePath)
          articles = articles.map(item => {
            if(item.fid === fid) {
              return {
                fid, title, author, cate, face, desc, ct: item.ct, ut
              }
            }
            return item
          })

          WF(indexFilePath, articles)
        }catch(err) {
          console.log('mod draft', err)
        }
      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '内容不完整, 草稿修改失败')
      }
    }
  );

  // 获取草稿箱内容列表
  router.get(api.getDrafts,
    auth,
    ctx => {
      const draftIdxPath = `${config.publicPath}/db/draft_index.json`
      const drafts = RF(draftIdxPath)
      ctx.body = htr(200, drafts)
    }
  )

  // 查看草稿
  router.get(api.getDraft,
    ctx => {
      let { id } = ctx.query;
      if(id) {
        const draftPath = `${config.publicPath}/db/drafts/${id}.json`
        if (!fs.existsSync(draftPath)) {
          ctx.status = 200
          ctx.body = htr(500, null, '文件不存在')
        }else {
          const articleStr = fs.readFileSync(draftPath);
          try{
            const article = JSON.parse(articleStr);
            ctx.body = htr(200, article)
          }catch(err) {
            console.error(err)
          }
        }
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, '参数不存在')
      }
    }
  );

  // 删除草稿
  router.delete(api.delDraft,
    auth,
    async ctx => {
      const { id } = ctx.query
      if(id) {
        const articlePath = `${config.publicPath}/db/drafts/${id}.json`
        const articleIdxPath = `${config.publicPath}/db/draft_index.json`

        if(fs.existsSync(articlePath)) {
          const err = await delFile(articlePath)
          if(!err) {
            ctx.body = htr(200, null, '删除成功')
  
            // 2.删除视频索引
            let articles = RF(articleIdxPath);
            articles = articles.filter(item => item.fid !== id);
            const res = WF(articleIdxPath, articles);
            if(res) {
              ctx.body = htr(200, { id }, '草稿删除成功')
            }
          }else {
            ctx.status = 200
            ctx.body = htr(500, null, '文件不存在，删除失败')
          } 
        }else {
          ctx.body = htr(500, null, '文件不存在, 请刷新页面查看最新数据')
        }
        
      }else {
        ctx.status = 200
        ctx.body = htr(500, null, 'id不能为空')
      }  
    }
  );
}

export default articleRouter