/**
 * 常量定义
 */

/**
 * 本地存储键常量
 */
export const STORAGE_KEYS = {
    CHAT_SESSIONS: 'chat_sessions',
    CHAT_MESSAGES: 'chat_messages_',
    FAVORITE_TEMPLATES: 'favorite_templates',
    SAVED_DOCUMENTS: 'saved_documents',
    FORM_DRAFTS: 'form_drafts_',
    USER_PROFILE: 'user_profile',
    USER_SETTINGS: 'user_settings',
    AGREED_TERMS: 'agreed_terms'
}

/**
 * API 基础地址
 */
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.legal-assistant.com'
    : 'http://localhost:3000'

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 30000

/**
 * 图片压缩质量
 */
export const IMAGE_QUALITY = 0.8

/**
 * 图片最大尺寸（像素）
 */
export const IMAGE_MAX_SIZE = 1920

/**
 * 虚拟列表阈值
 */
export const VIRTUAL_LIST_THRESHOLD = 100
