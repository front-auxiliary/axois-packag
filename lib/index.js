/**
 * axios 基于 promise 的 xhr 封装所以 axios 接收 xhr 的参数
 * 并且 axios.interceptors.request.use 拦截器可在请求或者返回被 then 或者 catch 处理之前对它们进行拦截
 */
var axios = require('axios');
var Qs = require('qs');
var Promise = require('promise');
// 获取参数类型
var toType = function (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

var ajax = function (params) {
  
}
ajax.prototype.init = function(params){
  this.APIS = params.APIS;
  var defaults = Object.assign({
    //正式环境和开发测试域名区分 
    baseURL: params.baseURL || '',
    timeout: 10000, //超时
    withCredentials: true,// 跨域请求是否提供凭据信息
    // 该属性为 fetch 的允许跨域属性
    // mode: 'cors'
  }, params.defaults)
  // 配置默认
  axios.defaults = Object.assign(axios.defaults, defaults)

  // http请求拦截器
  axios.interceptors.request.use(function (config) {
    var headers = config.headers;
    // 获取请求类型并转化成小写
    var method = config.method.toLowerCase();
    var contentType = 'application/x-www-form-urlencoded;charset=utf-8';   // 请求返回的参数类型
    if (headers['Content-Type']) {
      contentType = headers['Content-Type'].toLowerCase()
    }
    if (contentType.indexOf('application/x-www-form-urlencoded') != -1) {
      if ('put,post'.indexOf(method) != -1) {
        //post请求参数用&拼接
        config.data = Qs.stringify(config.data);
      }
    }
    return config
  }, error => {
    return Promise.reject(error)
  })
  return this;
}
// 参数过滤函数
function filterNull(o) {

  for (var key in o) {
    if (o[key] === null) {
      delete o[key];
    }
    if (toType(o[key]) === "string") {
      o[key] = o[key].trim();
    } else if (toType(o[key]) === "object") {
      o[key] = filterNull(o[key]);
    } else if (toType(o[key]) === "array") {
      o[key] = filterNull(o[key]);
    }
  }
  return o;
}

// 登录判断
function checkLogin(res, reject) {
  if (res && res.status && res.status >= 400) {
    var resData = res.data || {};
    if (resData.code && resData.code == 'NON_LOGIN') {

      //跳转到登录页面 并记录当前页面地址
      var redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?ROUT=${redirectUrl}`;

    } else {
      reject(res)
    }
  }
  return res;
}


// 错误信息批量处理
function errorFormat(error, reject) {
  if (error.code === 'ECONNABORTED') {
  } else if (error.response) {
    checkLogin(error.response, reject);
    return;
  }
  if (error && error.response && error.response.data) {
    error = error.response;
  }
  reject(error);
}

ajax.prototype.requestformat = function (method, url, params, config) {
  let that = this;
  return new Promise(function (resolve, reject) {
    var allParams = {
      url: that.APIS[url].url,
      method,
      config,
    };
    var headers = {};
    if (!that.APIS[url].url) {
      return;
    }
    // params空参数或者null, undefined 过滤
    params = params ? filterNull(params) : {}
    // 初始化 config
    if (config && config['headers']) {
      headers = config['headers'];
      delete config['headers'];
      allParams.headers = headers;
    }
    if ('get,devare'.indexOf(method) != -1) {
      params.dateTime = new Date().getTime();
      allParams.params = params;
    } else {
      //post请求参数用&拼接
      allParams.data = params;
    }
    axios(allParams).then(function (response) {
      resolve(response);
    }).catch(function (error) {
      errorFormat(error, reject)
    });
  });
}
ajax.prototype.get = function (url, params, config) {
  return this.requestformat('get', url, params, config)
}
ajax.prototype.post = function (url, params, config) {
  return this.requestformat('get', url, params, config)
}
ajax.prototype.put = function (url, params, config) {
  return this.requestformat('get', url, params, config)
}
ajax.prototype.delete = function (url, params, config) {
  return this.requestformat('get', url, params, config)
}
export default new ajax();