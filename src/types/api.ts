/**
 * API 相关类型定义
 */

/**
 * 请求配置
 */
export interface RequestConfig {
    timeout?: number
    headers?: Record<string, string>
    retry?: number
}

/**
 * 上传配置
 */
export interface UploadConfig extends RequestConfig {
    name?: string
    formData?: Record<string, any>
}

/**
 * 上传结果
 */
export interface UploadResult {
    url: string
    size: number
    name: string
}

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}
