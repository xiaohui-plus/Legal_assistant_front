// 全局配置文件 - 所有配置集中管理
// 修改服务器地址只需修改下面这一行

// API服务器配置
var API_CONFIG = {
  // ==================== 切换环境说明 ====================
  // 本地开发：取消注释下面一行，注释生产环境地址
  // 生产部署：取消注释下面的生产环境地址，注释本地地址
  
  // 本地开发地址（开发时使用）
  // BASE_URL: 'http://localhost:8001',
  
  // 生产环境地址（部署到GitHub Pages时使用）
  // 使用frp配置的域名，通过HTTPS访问
  BASE_URL: 'https://api.xiaodeng.top',
  
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