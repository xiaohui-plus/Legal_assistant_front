// 全局配置文件 - 所有配置集中管理
// 修改服务器地址只需修改下面这一行

// API服务器配置
var API_CONFIG = {
  // 服务器地址 - 修改这里即可改变所有API调用的目标服务器
  BASE_URL: 'http://154.89.153.127:8001',
  
  // 本地开发地址（开发时取消注释，注释上面的服务器地址）
  // BASE_URL: 'http://localhost:8001',
  
  TIMEOUT: 30000, // 请求超时时间（毫秒）
};

// 导出到window对象，供所有脚本使用
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.API_BASE_URL = API_CONFIG.BASE_URL;
  window.API_TIMEOUT = API_CONFIG.TIMEOUT;
}

// 同时支持ES模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    API_BASE_URL: API_CONFIG.BASE_URL,
    API_TIMEOUT: API_CONFIG.TIMEOUT
  };
}

// 支持ES模块导入
if (typeof exports !== 'undefined') {
  exports.API_CONFIG = API_CONFIG;
  exports.API_BASE_URL = API_CONFIG.BASE_URL;
  exports.API_TIMEOUT = API_CONFIG.TIMEOUT;
}