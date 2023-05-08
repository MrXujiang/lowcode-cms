import { parse } from 'qs';

export const isDev = process.env.NODE_ENV === 'development';

export const SERVER_URL = isDev ? 'http://192.168.0.119:3000' : (window.location.protocol + '//' + window.location.host);

export function unParams(params = '?a=1&b=2&c=3') {
  if(params.indexOf('?') > -1) {
    params = params.slice(1);
  }
  return parse(params)
}

export function throttle(fn: Function, delay: number) {
  let flag = true;
  return (...args: any) => {
    if (flag) {
      flag = false;
      fn(...args);
      setTimeout(() => {
        flag = true;
      }, delay);
    }
  };
}

export function debounce(func: Function, wait: number) {
  let timeout:any;
  return function () {
      let context = this;
      let args = arguments;

      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
          func.apply(context, args)
      }, wait);
  }
}

export function formatTime(fmt:string, dateObj:any) {
  const date = dateObj || new Date();
  const o:any = { 
    "M+" : date.getMonth()+1,                 //月份 
    "d+" : date.getDate(),                    //日 
    "h+" : date.getHours(),                   //小时 
    "m+" : date.getMinutes(),                 //分 
    "s+" : date.getSeconds(),                 //秒 
    "q+" : Math.floor((date.getMonth()+3)/3), //季度 
    "S"  : date.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  }
  for(var k in o) {
      if(new RegExp("("+ k +")").test(fmt)){
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      }
  }
  return fmt; 
}

/**
  * 对象转url参数
  * @param {*} data
  * @param {*} isPrefix
  */

 export const urlencode = (data:any, isPrefix?:boolean) => {

  let prefix = isPrefix ? '?' : ''

  let _result = []
  for (let key in data) {
    let value = data[key]
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue
    }
    if (value.constructor === Array) {
      value.forEach(_value => {
        _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value))
      })
    } else {
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }
  }

  return _result.length ? prefix + _result.join('&') : ''
}

export function IsPC() {  
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
  var flag = true;  
  for (var v = 0; v < Agents.length; v++) {  
      if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
  }  
  return flag;  
}

export const _gaw = (w:number) => {
  const vw = IsPC() ? 375 : window.innerWidth
  return vw / 375 * w
}

export const getImageUrl: (info: any) => string = info => {
  const imageUrl = info?.file?.response?.result?.url || ''
  return imageUrl
}

export const getFormdata: (info: any) => void = info => {
  const formdata = new FormData()
  formdata.append('file', info)
  return formdata
}