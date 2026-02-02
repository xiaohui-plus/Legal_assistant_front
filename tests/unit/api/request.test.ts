/**
 * HttpClient 单元测试
 * 验证需求 11, 12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient } from '@/api/request'
import type { ApiResponse } from '@/types/api'

// Mock uni API
const mockUniRequest = vi.fn()
const mockUniUploadFile = vi.fn()
const mockGetStorageSync = vi.fn()

global.uni = {
    request: mockUniRequest,
    uploadFile: mockUniUploadFile,
    getStorageSync: mockGetStorageSync,
} as any

describe('HttpClient', () => {
    let httpClient: HttpClient

    beforeEach(() => {
        httpClient = new HttpClient()
        vi.clearAllMocks()
        mockGetStorageSync.mockReturnValue(null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('GET 请求', () => {
        it('应该成功发送GET请求并返回数据', async () => {
            const mockData = { id: 1, name: 'test' }
            const mockResponse = {
                statusCode: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: mockData
                }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            const result = await httpClient.get('/api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'GET',
                    url: expect.stringContaining('/api/test')
                })
            )
            expect(result).toEqual(mockData)
        })

        it('应该将params转换为查询字符串', async () => {
            const mockResponse = {
                statusCode: 200,
                data: { code: 0, message: 'success', data: {} }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test', { page: 1, size: 10 })

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('page=1&size=10')
                })
            )
        })

        it('应该在请求失败时抛出错误', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.fail({ errMsg: 'Network error' })
                return { abort: vi.fn() }
            })

            await expect(httpClient.get('/api/test')).rejects.toMatchObject({
                code: -1,
                message: expect.stringContaining('Network')
            })
        })
    })

    describe('POST 请求', () => {
        it('应该成功发送POST请求并返回数据', async () => {
            const mockData = { id: 1 }
            const postData = { name: 'test' }
            const mockResponse = {
                statusCode: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: mockData
                }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            const result = await httpClient.post('/api/test', postData)

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'POST',
                    data: postData
                })
            )
            expect(result).toEqual(mockData)
        })

        it('应该在POST请求失败时抛出错误', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 500,
                    data: 'Internal Server Error'
                })
                return { abort: vi.fn() }
            })

            await expect(
                httpClient.post('/api/test', { data: 'test' }, { retry: 0 })
            ).rejects.toMatchObject({
                code: 500,
                message: expect.stringContaining('500')
            })
        })
    })

    describe('PUT 请求', () => {
        it('应该成功发送PUT请求并返回数据', async () => {
            const mockData = { id: 1, updated: true }
            const putData = { name: 'updated' }
            const mockResponse = {
                statusCode: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: mockData
                }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            const result = await httpClient.put('/api/test/1', putData)

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'PUT',
                    data: putData
                })
            )
            expect(result).toEqual(mockData)
        })
    })

    describe('DELETE 请求', () => {
        it('应该成功发送DELETE请求', async () => {
            const mockResponse = {
                statusCode: 200,
                data: {
                    code: 0,
                    message: 'success',
                    data: { deleted: true }
                }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            const result = await httpClient.delete('/api/test/1')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'DELETE'
                })
            )
            expect(result).toEqual({ deleted: true })
        })
    })

    describe('认证和请求头', () => {
        it('应该自动添加认证token到请求头', async () => {
            const mockToken = 'test-token-123'
            mockGetStorageSync.mockReturnValue(mockToken)

            const mockResponse = {
                statusCode: 200,
                data: { code: 0, message: 'success', data: {} }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    header: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            )
        })

        it('应该合并自定义请求头', async () => {
            const mockResponse = {
                statusCode: 200,
                data: { code: 0, message: 'success', data: {} }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test', undefined, {
                headers: { 'X-Custom-Header': 'custom-value' }
            })

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    header: expect.objectContaining({
                        'X-Custom-Header': 'custom-value',
                        'Content-Type': 'application/json'
                    })
                })
            )
        })
    })

    describe('超时配置', () => {
        it('应该使用默认超时时间', async () => {
            const mockResponse = {
                statusCode: 200,
                data: { code: 0, message: 'success', data: {} }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 30000
                })
            )
        })

        it('应该使用自定义超时时间', async () => {
            const mockResponse = {
                statusCode: 200,
                data: { code: 0, message: 'success', data: {} }
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success(mockResponse)
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test', undefined, { timeout: 5000 })

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 5000
                })
            )
        })
    })

    describe('重试机制', () => {
        it('应该在失败时重试请求', async () => {
            let callCount = 0
            mockUniRequest.mockImplementation((options: any) => {
                callCount++
                if (callCount < 2) {
                    options.fail({ errMsg: 'Network error' })
                } else {
                    options.success({
                        statusCode: 200,
                        data: { code: 0, message: 'success', data: {} }
                    })
                }
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test', undefined, { retry: 2 })

            expect(mockUniRequest).toHaveBeenCalledTimes(2)
        })

        it('应该在达到最大重试次数后抛出错误', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.fail({ errMsg: 'Network error' })
                return { abort: vi.fn() }
            })

            await expect(
                httpClient.get('/api/test', undefined, { retry: 1 })
            ).rejects.toMatchObject({
                message: expect.stringContaining('Network')
            })

            expect(mockUniRequest).toHaveBeenCalledTimes(2) // 初始请求 + 1次重试
        })

        it('应该支持禁用重试', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.fail({ errMsg: 'Network error' })
                return { abort: vi.fn() }
            })

            await expect(
                httpClient.get('/api/test', undefined, { retry: 0 })
            ).rejects.toMatchObject({
                message: expect.stringContaining('Network')
            })

            expect(mockUniRequest).toHaveBeenCalledTimes(1) // 只有初始请求
        })
    })

    describe('文件上传', () => {
        it('应该成功上传文件', async () => {
            const mockResult = {
                url: 'https://example.com/file.jpg',
                size: 1024,
                name: 'file.jpg'
            }

            mockUniUploadFile.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: JSON.stringify({
                        code: 0,
                        message: 'success',
                        data: mockResult
                    })
                })
            })

            const result = await httpClient.upload('/api/upload', '/path/to/file.jpg')

            expect(mockUniUploadFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining('/api/upload'),
                    filePath: '/path/to/file.jpg',
                    name: 'file'
                })
            )
            expect(result).toEqual(mockResult)
        })

        it('应该支持自定义文件字段名', async () => {
            mockUniUploadFile.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: JSON.stringify({
                        code: 0,
                        message: 'success',
                        data: { url: 'test.jpg', size: 100, name: 'test.jpg' }
                    })
                })
            })

            await httpClient.upload('/api/upload', '/path/to/file.jpg', {
                name: 'image'
            })

            expect(mockUniUploadFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'image'
                })
            )
        })

        it('应该支持额外的表单数据', async () => {
            mockUniUploadFile.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: JSON.stringify({
                        code: 0,
                        message: 'success',
                        data: { url: 'test.jpg', size: 100, name: 'test.jpg' }
                    })
                })
            })

            await httpClient.upload('/api/upload', '/path/to/file.jpg', {
                formData: { userId: '123', category: 'avatar' }
            })

            expect(mockUniUploadFile).toHaveBeenCalledWith(
                expect.objectContaining({
                    formData: { userId: '123', category: 'avatar' }
                })
            )
        })

        it('应该在上传失败时抛出错误', async () => {
            mockUniUploadFile.mockImplementation((options: any) => {
                options.fail({ errMsg: 'Upload failed' })
            })

            await expect(
                httpClient.upload('/api/upload', '/path/to/file.jpg')
            ).rejects.toMatchObject({
                message: expect.stringContaining('Upload failed')
            })
        })

        it('应该处理上传响应解析错误', async () => {
            mockUniUploadFile.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: 'invalid json'
                })
            })

            await expect(
                httpClient.upload('/api/upload', '/path/to/file.jpg')
            ).rejects.toMatchObject({
                message: expect.stringContaining('parse')
            })
        })

        it('应该处理上传业务错误', async () => {
            mockUniUploadFile.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: JSON.stringify({
                        code: 400,
                        message: 'File too large',
                        data: null
                    })
                })
            })

            await expect(
                httpClient.upload('/api/upload', '/path/to/file.jpg')
            ).rejects.toMatchObject({
                code: 400,
                message: 'File too large'
            })
        })
    })

    describe('流式请求', () => {
        it('应该处理SSE格式的流式响应', async () => {
            const chunks: string[] = []
            const sseData = 'data: {"chunk":"Hello"}\ndata: {"chunk":" World"}\ndata: [DONE]\n'

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: sseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks).toEqual(['Hello', ' World'])
        })

        it('应该处理分块数组格式的响应', async () => {
            const chunks: string[] = []
            const responseData = {
                chunks: ['Hello', ' ', 'World']
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: responseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks).toEqual(['Hello', ' ', 'World'])
        })

        it('应该处理完整内容格式的响应', async () => {
            const chunks: string[] = []
            const responseData = {
                content: 'Complete response'
            }

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: responseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks).toEqual(['Complete response'])
        })

        it('应该调用完成回调', async () => {
            const onComplete = vi.fn()
            const responseData = { content: 'Test' }

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: responseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream(
                '/api/stream',
                { message: 'test' },
                () => { },
                { onComplete }
            )

            expect(onComplete).toHaveBeenCalledTimes(1)
        })

        it('应该在错误时调用错误回调', async () => {
            const onError = vi.fn()

            mockUniRequest.mockImplementation((options: any) => {
                options.fail({ errMsg: 'Stream error' })
                return { abort: vi.fn() }
            })

            await expect(
                httpClient.stream(
                    '/api/stream',
                    { message: 'test' },
                    () => { },
                    { onError }
                )
            ).rejects.toBeDefined()

            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Stream error')
                })
            )
        })

        it('应该支持取消流式请求', async () => {
            const abortFn = vi.fn()
            const requestId = 'test-stream-request'

            mockUniRequest.mockImplementation((options: any) => {
                // 不立即调用success，模拟长时间运行的请求
                setTimeout(() => {
                    options.success({
                        statusCode: 200,
                        data: { content: 'Test' }
                    })
                }, 1000)
                return { abort: abortFn }
            })

            // 启动流式请求（不等待完成）
            const streamPromise = httpClient.stream(
                '/api/stream',
                { message: 'test' },
                () => { },
                { requestId }
            )

            // 立即取消请求
            const cancelled = httpClient.cancelStream(requestId)

            expect(cancelled).toBe(true)
            expect(abortFn).toHaveBeenCalled()
        })

        it('应该处理SSE格式中的content字段', async () => {
            const chunks: string[] = []
            const sseData = 'data: {"content":"Full message"}\ndata: [DONE]\n'

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: sseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks).toEqual(['Full message'])
        })

        it('应该处理非JSON的SSE数据', async () => {
            const chunks: string[] = []
            const sseData = 'data: Plain text chunk\ndata: Another chunk\n'

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: sseData
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks).toEqual(['Plain text chunk', 'Another chunk'])
        })

        it('应该在处理错误时保存部分内容', async () => {
            const chunks: string[] = []
            // 模拟部分成功的SSE数据，然后出现格式错误
            const sseData = 'data: {"chunk":"Hello"}\ndata: {"chunk":" World"}\ninvalid line that causes error'

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: sseData
                })
                return { abort: vi.fn() }
            })

            // 即使有错误，也应该接收到部分内容
            await httpClient.stream('/api/stream', { message: 'test' }, (chunk) => {
                chunks.push(chunk)
            })

            expect(chunks.length).toBeGreaterThan(0)
        })

        it('应该使用自定义超时时间', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { content: 'Test' }
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream(
                '/api/stream',
                { message: 'test' },
                () => { },
                { timeout: 90000 }
            )

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 90000
                })
            )
        })

        it('应该启用分块传输', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { content: 'Test' }
                })
                return { abort: vi.fn() }
            })

            await httpClient.stream('/api/stream', { message: 'test' }, () => { })

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    enableChunked: true
                })
            )
        })
    })

    describe('响应标准化', () => {
        it('应该标准化成功响应', async () => {
            const mockData = { result: 'success' }
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: {
                        code: 200,
                        message: 'OK',
                        data: mockData
                    }
                })
                return { abort: vi.fn() }
            })

            const result = await httpClient.get('/api/test')
            expect(result).toEqual(mockData)
        })

        it('应该在业务错误时抛出标准化错误', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: {
                        code: 400,
                        message: 'Business error',
                        data: null
                    }
                })
                return { abort: vi.fn() }
            })

            await expect(httpClient.get('/api/test')).rejects.toMatchObject({
                code: 400,
                message: 'Business error'
            })
        })

        it('应该处理HTTP错误状态码', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 404,
                    data: 'Not Found'
                })
                return { abort: vi.fn() }
            })

            await expect(httpClient.get('/api/test', undefined, { retry: 0 }))
                .rejects.toMatchObject({
                    code: 404,
                    message: expect.stringContaining('404')
                })
        })
    })

    describe('边缘情况', () => {
        it('应该处理空响应数据', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: {
                        code: 0,
                        message: 'success',
                        data: null
                    }
                })
                return { abort: vi.fn() }
            })

            const result = await httpClient.get('/api/test')
            expect(result).toBeNull()
        })

        it('应该处理没有认证token的情况', async () => {
            mockGetStorageSync.mockReturnValue(null)

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { code: 0, message: 'success', data: {} }
                })
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    header: expect.not.objectContaining({
                        'Authorization': expect.anything()
                    })
                })
            )
        })

        it('应该处理获取token时的异常', async () => {
            mockGetStorageSync.mockImplementation(() => {
                throw new Error('Storage error')
            })

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { code: 0, message: 'success', data: {} }
                })
                return { abort: vi.fn() }
            })

            // 应该不抛出错误，而是继续请求（不带token）
            await expect(httpClient.get('/api/test')).resolves.toBeDefined()
        })
    })

    describe('URL构建', () => {
        it('应该正确构建相对URL', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { code: 0, message: 'success', data: {} }
                })
                return { abort: vi.fn() }
            })

            await httpClient.get('/api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringMatching(/^https?:\/\/.*\/api\/test$/)
                })
            )
        })

        it('应该保持绝对URL不变', async () => {
            const absoluteUrl = 'https://other-api.com/test'

            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { code: 0, message: 'success', data: {} }
                })
                return { abort: vi.fn() }
            })

            await httpClient.get(absoluteUrl)

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: absoluteUrl
                })
            )
        })

        it('应该处理不以斜杠开头的相对URL', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: { code: 0, message: 'success', data: {} }
                })
                return { abort: vi.fn() }
            })

            await httpClient.get('api/test')

            expect(mockUniRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringMatching(/\/api\/test$/)
                })
            )
        })
    })

    describe('请求取消', () => {
        it('应该能够取消单个请求', async () => {
            const abortFn = vi.fn()
            let requestId = ''

            mockUniRequest.mockImplementation((options: any) => {
                // 模拟长时间运行的请求
                setTimeout(() => {
                    options.success({
                        statusCode: 200,
                        data: { code: 0, message: 'success', data: {} }
                    })
                }, 1000)
                return { abort: abortFn }
            })

            // 启动请求但不等待
            const requestPromise = httpClient.get('/api/test')

            // 由于我们无法直接获取requestId，我们测试cancelAll
            httpClient.cancelAll()

            expect(abortFn).toHaveBeenCalled()
        })

        it('应该能够取消所有请求', async () => {
            const abortFn1 = vi.fn()
            const abortFn2 = vi.fn()
            let callCount = 0

            mockUniRequest.mockImplementation((options: any) => {
                callCount++
                const abortFn = callCount === 1 ? abortFn1 : abortFn2
                setTimeout(() => {
                    options.success({
                        statusCode: 200,
                        data: { code: 0, message: 'success', data: {} }
                    })
                }, 1000)
                return { abort: abortFn }
            })

            // 启动多个请求
            const promise1 = httpClient.get('/api/test1')
            const promise2 = httpClient.get('/api/test2')

            // 取消所有请求
            httpClient.cancelAll()

            expect(abortFn1).toHaveBeenCalled()
            expect(abortFn2).toHaveBeenCalled()
        })
    })

    describe('并发请求', () => {
        it('应该能够处理多个并发请求', async () => {
            mockUniRequest.mockImplementation((options: any) => {
                options.success({
                    statusCode: 200,
                    data: {
                        code: 0,
                        message: 'success',
                        data: { url: options.url }
                    }
                })
                return { abort: vi.fn() }
            })

            const results = await Promise.all([
                httpClient.get('/api/test1'),
                httpClient.get('/api/test2'),
                httpClient.get('/api/test3')
            ])

            expect(results).toHaveLength(3)
            expect(mockUniRequest).toHaveBeenCalledTimes(3)
        })
    })
})
