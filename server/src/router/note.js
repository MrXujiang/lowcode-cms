import fs from 'fs'
import { nanoid } from 'nanoid'
import { delFile, WF, RF } from '../lib/upload'
import { auth, superEntry, useVip } from '../service'
import config from '../config'
import htr from '../lib/htr'

/**
 * 文章路由
 * @param {*} router 
 * @param {*} apiPath
 * 待优化：1.将成功响应和失败响应统一封装 
 */
const NoteRouter = (router, apiPath) => {
  // api路径
  const api = {
    add: apiPath + '/note/add',
    mod: apiPath + '/note/mod',
    get: apiPath + '/note/get',
    del: apiPath + '/note/del',
    all: apiPath + '/note/all',
    allPublic: apiPath + '/note/all/public',
    topArticle: apiPath + '/note/top',
    cancelTopArticle: apiPath + '/note/untop',
    review: apiPath + '/note/review',
    getArticleNum: apiPath + '/note/num',
    comment: apiPath + '/note/comment/save',
    comments: apiPath + '/note/comments',
    addFlover: apiPath + '/note/flover/add',
  }
  // 添加文章
  router.post(api.add,
    auth,
    async ctx => {
      let { title, author, cate, face, type, desc, val } = ctx.request.body;
      if(title && cate && val) {
        // 1. 写入文章数据
        const fid = nanoid(10);
        const ct = Date.now();
        const filename = `${config.publicPath}/db/notes/${fid}.json`;
        try {
          // type  0 富文本  1 markdown
          const res = WF(filename, { fid, title, author, desc, face, cate, ct, type, val })
          if(res) {
            ctx.body = htr(200, {fid}, '文章发布成功')
          }
        }catch(err) {
          ctx.status = 200
          ctx.body = htr(500, null, '文章写入错误')
        }

        // 2. 将文章索引添加到索引文件中
        const indexFilePath = `${config.publicPath}/db/note_index.json`
        try{
          WF(indexFilePath, { fid, title, author, cate, face, desc, ct, review: 0 }, 1)
        }catch(err) {
          console.log('addNote', err)
        }
      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '内容不完整, 手记发布失败')
      }
    }
  );

  // 修改文章
  router.put(api.mod,
    auth,
    async ctx => {
      let { fid, title, author, cate, top, face, type, desc, val, ct } = ctx.request.body;
      if(fid && title && val) {
        // 1. 更新文件
        const filePath = `${config.publicPath}/db/notes/${fid}.json`
        const ut = Date.now()
        try {
          const res = WF(filePath, { fid, title, author, face, desc, cate, ct, ut, type, val })
          if(res) {
            ctx.body = htr(200, { fid }, '手记修改成功')
          }
        }catch(err) {
          ctx.status = 200
          ctx.body = htr(500, null, '服务器错误, 手记修改失败')
        }
        
        // 2. 修改文章索引
        const indexFilePath = `${config.publicPath}/db/note_index.json`
        
        try {
          let articles = RF(indexFilePath)
          articles = articles.map(item => {
            if(item.fid === fid) {
              return {
                fid, title, author, top, cate, face, desc, ct, ut, review: 0
              }
            }
            return item
          })

          WF(indexFilePath, articles)
        }catch(err) {
          console.log('mod note', err)
        }
      }else {
        ctx.code = 500
        ctx.body = htr(500, null, '内容不完整, 手记发布失败')
      }
    }
  );

  // 查看文章
  router.get(api.get,
    ctx => {
      let { id } = ctx.query;
      if(id) {
        const articlePath = `${config.publicPath}/db/notes/${id}.json`
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

  // 删除文章
  router.delete(api.del,
    auth,
    async ctx => {
      const { id } = ctx.query
      if(id) {
        const articlePath = `${config.publicPath}/db/notes/${id}.json`
        const articleIdxPath = `${config.publicPath}/db/note_index.json`
        // 1.删除文章
        if(fs.existsSync(articlePath)) {
          const err = await delFile(articlePath)
          if(!err) {
            ctx.body = htr(200, null, '删除成功')
  
            // 2.删除文章索引
            let articles = RF(articleIdxPath);
            articles = articles.filter(item => item.fid !== id);
            const res = WF(articleIdxPath, articles);
            if(res) {
              ctx.set('x-show-msg', 'zxzk_msg_200')
              ctx.body = htr(200, { id }, '手记删除成功')
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

  // 获取文章列表(后台)
  router.get(api.all,
    auth,
    (ctx) => {
      const { q, p, s } = ctx.query
      const { n, role } = useVip(ctx)
      const articleIdxPath = `${config.publicPath}/db/note_index.json`
      let articleIdxs = RF(articleIdxPath)
      articleIdxs = role === '0' ? articleIdxs : articleIdxs.filter(v => v.author === n)
      if(!p || !s) {
        ctx.body = htr(200, q ? articleIdxs.filter(v => (v.title + v.desc).indexOf(q) > -1) : articleIdxs.reverse())
      }else {
        ctx.body = htr(200, articleIdxs.reverse().slice(0, p * s))
      }
    }
  );

  // 获取文章列表(前台)
  router.get(api.allPublic,
    ctx => {
      const { q, p, s } = ctx.query
      const articleIdxPath = `${config.publicPath}/db/note_index.json`
      const articleIdxs = RF(articleIdxPath)
      if(!p || !s) {
        ctx.body = htr(200, q ? articleIdxs.filter(v => v.review === 1).filter(v => (v.title + v.desc).indexOf(q) > -1) : articleIdxs.filter(v => v.review === 1))
      }else {
        ctx.body = htr(200, articleIdxs.filter(v => v.review === 1).slice((p-1) * s, p * s))
      }
    }
  );

  // 置顶文章
  router.post(api.topArticle,
    auth,
    superEntry,
    ctx => {
      const { id } = ctx.query
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/note_index.json`
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

  // 取消置顶文章
  router.post(api.cancelTopArticle,
    auth,
    superEntry,
    ctx => {
      const { id } = ctx.query
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/note_index.json`
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

  // 审核文章
  router.post(api.review,
    auth,
    superEntry,
    ctx => {
      const { id, flag } = ctx.request.body;
      if(id) {
        const articleIdxPath = `${config.publicPath}/db/note_index.json`
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

  // 获取手记总数
  router.get(api.getArticleNum,
    ctx => {
      const articleIdxPath = `${config.publicPath}/db/note_index.json`
      const articleIdxs = RF(articleIdxPath)
      ctx.body = htr(200, {num: articleIdxs.length})
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

  // 获取手记访问量, 点赞数据
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
}

export default NoteRouter