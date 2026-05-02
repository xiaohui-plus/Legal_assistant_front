// 全局配置文件 - 所有配置集中管理
// 修改服务器地址只需修改下面这一行

// API服务器配置
var API_CONFIG = {
  // ==================== 切换环境说明 ====================
  // 本地开发：取消注释下面一行，注释生产环境地址
  // 生产部署：使用相对路径，由 Nginx 代理到后端
  // GitHub Pages：使用后端服务器的绝对地址
  
  // 本地开发地址（开发时使用）
  // BASE_URL: 'http://localhost:8001',
  
  // 生产环境：使用后端服务器的绝对地址
  BASE_URL: 'https://api.xiaodeng.top',
  
  // GitHub Pages 部署地址（取消注释并替换为你的服务器地址）
  // BASE_URL: 'https://api.xiaodeng.top',
  
  TIMEOUT: 30000, // 请求超时时间（毫秒）
};

// 导出到window对象，供所有脚本使用
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  
  // 统一使用配置的 BASE_URL（已设置为 https://api.xiaodeng.top）
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
