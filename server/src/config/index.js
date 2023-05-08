import { resolve } from "path";
const isDev = process.env.NODE_ENV === "development";

//获取本机ip地址
function getIPAdress() {
  var interfaces = require("os").networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
}

const IP = getIPAdress();
const serverPort = isDev ? 3000 : 80;
const staticPath = isDev
  ? `http://${IP}:${serverPort}`
  : `你的域名地址`;
const publicPath = resolve(__dirname, "../../public");
const appStaticPath = resolve(__dirname, "../../static");
const adminPath = resolve(__dirname, "../../static/user");
const routerPath = resolve(__dirname, "../router");

export default {
  protocol: "http:",
  host: "localhost",
  key: 'xxx',
  adminPath,
  serverPort,
  staticPath,
  appStaticPath,
  publicPath,
  API_VERSION_PATH: "/api/v0",
  routerPath,
  appId: '微信公众号appid',
  appSecret: '微信公众号appSecret',
  ak: '七牛云ak',
  sk: '七牛云sk',
  Bucket: '七牛云bucket',
  Domain: '你的域名'
};
