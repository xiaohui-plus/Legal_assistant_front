/**
 * HttpClient 属性测试
 * Feature: legal-assistant-app
 * 验证需求 11, 12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
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

describe('HttpClient Property Tests', () => {
    let httpClient: HttpClient

    beforeEach(() => {
        httpClient = new HttpClient()
        vi.clearAllMocks()
        mockGetStorageSync.mockReturnValue(null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    /**
     * Property 17: 网络请求统一处理
     * 
     * 对于任意网络请求，封装后的请求应该：
     * 1. 自动包含通用请求头和认证信息
     * 2. 成功响应应该返回标准化的数据格式
     * 3. 失败响应应该返回标准化的错误格式
     * 
     * **Validates: Requirements 11.2, 11.3, 11.4**
     */
    describe('Property 17: 网络请求统一处理', () => {
        it('对于任意请求，应该自动添加通用请求头', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(), // 生成随机URL
                    fc.option(fc.string({ minLength: 1 }), { nil: null }), // 生成可选的token（确保非空字符串或null）
                    fc.record({
                        'X-Custom-Header': fc.string(),
                        'X-Request-Id': fc.uuid()
                    }), // 生成自定义请求头
                    async (url, token, customHeaders) => {
                        // 为每次测试创建新的HttpClient实例
                        const testClient = new HttpClient()

                        // 重置mock以确保每次测试都是干净的
                        mockGetStorageSync.mockReset()
                        mockGetStorageSync.mockReturnValue(token)
                        mockUniRequest.mockReset()

                        const mockResponse = {
                            statusCode: 200,
                            data: { code: 0, message: 'success', data: {} }
                        }

                        mockUniRequest.mockImplementation((options: any) => {
                            options.success(mockResponse)
                            return { abort: vi.fn() }
                        })

                        await testClient.get(url, undefined, { headers: customHeaders })

                        // 验证请求头包含通用头
                        expect(mockUniRequest).toHaveBeenCalledWith(
                            expect.objectContaining({
                                header: expect.objectContaining({
                                    'Content-Type': 'application/json',
                                    ...customHeaders
                                })
                            })
                        )

                        // 验证认证信息
                        const callArgs = mockUniRequest.mock.calls[0][0]
                        if (token) {
                            expect(callArgs.header).toHaveProperty('Authorization', `Bearer ${token}`)
                        } else {
                            expect(callArgs.header).not.toHaveProperty('Authorization')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意成功响应，应该返回标准化的数据格式', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.oneof(
                        // 生成不同格式的响应数据
                        fc.record({
                            code: fc.constant(0),
                            message: fc.string(),
                            data: fc.anything()
                        }),
                        fc.record({
                            code: fc.constant(200),
                            message: fc.string(),
                            data: fc.anything()
                        })
                    ),
                    async (url, responseData) => {
                        mockUniRequest.mockImplementation((options: any) => {
                            options.success({
                                statusCode: 200,
                                data: responseData
                            })
                            return { abort: vi.fn() }
                        })

                        const result = await httpClient.get(url)

                        // 验证返回的是data字段的内容
                        expect(result).toEqual(responseData.data)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意失败响应，应该返回标准化的错误格式', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.oneof(
                        fc.record({
                            errMsg: fc.string(),
                            code: fc.option(fc.integer(), { nil: undefined })
                        }),
                        fc.record({
                            statusCode: fc.integer({ min: 400, max: 599 }),
                            data: fc.string()
                        })
                    ),
                    async (url, errorData) => {
                        mockUniRequest.mockImplementation((options: any) => {
                            if ('errMsg' in errorData) {
                                options.fail(errorData)
                            } else {
                                options.success(errorData)
                            }
                            return { abort: vi.fn() }
                        })

                        try {
                            await httpClient.get(url, undefined, { retry: 0 })
                            // 如果没有抛出错误，测试失败
                            expect.fail('Should have thrown an error')
                        } catch (error: any) {
                            // 验证错误格式标准化
                            expect(error).toHaveProperty('code')
                            expect(error).toHaveProperty('message')
                            expect(error).toHaveProperty('data')
                            expect(typeof error.code).toBe('number')
                            expect(typeof error.message).toBe('string')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 18: 请求重试幂等性
     * 
     * 对于任意可重试的网络请求，多次重试应该产生与单次成功请求相同的结果（幂等性）
     * 
     * **Validates: Requirements 11.6**
     */
    describe('Property 18: 请求重试幂等性', () => {
        it('对于任意请求，重试后的结果应该与首次成功相同', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.record({
                        id: fc.integer(),
                        name: fc.string(),
                        value: fc.anything()
                    }),
                    fc.integer({ min: 1, max: 3 }), // 失败次数
                    async (url, expectedData, failCount) => {
                        let callCount = 0

                        mockUniRequest.mockImplementation((options: any) => {
                            callCount++
                            if (callCount <= failCount) {
                                // 前几次失败
                                options.fail({ errMsg: 'Network error' })
                            } else {
                                // 最后一次成功
                                options.success({
                                    statusCode: 200,
                                    data: {
                                        code: 0,
                                        message: 'success',
                                        data: expectedData
                                    }
                                })
                            }
                            return { abort: vi.fn() }
                        })

                        const result = await httpClient.get(url, undefined, { retry: failCount })

                        // 验证重试后的结果与预期数据相同
                        expect(result).toEqual(expectedData)
                        // 验证重试次数正确
                        expect(callCount).toBe(failCount + 1)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意POST请求，重试应该使用相同的请求数据', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.record({
                        field1: fc.string(),
                        field2: fc.integer(),
                        field3: fc.boolean()
                    }),
                    fc.integer({ min: 1, max: 2 }), // 失败次数
                    async (url, postData, failCount) => {
                        let callCount = 0
                        const capturedData: any[] = []

                        mockUniRequest.mockImplementation((options: any) => {
                            callCount++
                            capturedData.push(options.data)

                            if (callCount <= failCount) {
                                options.fail({ errMsg: 'Network error' })
                            } else {
                                options.success({
                                    statusCode: 200,
                                    data: {
                                        code: 0,
                                        message: 'success',
                                        data: { success: true }
                                    }
                                })
                            }
                            return { abort: vi.fn() }
                        })

                        await httpClient.post(url, postData, { retry: failCount })

                        // 验证所有重试使用相同的请求数据
                        for (const data of capturedData) {
                            expect(data).toEqual(postData)
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意请求，达到最大重试次数后应该抛出错误', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.integer({ min: 0, max: 5 }), // 最大重试次数
                    async (url, maxRetry) => {
                        let callCount = 0

                        mockUniRequest.mockImplementation((options: any) => {
                            callCount++
                            options.fail({ errMsg: 'Persistent network error' })
                            return { abort: vi.fn() }
                        })

                        try {
                            await httpClient.get(url, undefined, { retry: maxRetry })
                            expect.fail('Should have thrown an error')
                        } catch (error: any) {
                            // 验证调用次数 = 初始请求 + 重试次数
                            expect(callCount).toBe(maxRetry + 1)
                            // 验证错误格式
                            expect(error).toHaveProperty('code')
                            expect(error).toHaveProperty('message')
                        }
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 19: 流式数据完整性
     * 
     * 对于任意流式响应，接收到的所有数据块按顺序拼接后，应该等于完整的响应内容
     * 
     * **Validates: Requirements 12.1, 12.4**
     */
    describe('Property 19: 流式数据完整性', () => {
        it('对于任意SSE格式的流式数据，拼接后应该等于完整内容', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
                    async (url, chunks) => {
                        // 构造SSE格式的响应
                        const sseData = chunks
                            .map(chunk => `data: ${JSON.stringify({ chunk })}`)
                            .join('\n') + '\ndata: [DONE]\n'

                        mockUniRequest.mockImplementation((options: any) => {
                            options.success({
                                statusCode: 200,
                                data: sseData
                            })
                            return { abort: vi.fn() }
                        })

                        const receivedChunks: string[] = []
                        await httpClient.stream(url, {}, (chunk) => {
                            receivedChunks.push(chunk)
                        })

                        // 验证接收到的块与原始块相同
                        expect(receivedChunks).toEqual(chunks)
                        // 验证拼接后的内容
                        expect(receivedChunks.join('')).toBe(chunks.join(''))
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意分块数组格式的流式数据，拼接后应该等于完整内容', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
                    async (url, chunks) => {
                        mockUniRequest.mockImplementation((options: any) => {
                            options.success({
                                statusCode: 200,
                                data: { chunks }
                            })
                            return { abort: vi.fn() }
                        })

                        const receivedChunks: string[] = []
                        await httpClient.stream(url, {}, (chunk) => {
                            receivedChunks.push(chunk)
                        })

                        // 验证接收到的块与原始块相同
                        expect(receivedChunks).toEqual(chunks)
                        // 验证拼接后的内容
                        expect(receivedChunks.join('')).toBe(chunks.join(''))
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('对于任意完整内容格式的响应，应该一次性返回完整内容', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.webUrl(),
                    fc.string({ minLength: 1, maxLength: 1000 }),
                    async (url, content) => {
                        mockUniRequest.mockImplementation((options: any) => {
                            options.success({
                                statusCode: 200,
                                data: { content }
                            })
                            return { abort: vi.fn() }
                        })

                        const receivedChunks: string[] = []
                        await httpClient.stream(url, {}, (chunk) => {
                            receivedChunks.push(chunk)
                        })

                        // 验证只接收到一个块
                        expect(receivedChunks).toHaveLength(1)
                        // 验证内容完整
                        expect(receivedChunks[0]).toBe(content)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
