import { WF, RF } from "../lib/upload";
import config from "../config";
import marked from '../lib/marked'

const formatTime = (timeStemp, flag = "/") => {
  let date = new Date(timeStemp);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  return `${y}${flag}${m}${flag}${d}`;
};
/**
 * 文章路由
 * @param {*} router
 * @param {*} apiPath
 * 待优化：1.将成功响应和失败响应统一封装
 */
const pageRenderRouter = (router) => {
  // api路径
  const api = {
    // 渲染首页
    index: "/",
    // 最佳实践列表
    bestPractice: "/best-practice",
    product: "/product",
    video: "/video",
    note: "/note",
    login: "/login",
    articleDetail: "/best-practice/detail",
    productDetail: "/product/detail",
    videoDetail: "/video/detail",
    noteDetail: "/note/detail",
    about: "/about",
  };

  const nav = [
    {
      id: "0",
      title: "最佳实践",
      link: "/best-practice"
    },
    {
      id: "1",
      title: "行业产品",
      link: "/product"
    },
    // {
    //   id: "2",
    //   title: "活动",
    //   link: "/activity"
    // },
    {
      id: "3",
      title: "视频",
      link: "/video"
    },
    {
      id: "4",
      title: "手记",
      link: "/note"
    },
    {
      id: "5",
      title: "关于",
      link: "/about"
    },
  ]

  const copyright = "版权所有 @lowcode可视化社区"

  // 登录
  router.get(api.login, async (ctx) => {
    await ctx.render("login", {
      url: api.login,
      title: "登录",
      description: "新用户?",
      href: "去注册",
      firstInput: "邮箱",
      twoInput: "密码",
      btnText: "登录",
      logoText: "趣写",
    });
  });

  // 渲染首页
  router.get(api.index, async (ctx) => {
    const filePath = `${config.publicPath}/db/homeConfig.json`;
    const articlesPath = `${config.publicPath}/db/article_index.json`;
    const productsPath = `${config.publicPath}/db/product_index.json`;
    const videosPath = `${config.publicPath}/db/video_index.json`;
    const homeConfig = RF(filePath);
    const articles = RF(articlesPath);
    const products = RF(productsPath);
    const videos = RF(videosPath);
    await ctx.render("index", {
      nav,
      articles: articles.filter(v => v.review === 1).slice(0, 6),
      products: products.filter(v => v.review === 1).slice(0, 6),
      videos: videos.filter(v => v.review === 1).slice(0, 6),
      copyright,
      ...homeConfig
    });

    // 统计访问量
    const viewPath = `${config.publicPath}/db/views.json`;
    const views = RF(viewPath);
    WF(viewPath, {...views, home: views.home + 1});
  });

  // 渲染最佳实践
  router.get(api.bestPractice, async (ctx) => {
    const articlesPath = `${config.publicPath}/db/article_index.json`;
    const articles = RF(articlesPath);
    await ctx.render("articles", {
      nav,
      articles: articles.filter(v => v.review === 1).slice(0, 6),
      copyright
    });

    // 统计访问量
    const viewPath = `${config.publicPath}/db/views.json`;
    const views = RF(viewPath);
    WF(viewPath, {...views, articles: views.articles + 1});
  });

  // 渲染产品列表
  router.get(api.product, async (ctx) => {
    const productsPath = `${config.publicPath}/db/product_index.json`;
    const products = RF(productsPath);
    await ctx.render("products", {
      nav,
      products: products.filter(v => v.review === 1).slice(0, 6),
      copyright
    });

    // 统计访问量
    const viewPath = `${config.publicPath}/db/views.json`;
    const views = RF(viewPath);
    WF(viewPath, {...views, products: views.products + 1});
  });

  // 渲染视频列表
  router.get(api.video, async (ctx) => {
    const videosPath = `${config.publicPath}/db/video_index.json`;
    const videos = RF(videosPath);
    await ctx.render("videos", {
      nav,
      videos: videos.filter(v => v.review === 1).slice(0, 6),
      copyright
    });

    // 统计访问量
    const viewPath = `${config.publicPath}/db/views.json`;
    const views = RF(viewPath);
    WF(viewPath, {...views, videos: views.videos + 1});
  });

  // 渲染手记
  router.get(api.note, async (ctx) => {
    const articlesPath = `${config.publicPath}/db/note_index.json`;
    const articles = RF(articlesPath);
    await ctx.render("notes", {
      nav,
      articles: articles.filter(v => v.review === 1).slice(0, 6),
      copyright
    });

    // 统计访问量
    const viewPath = `${config.publicPath}/db/views.json`;
    const views = RF(viewPath);
    WF(viewPath, {...views, notes: views.notes + 1});
  });

  // 渲染文章详情页
  router.get(api.articleDetail, async (ctx) => {
    const id = ctx.query.fid;
    const articlePath = `${config.publicPath}/db/articles/${id}.json`;
    const commentPath = `${config.publicPath}/db/comments/${id}.json`;
    const article = RF(articlePath) || {};
    const comments = RF(commentPath) || {};
    comments.views = comments.views + 1;
    await ctx.render("article_detail", {
      nav,
      viewTitle: article.title,
      topImg: article.img,
      authorInfo: { name: article.author, date: formatTime(article.ct, "-") },
      cate: article.cate,
      val:  article.type ? marked(article.val) : article.val,
      commentInfoList: comments.comments || [],
      flover: comments.flover,
      views: comments.views || 0,
      copyright,
    });
    WF(commentPath, comments);
  });

  // 渲染产品详情页
  router.get(api.productDetail, async (ctx) => {
    const id = ctx.query.fid;
    const articlePath = `${config.publicPath}/db/products/${id}.json`;
    const commentPath = `${config.publicPath}/db/comments/${id}.json`;
    const article = RF(articlePath) || {};
    const comments = RF(commentPath) || {};
    comments.views = comments.views + 1;
    await ctx.render("article_detail", {
      nav,
      viewTitle: article.title,
      topImg: article.img,
      authorInfo: { name: article.author, date: formatTime(article.ct, "-") },
      cate: article.cate,
      val:  article.val,
      commentInfoList: comments.comments || [],
      flover: comments.flover,
      views: comments.views || 0,
      copyright,
    });
    WF(commentPath, comments);
  });

  // 渲染视频详情页
  router.get(api.videoDetail, async (ctx) => {
    const id = ctx.query.fid;
    const articlePath = `${config.publicPath}/db/videos/${id}.json`;
    const commentPath = `${config.publicPath}/db/comments/${id}.json`;
    const article = RF(articlePath) || {};
    const comments = RF(commentPath) || {};
    comments.views = comments.views + 1;
    await ctx.render("video_detail", {
      nav,
      viewTitle: article.title,
      authorInfo: { name: article.author },
      cate: article.cate,
      val: article.link || article.code,
      commentInfoList: comments.comments || [],
      flover: comments.flover,
      views: comments.views || 0,
      copyright,
    });
    WF(commentPath, comments);
  });

  // 渲染手记详情页
  router.get(api.noteDetail, async (ctx) => {
    const id = ctx.query.fid;
    const articlePath = `${config.publicPath}/db/notes/${id}.json`;
    const commentPath = `${config.publicPath}/db/comments/${id}.json`;
    const article = RF(articlePath) || {};
    const comments = RF(commentPath) || {};
    comments.views = comments.views + 1;
    await ctx.render("note_detail", {
      nav,
      viewTitle: article.title,
      topImg: article.img,
      authorInfo: { name: article.author, date: formatTime(article.ct, "-") },
      cate: article.cate,
      val:  article.type ? marked(article.val) : article.val,
      commentInfoList: comments.comments || [],
      flover: comments.flover,
      views: comments.views || 0,
      copyright,
    });
    WF(commentPath, comments);
  });

  // 渲染关于我们页
  router.get(api.about, async (ctx) => {
    // 头像
    await ctx.render("about", {
      nav,
      introductionInfo: "LowCode低代码社区是由在一线互联网公司深耕技术多年的技术专家创办，意在为企业技术人员提供低代码可视化相关的技术交流和分享，并且鼓励国内拥有相关业务的企业积极推荐自身产品，为国内B端技术领域积累知识资产。同时我们还欢迎开源大牛们分享自己的开源项目和技术视频，如需入驻请加下方小编微信:",
      copyright,
    });
  });
};

export default pageRenderRouter;
