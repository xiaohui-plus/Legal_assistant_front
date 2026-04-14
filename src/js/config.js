// 全局配置文件
// 这个文件应该最先加载

// 环境配置（兼容浏览器环境）
const environment = typeof process !== 'undefined' && process.env?.NODE_ENV || 'development';

// API基础URL - 必须由集中配置文件设置
const API_BASE_URL = window.API_BASE_URL;

// 开发模式配置
const DEV_MODE = window.DEV_MODE || false; // 生产模式：使用真实后端API

// 超时设置 - 优先使用集中配置
const API_TIMEOUT = window.API_TIMEOUT || 30000; // 30秒

// API端点
const API_ENDPOINTS = {
  // 证据相关
  evidence: {
    upload: '/api/v1/evidence/upload',
    list: '/api/v1/evidence/list',
    preview: '/api/v1/evidence/preview',
    delete: '/api/v1/evidence',
    analyze: '/api/v1/evidence/analyze',
    aiAnalysis: '/api/v1/evidence/ai-analysis',
    updateTime: '/api/v1/evidence/update-time'
  },
  // 案件相关
  case: {
    list: '/api/v1/evidence/cases'
  },
  // 证据链相�?
  evidenceChain: {
    build: '/api/v1/evidence/chain/build',
    timeline: '/api/v1/evidence/chain/timeline',
    graph: '/api/v1/evidence/chain/graph',
    evaluate: '/api/v1/evidence/chain/evaluate'
  },
  // 证据效力相关
  evidenceValidity: {
    assess: '/api/v1/evidence/validity/assess',
    assessBatch: '/api/v1/evidence/validity/assess-batch'
  },
  // 胜诉概率相关
  winProbability: {
    assess: '/api/v1/evidence/win-probability/assess',
    radar: '/api/v1/evidence/win-probability/radar'
  },
  // AI相关
  ai: {
    asr: '/api/ai/asr',
    analyzeEvidenceImage: '/api/ai/analyze-evidence-image',
    extractTextFromImage: '/api/ai/extract-text-from-image',
    evaluateEffectiveness: '/api/ai/evaluate-effectiveness'
  }
};

// 导出到全局（用于其他脚本）
// 注意：API_BASE_URL 已经由集中配置文件设置，这里不再覆盖
// window.API_BASE_URL = API_BASE_URL; // 不要覆盖集中配置
window.DEV_MODE = DEV_MODE;
window.API_TIMEOUT = API_TIMEOUT;
window.API_ENDPOINTS = API_ENDPOINTS;
window.environment = environment;
