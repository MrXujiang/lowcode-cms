/**
 * 生成指定个数的随机字符转串
 * n 随机字符串的个数
 */
function generateRandomStr(n) {
  let str = 'abcdefghigklmnopqrstuvexyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-+%$';
  let res = ''
  let len = str.length;
  for(let i=0; i < n; i++) {
    res += str[Math.floor(Math.random() * len)]
  }
  return res
}

const xib = {
  /**
   * 加密字符串
   */
  xip(str = '') {
    let strArr = str.split('');
    [0, 2, 6, 7].forEach((n,i) => {
      strArr.splice(n + i, 0, generateRandomStr(4))
    });
    return strArr.join('')
  },
  /**
   * 解密字符串
   */
  uxip(str = '') {
    let dotIndexArr = [0, 2, 6, 7].map((n,i) => n + (i * 4));
    let res = '';
    dotIndexArr.forEach((n, i, v) => {
      res += str.slice(n+4, v[i+1])
    })
    
    return res
  }
}

export {
  xib
}