import koa from "koa";
import staticServer from "koa-static";
import fs from "fs";
import koaBody from "koa-body";
import glob from "glob";
import config from "./config";
import cors from "koa2-cors";
import Router from "@koa/router";
import compress from "koa-compress";
import views from "koa-views";
import logger from "koa-logger";
import { resolve } from "path";
// import schedule from "node-schedule";
import wx_api from 'wechat-api';
// import { WF, RF } from "./lib/upload";

const api = new wx_api(config.appId, config.appSecret)
const router = new Router();
// 启动逻辑
async function start() {
  const app = new koa();

  app.use(logger());
  // 开启gzip
  const options = { threshold: 2048 };
  app.use(compress(options));
  //  禁止访问
  app.use(async (ctx,next) => {
    if(/^\/db\/user/g.test(ctx.path)) {
        ctx.status = 500
        ctx.redirect('/')
        return
    }
    await next()
})
  // 设置静态目录
  app.use(staticServer(config.publicPath, { maxage: 60 * 60 * 1000 }));
  app.use(staticServer(config.appStaticPath, { maxage: 60 * 60 * 1000 }));
  // 设置跨域
  app.use(
    cors({
      origin: function (ctx) {
        const whiteList = [
          "http://192.168.0.119:8000",  // 你的服务器跨域白名单
        ]; //可跨域白名单
        if (
          whiteList.includes(ctx.request.header.origin) &&
          ctx.url.indexOf(config.API_VERSION_PATH) > -1
        ) {
          return ctx.request.header.origin; //注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了，允许来自指定域名请求, 如果设置为*，前端将获取不到错误的响应头
        }
        return "";
      },
      exposeHeaders: ["WWW-Authenticate", "Server-Authorization", "x-show-msg"],
      maxAge: 5, //  该字段可选，用来指定本次预检请求的有效期，单位为秒
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
      ],
    })
  );

  app.use(koaBody());

  // 渲染页面
  app.use(async (ctx, next) => {
    if (/^\/user/g.test(ctx.path)) {
      ctx.type = "html";
      ctx.body = fs.createReadStream(config.adminPath);
      return;
    }else if(ctx.url.indexOf('/api/v0/wechat/getConfig') === 0) {
      // 使用wechat-api获取JSconfig
      let param = {
          debug: false,
          jsApiList: [
          'checkJsApi',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'translateVoice',
          'startRecord',
          'stopRecord',
          'onVoiceRecordEnd',
          'playVoice',
          'onVoicePlayEnd',
          'pauseVoice',
          'stopVoice',
          'uploadVoice',
          'downloadVoice',
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'getNetworkType',
          'openLocation',
          'getLocation',
          'hideOptionMenu',
          'showOptionMenu',
          'closeWindow',
          'scanQRCode',
          'chooseWXPay',
          'openProductSpecificView',
          'addCard',
          'chooseCard',
          'openCard',
          'updateAppMessageShareData',
          'updateTimelineShareData'],
          url: ctx.request.body.url
      }
      //生成config的参数
      function getJsConfig(param) {
          return new Promise(resolve => {
              api.getJsConfig(param, function (err, data) {
                  console.log(err, data)
                  resolve(data)
              })
          })
      }
      const data = await getJsConfig(param);
      ctx.body = { 'success': 'true', result: data }
  }
    await next();
  });

  // 挂载路由
  glob.sync(`${config.routerPath}/*.js`).forEach((item) => {
    require(item).default(router, config.API_VERSION_PATH);
  });

  //使用模版引擎
  app.use(views(resolve(__dirname, "./views"), { extension: "pug" }));

  app.use(router.routes()).use(router.allowedMethods());

  // 定时任务
  // const anazlyDaily = schedule.scheduleJob("59 59 23 * * *", function () {
  //   const weekLog = `${config.publicPath}/db/weekLog.json`;
  //   const date = new Date();
  //   const year = date.getFullYear();
  //   const month = date.getMonth();
  //   const dayH = date.getDate();
  //   const weekTpl = {
  //     2020: {
  //       flovers: {
  //         0: [], // 数组中每个值代表指定日期的访问数据, 其他的类似
  //       },
  //       comments: {},
  //       views: {},
  //     },
  //   };
  //   const weekData = RF(weekLog) || weekTpl;

  //   const result = {
  //     flovers: 0,
  //     comments: 0,
  //     views: 0,
  //   };
  //   glob.sync(`${config.publicPath}/db/comments/*.json`).forEach((item) => {
  //     const row = RF(item);
  //     result.flovers += row.flover;
  //     result.comments += row.comments.length || row.comments.length;
  //     result.views += row.views;
  //   });

  //   // 设置年份
  //   weekData[year] = weekData[year] || {};

  //   // 设置基础数据
  //   weekData[year]["flovers"] = weekData[year]["flovers"] || {};
  //   weekData[year]["comments"] = weekData[year]["comments"] || {};
  //   weekData[year]["views"] = weekData[year]["views"] || {};

  //   //  点赞统计
  //   weekData[year]["flovers"][month] = weekData[year]["flovers"][month] || [];
  //   weekData[year]["flovers"][month][dayH] = result.flovers;

  //   //  评论统计
  //   weekData[year]["comments"][month] = weekData[year]["comments"][month] || [];
  //   weekData[year]["comments"][month][dayH] = result.comments;

  //   // 访问量统计
  //   weekData[year]["views"][month] = weekData[year]["views"][month] || [];
  //   weekData[year]["views"][month][dayH] = result.views;

  //   WF(weekLog, weekData);
  // });

  app.listen(config.serverPort, () => {
    console.log(`服务器地址:${config.staticPath}`);
  });
}

start();
