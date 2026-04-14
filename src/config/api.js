const API_BASE_URL = window.API_BASE_URL;
const API_TIMEOUT = window.API_TIMEOUT;

const environment = window.environment || process.env.NODE_ENV || 'development';
const DEV_MODE = window.DEV_MODE || false;

const API_ENDPOINTS = window.API_ENDPOINTS || {
  evidence: {
    upload: '/api/v1/evidence/upload',
    list: '/api/v1/evidence/list',
    preview: '/api/v1/evidence/preview',
    delete: '/api/v1/evidence',
    analyze: '/api/v1/evidence/analyze',
    aiAnalysis: '/api/v1/evidence/ai-analysis',
    updateTime: '/api/v1/evidence/update-time'
  },
  case: {
    list: '/api/v1/evidence/cases'
  },
  evidenceChain: {
    build: '/api/v1/evidence/chain/build',
    timeline: '/api/v1/evidence/chain/timeline',
    graph: '/api/v1/evidence/chain/graph',
    evaluate: '/api/v1/evidence/chain/evaluate'
  },
  evidenceValidity: {
    assess: '/api/v1/evidence/validity/assess',
    assessBatch: '/api/v1/evidence/validity/assess-batch'
  },
  winProbability: {
    assess: '/api/v1/evidence/win-probability/assess',
    radar: '/api/v1/evidence/win-probability/radar'
  },
  ai: {
    asr: '/api/ai/asr',
    analyzeEvidenceImage: '/api/ai/analyze-evidence-image',
    extractTextFromImage: '/api/ai/extract-text-from-image',
    evaluateEffectiveness: '/api/ai/evaluate-effectiveness'
  },
  qa: {
    ask: '/api/v1/qa/ask',
    search: '/api/v1/qa/search'
  },
  legal: {
    search: '/api/v1/legal/search'
  }
};

export {
  API_BASE_URL,
  DEV_MODE,
  API_TIMEOUT,
  API_ENDPOINTS,
  environment
};