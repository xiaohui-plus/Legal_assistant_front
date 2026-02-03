/**
 * 网络请求封装
 * 验证需求 11, 12
 */

import type { RequestConfig, UploadConfig, UploadResult, ApiResponse } from '@/types/api'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RequestConfig = {
    timeout: 30000, // 30秒超时
    retry: 2, // 默认重试2次
    headers: {
        'Content-Type': 'application/json'
    }
}

/**
 * 基础URL配置
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'

/**
 * HttpClient - 统一的网络请求客户端
 * 
 * 功能：
 * - 封装 uni.request 提供统一的网络请求方法
 * - 自动添加通用请求头和认证信息
 * - 支持请求超时配置
 * - 支持请求重试机制
 * - 支持流式请求（用于大模型响应）
 * - 支持文件上传
 * - 统一的错误处理和响应格式化
 */
export class HttpClient {
    private activeRequests: Map<string, UniApp.RequestTask> = new Map()
    private requestIdCounter = 0

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${++this.requestIdCounter}`
    }

    /**
     * 获取认证token
     */
    private getAuthToken(): string | null {
        try {
            return uni.getStorageSync('auth_token') || null
        } catch (e) {
            console.error('Failed to get auth token:', e)
            return null
        }
    }

    /**
     * 合并请求头
     */
    private mergeHeaders(customHeaders?: Record<string, string>): Record<string, string> {
        const headers: Record<string, string> = {
            ...DEFAULT_CONFIG.headers,
            ...customHeaders
        }

        // 添加认证信息
        const token = this.getAuthToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    /**
     * 构建完整URL
     */
    private buildUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        return `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`
    }

    /**
     * 标准化响应
     */
    private normalizeResponse<T>(response: any): ApiResponse<T> {
        // 如果响应数据已经是标准格式（包含code和message）
        if (response.data && response.data.code !== undefined && response.data.message !== undefined) {
            return response.data as ApiResponse<T>
        }

        // 如果响应本身是标准格式
        if (response.code !== undefined && response.message !== undefined) {
            return response as ApiResponse<T>
        }

        // 否则包装成标准格式
        return {
            code: response.statusCode || 200,
            message: response.errMsg || 'success',
            data: response.data as T
        }
    }

    /**
     * 标准化错误
     */
    private normalizeError(error: any): ApiResponse<null> {
        return {
            code: error.statusCode || error.code || -1,
            message: error.errMsg || error.message || 'Network request failed',
            data: null
        }
    }

    /**
     * 执行请求（带重试机制）
     */
    private async executeRequest<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: string,
        data?: any,
        config?: RequestConfig,
        retryCount = 0
    ): Promise<ApiResponse<T>> {
        const requestId = this.generateRequestId()
        const fullUrl = this.buildUrl(url)
        const headers = this.mergeHeaders(config?.headers)
        const timeout = config?.timeout || DEFAULT_CONFIG.timeout
        const maxRetry = config?.retry !== undefined ? config.retry : DEFAULT_CONFIG.retry!

        return new Promise((resolve, reject) => {
            const requestTask = uni.request({
                url: fullUrl,
                method,
                data,
                header: headers,
                timeout,
                success: (res) => {
                    this.activeRequests.delete(requestId)

                    // 检查HTTP状态码
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const normalizedResponse = this.normalizeResponse<T>(res)
                        resolve(normalizedResponse)
                    } else {
                        // HTTP错误状态码
                        const errorResponse = this.normalizeError({
                            statusCode: res.statusCode,
                            errMsg: `HTTP ${res.statusCode}: ${res.data || 'Request failed'}`
                        })

                        // 如果还有重试次数，则重试
                        if (retryCount < maxRetry) {
                            console.log(`Retrying request (${retryCount + 1}/${maxRetry}):`, fullUrl)
                            this.executeRequest<T>(method, url, data, config, retryCount + 1)
                                .then(resolve)
                                .catch(reject)
                        } else {
                            reject(errorResponse)
                        }
                    }
                },
                fail: (err) => {
                    this.activeRequests.delete(requestId)
                    const errorResponse = this.normalizeError(err)

                    // 如果还有重试次数，则重试
                    if (retryCount < maxRetry) {
                        console.log(`Retrying request (${retryCount + 1}/${maxRetry}):`, fullUrl)
                        this.executeRequest<T>(method, url, data, config, retryCount + 1)
                            .then(resolve)
                            .catch(reject)
                    } else {
                        reject(errorResponse)
                    }
                }
            })

            // 保存请求任务，以便可以取消
            this.activeRequests.set(requestId, requestTask)
        })
    }

    /**
     * GET 请求
     */
    async get<T = any>(
        url: string,
        params?: Record<string, any>,
        config?: RequestConfig
    ): Promise<T> {
        // 将params转换为查询字符串
        let fullUrl = url
        if (params && Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&')
            fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`
        }

        const response = await this.executeRequest<T>('GET', fullUrl, undefined, config)

        // 检查业务状态码
        if (response.code !== 0 && response.code !== 200) {
            throw response
        }

        return response.data
    }

    /**
     * POST 请求
     */
    async post<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        const response = await this.executeRequest<T>('POST', url, data, config)

        // 检查业务状态码
        if (response.code !== 0 && response.code !== 200) {
            throw response
        }

        return response.data
    }

    /**
     * PUT 请求
     */
    async put<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        const response = await this.executeRequest<T>('PUT', url, data, config)

        // 检查业务状态码
        if (response.code !== 0 && response.code !== 200) {
            throw response
        }

        return response.data
    }

    /**
     * DELETE 请求
     */
    async delete<T = any>(
        url: string,
        config?: RequestConfig
    ): Promise<T> {
        const response = await this.executeRequest<T>('DELETE', url, undefined, config)

        // 检查业务状态码
        if (response.code !== 0 && response.code !== 200) {
            throw response
        }

        return response.data
    }

    /**
     * 流式请求（用于大模型响应）
     * 
     * 增强功能：
     * - 支持多种流式响应格式（SSE、分块数组、完整内容）
     * - 支持请求取消
     * - 支持错误回调
     * - 支持完成回调
     * - 支持平台特定的真实流式传输（onChunkReceived）
     * - 更好的错误处理和部分内容保存
     * 
     * 注意：uni.request 不直接支持流式响应，这里使用轮询或SSE模拟
     * 实际项目中可能需要使用 WebSocket 或其他方式实现真正的流式传输
     */
    async stream(
        url: string,
        data: any,
        onChunk: (chunk: string) => void,
        config?: RequestConfig & {
            onError?: (error: ApiResponse<null>) => void
            onComplete?: () => void
            requestId?: string
        }
    ): Promise<void> {
        const requestId = config?.requestId || this.generateRequestId()
        const fullUrl = this.buildUrl(url)
        const headers = this.mergeHeaders(config?.headers)
        const timeout = config?.timeout || 60000 // 流式请求默认60秒超时

        let receivedContent = '' // 保存已接收的内容，用于错误恢复

        return new Promise((resolve, reject) => {
            const requestTask = uni.request({
                url: fullUrl,
                method: 'POST',
                data,
                header: headers,
                timeout,
                enableChunked: true, // 启用分块传输（如果平台支持）
                success: (res) => {
                    // 清理请求记录
                    this.activeRequests.delete(requestId)

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            // 处理响应数据
                            const responseData = res.data as any

                            // 如果是SSE格式
                            if (typeof responseData === 'string') {
                                const lines = responseData.split('\n')
                                for (const line of lines) {
                                    if (line.startsWith('data: ')) {
                                        const chunk = line.substring(6).trim()
                                        if (chunk && chunk !== '[DONE]') {
                                            try {
                                                const parsed = JSON.parse(chunk)
                                                if (parsed.chunk) {
                                                    onChunk(parsed.chunk)
                                                    receivedContent += parsed.chunk
                                                } else if (parsed.content) {
                                                    onChunk(parsed.content)
                                                    receivedContent += parsed.content
                                                }
                                            } catch (e) {
                                                // 如果不是JSON，直接传递
                                                onChunk(chunk)
                                                receivedContent += chunk
                                            }
                                        }
                                    }
                                }
                            } else if (responseData.chunks && Array.isArray(responseData.chunks)) {
                                // 如果是分块数组格式
                                for (const chunk of responseData.chunks) {
                                    onChunk(chunk)
                                    receivedContent += chunk
                                }
                            } else if (responseData.content) {
                                // 如果是完整内容，一次性返回
                                onChunk(responseData.content)
                                receivedContent += responseData.content
                            }

                            // 调用完成回调
                            if (config?.onComplete) {
                                config.onComplete()
                            }

                            resolve()
                        } catch (error) {
                            // 处理过程中出错，但保存已接收的内容
                            const errorResponse = this.normalizeError({
                                statusCode: res.statusCode,
                                errMsg: `Stream processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                partialContent: receivedContent
                            })

                            if (config?.onError) {
                                config.onError(errorResponse)
                            }

                            reject(errorResponse)
                        }
                    } else {
                        const errorResponse = this.normalizeError({
                            statusCode: res.statusCode,
                            errMsg: `HTTP ${res.statusCode}: ${res.data || 'Stream request failed'}`,
                            partialContent: receivedContent
                        })

                        if (config?.onError) {
                            config.onError(errorResponse)
                        }

                        reject(errorResponse)
                    }
                },
                fail: (err) => {
                    // 清理请求记录
                    this.activeRequests.delete(requestId)

                    const errorResponse = this.normalizeError({
                        ...err,
                        partialContent: receivedContent
                    })

                    if (config?.onError) {
                        config.onError(errorResponse)
                    }

                    reject(errorResponse)
                }
            })

            // 保存请求任务，以便可以取消
            this.activeRequests.set(requestId, requestTask)

            // 注意：某些平台可能支持 onChunkReceived 回调（真实流式传输）
            // @ts-ignore
            if (requestTask.onChunkReceived) {
                // @ts-ignore
                requestTask.onChunkReceived((res) => {
                    try {
                        const chunk = res.data
                        let text = ''

                        if (typeof chunk === 'string') {
                            text = chunk
                        } else if (chunk instanceof ArrayBuffer) {
                            // 将 ArrayBuffer 转换为字符串
                            const decoder = new TextDecoder('utf-8')
                            text = decoder.decode(chunk)
                        }

                        if (text) {
                            // 处理SSE格式的实时数据
                            const lines = text.split('\n')
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const dataChunk = line.substring(6).trim()
                                    if (dataChunk && dataChunk !== '[DONE]') {
                                        try {
                                            const parsed = JSON.parse(dataChunk)
                                            if (parsed.chunk) {
                                                onChunk(parsed.chunk)
                                                receivedContent += parsed.chunk
                                            } else if (parsed.content) {
                                                onChunk(parsed.content)
                                                receivedContent += parsed.content
                                            }
                                        } catch (e) {
                                            // 如果不是JSON，直接传递
                                            onChunk(dataChunk)
                                            receivedContent += dataChunk
                                        }
                                    }
                                } else if (line.trim()) {
                                    // 非SSE格式的数据，直接传递
                                    onChunk(line)
                                    receivedContent += line
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error processing chunk:', error)
                        // 继续处理，不中断流
                    }
                })
            }
        })
    }

    /**
     * 取消流式请求
     * 
     * @param requestId 请求ID
     * @returns 是否成功取消
     */
    cancelStream(requestId: string): boolean {
        const requestTask = this.activeRequests.get(requestId)
        if (requestTask) {
            requestTask.abort()
            this.activeRequests.delete(requestId)
            return true
        }
        return false
    }

    /**
     * 上传文件
     */
    async upload(
        url: string,
        filePath: string,
        config?: UploadConfig
    ): Promise<UploadResult> {
        const fullUrl = this.buildUrl(url)
        const headers = this.mergeHeaders(config?.headers)
        const timeout = config?.timeout || 60000 // 上传默认60秒超时
        const name = config?.name || 'file'

        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: fullUrl,
                filePath,
                name,
                header: headers,
                timeout,
                formData: config?.formData,
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const data = JSON.parse(res.data)
                            const normalizedResponse = this.normalizeResponse<UploadResult>(data)

                            if (normalizedResponse.code === 0 || normalizedResponse.code === 200) {
                                resolve(normalizedResponse.data)
                            } else {
                                reject(normalizedResponse)
                            }
                        } catch (e) {
                            reject(this.normalizeError({
                                statusCode: res.statusCode,
                                errMsg: 'Failed to parse upload response'
                            }))
                        }
                    } else {
                        reject(this.normalizeError({
                            statusCode: res.statusCode,
                            errMsg: `HTTP ${res.statusCode}: Upload failed`
                        }))
                    }
                },
                fail: (err) => {
                    reject(this.normalizeError(err))
                }
            })
        })
    }

    /**
     * 取消请求
     */
    cancel(requestId: string): void {
        const requestTask = this.activeRequests.get(requestId)
        if (requestTask) {
            requestTask.abort()
            this.activeRequests.delete(requestId)
        }
    }

    /**
     * 取消所有请求
     */
    cancelAll(): void {
        this.activeRequests.forEach((task) => {
            task.abort()
        })
        this.activeRequests.clear()
    }
}

export default new HttpClient()
