/**
 * 统一API客户�?
 * 自动处理认证、错误、请�?响应拦截
 */

// API配置
const API_CONFIG = {
    BASE_URL: window.API_BASE_URL || 'http://localhost:8001',
    TIMEOUT: 30000,

    // 路由前缀配置（注意：不同模块前缀不同�?
    ENDPOINTS: {
        // �?/api/v1 前缀
        AUTH: '/api/v1/auth',
        DOCUMENT: '/api/v1/document',
        UPLOAD: '/api/v1/upload',
        FEEDBACK: '/api/v1/feedback',
        USER: '/api/v1/user',
        EVIDENCE: '/api/v1/evidence',

        // �?v1 前缀
        QA: '/api/qa',
        LAW_SEARCH: '/api/law-search',
        CHAT: '/api/chat'
    }
};

// Token管理
class TokenManager {
    static getAccessToken() {
        return localStorage.getItem('access_token');
    }

    static getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    static clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    static isLoggedIn() {
        return !!this.getAccessToken();
    }
}

// HTTP客户�?
class HTTPClient {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    // 构建完整URL
    buildURL(endpoint, params = {}) {
        let url = `${this.baseURL}${endpoint}`;

        // 添加查询参数
        const queryString = Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        if (queryString) {
            url += `?${queryString}`;
        }

        return url;
    }

    // 构建请求�?
    buildHeaders(customHeaders = {}, skipAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        // 添加认证�?
        if (!skipAuth && TokenManager.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
        }

        return headers;
    }

    // 处理响应
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        // 处理JSON响应
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            // 检查业务状态码
            if (data.code !== 200 && data.code !== 201) {
                throw new APIError(data.message || '请求失败', data.code, data);
            }

            return data;
        }

        // 处理文件下载
        if (contentType && (contentType.includes('application/octet-stream') ||
            contentType.includes('application/pdf') ||
            contentType.includes('application/msword'))) {
            return response.blob();
        }

        // 处理文本响应
        return response.text();
    }

    // 处理错误
    handleError(error) {
        if (error instanceof APIError) {
            // 401 未授�?- 清除token并跳转登�?
            if (error.code === 401) {
                TokenManager.clearTokens();
                if (window.location.pathname !== '/professional.html') {
                    window.location.href = '/professional.html';
                }
            }
            throw error;
        }

        // 网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new APIError('网络连接失败，请检查网络', 0);
        }

        // 超时错误
        if (error.name === 'AbortError') {
            throw new APIError('请求超时', 0);
        }

        throw new APIError(error.message || '未知错误', 0);
    }

    // GET请求
    async get(endpoint, params = {}, options = {}) {
        try {
            const url = this.buildURL(endpoint, params);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.buildHeaders(options.headers, options.skipAuth),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // POST请求
    async post(endpoint, data = {}, options = {}) {
        try {
            const url = this.buildURL(endpoint);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: this.buildHeaders(options.headers, options.skipAuth),
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // PUT请求
    async put(endpoint, data = {}, options = {}) {
        try {
            const url = this.buildURL(endpoint);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.buildHeaders(options.headers, options.skipAuth),
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // DELETE请求
    async delete(endpoint, options = {}) {
        try {
            const url = this.buildURL(endpoint);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.buildHeaders(options.headers, options.skipAuth),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 文件上传
    async upload(endpoint, formData, options = {}) {
        try {
            const url = this.buildURL(endpoint);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout * 3); // 上传超时时间更长

            // 不设置Content-Type，让浏览器自动设置（包含boundary�?
            const headers = {};
            if (!options.skipAuth && TokenManager.isLoggedIn()) {
                headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    // SSE流式请求
    async stream(endpoint, data = {}, onMessage, onError, onComplete) {
        try {
            const url = this.buildURL(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: this.buildHeaders({}, false),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}`, response.status);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    if (onComplete) onComplete();
                    break;
                }

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            if (onComplete) onComplete();
                            return;
                        }
                        try {
                            const json = JSON.parse(data);
                            if (onMessage) onMessage(json);
                        } catch (e) {
                            console.error('解析SSE数据失败:', e);
                        }
                    }
                }
            }
        } catch (error) {
            if (onError) onError(error);
            return this.handleError(error);
        }
    }
}

// API错误�?
class APIError extends Error {
    constructor(message, code, data = null) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.data = data;
    }
}

// API客户端实�?
const apiClient = new HTTPClient();

// 导出
window.APIClient = apiClient;
window.TokenManager = TokenManager;
window.APIError = APIError;
window.API_CONFIG = API_CONFIG;
