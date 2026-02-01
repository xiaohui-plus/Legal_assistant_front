import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageManager } from '../../../utils/storage'

/**
 * 单元测试：StorageManager
 * 验证需求 10：本地数据存储
 */

// Mock uni API
const mockUni = {
    setStorage: vi.fn(),
    getStorage: vi.fn(),
    removeStorage: vi.fn(),
    clearStorage: vi.fn(),
    getStorageInfo: vi.fn()
}

// 将 mock 挂载到全局
global.uni = mockUni as any

describe('StorageManager', () => {
    let storageManager: StorageManager

    beforeEach(() => {
        // 重置所有 mock
        vi.clearAllMocks()
        storageManager = new StorageManager()
    })

    describe('set', () => {
        it('should save data to storage successfully', async () => {
            const key = 'test_key'
            const value = { name: 'test', count: 42 }

            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set(key, value)

            expect(mockUni.setStorage).toHaveBeenCalledWith({
                key,
                data: value,
                success: expect.any(Function),
                fail: expect.any(Function)
            })
        })

        it('should handle storage set failure', async () => {
            const key = 'test_key'
            const value = 'test_value'

            mockUni.setStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'storage full' })
            })

            await expect(storageManager.set(key, value)).rejects.toThrow('Storage set failed: storage full')
        })

        it('should save different data types', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            // String
            await storageManager.set('string_key', 'test string')
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'string_key', data: 'test string' })
            )

            // Number
            await storageManager.set('number_key', 123)
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'number_key', data: 123 })
            )

            // Boolean
            await storageManager.set('boolean_key', true)
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'boolean_key', data: true })
            )

            // Array
            await storageManager.set('array_key', [1, 2, 3])
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'array_key', data: [1, 2, 3] })
            )

            // Object
            await storageManager.set('object_key', { a: 1, b: 2 })
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: 'object_key', data: { a: 1, b: 2 } })
            )
        })
    })

    describe('get', () => {
        it('should retrieve data from storage successfully', async () => {
            const key = 'test_key'
            const expectedValue = { name: 'test', count: 42 }

            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: expectedValue })
            })

            const result = await storageManager.get(key)

            expect(result).toEqual(expectedValue)
            expect(mockUni.getStorage).toHaveBeenCalledWith({
                key,
                success: expect.any(Function),
                fail: expect.any(Function)
            })
        })

        it('should return null when data not found', async () => {
            const key = 'non_existent_key'

            mockUni.getStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'getStorage:fail data not found' })
            })

            const result = await storageManager.get(key)

            expect(result).toBeNull()
        })

        it('should handle storage get failure (non-404 errors)', async () => {
            const key = 'test_key'

            mockUni.getStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'storage error' })
            })

            await expect(storageManager.get(key)).rejects.toThrow('Storage get failed: storage error')
        })

        it('should retrieve different data types', async () => {
            // String
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: 'test string' })
            })
            expect(await storageManager.get<string>('string_key')).toBe('test string')

            // Number
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: 123 })
            })
            expect(await storageManager.get<number>('number_key')).toBe(123)

            // Boolean
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: false })
            })
            expect(await storageManager.get<boolean>('boolean_key')).toBe(false)

            // Array
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: [1, 2, 3] })
            })
            expect(await storageManager.get<number[]>('array_key')).toEqual([1, 2, 3])

            // Object
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: { a: 1, b: 2 } })
            })
            expect(await storageManager.get<{ a: number; b: number }>('object_key')).toEqual({ a: 1, b: 2 })
        })
    })

    describe('remove', () => {
        it('should remove data from storage successfully', async () => {
            const key = 'test_key'

            mockUni.removeStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.remove(key)

            expect(mockUni.removeStorage).toHaveBeenCalledWith({
                key,
                success: expect.any(Function),
                fail: expect.any(Function)
            })
        })

        it('should handle storage remove failure', async () => {
            const key = 'test_key'

            mockUni.removeStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'remove failed' })
            })

            await expect(storageManager.remove(key)).rejects.toThrow('Storage remove failed: remove failed')
        })
    })

    describe('clear', () => {
        it('should clear all storage successfully', async () => {
            mockUni.clearStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.clear()

            expect(mockUni.clearStorage).toHaveBeenCalledWith({
                success: expect.any(Function),
                fail: expect.any(Function)
            })
        })

        it('should handle storage clear failure', async () => {
            mockUni.clearStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'clear failed' })
            })

            await expect(storageManager.clear()).rejects.toThrow('Storage clear failed: clear failed')
        })
    })

    describe('getStorageInfo', () => {
        it('should retrieve storage info successfully', async () => {
            const mockInfo = {
                keys: ['key1', 'key2', 'key3'],
                currentSize: 100,
                limitSize: 10240
            }

            mockUni.getStorageInfo.mockImplementation((options: any) => {
                options.success(mockInfo)
            })

            const result = await storageManager.getStorageInfo()

            expect(result).toEqual(mockInfo)
            expect(mockUni.getStorageInfo).toHaveBeenCalledWith({
                success: expect.any(Function),
                fail: expect.any(Function)
            })
        })

        it('should handle get storage info failure', async () => {
            mockUni.getStorageInfo.mockImplementation((options: any) => {
                options.fail({ errMsg: 'get info failed' })
            })

            await expect(storageManager.getStorageInfo()).rejects.toThrow('Get storage info failed: get info failed')
        })

        it('should return empty keys array when no data stored', async () => {
            const mockInfo = {
                keys: [],
                currentSize: 0,
                limitSize: 10240
            }

            mockUni.getStorageInfo.mockImplementation((options: any) => {
                options.success(mockInfo)
            })

            const result = await storageManager.getStorageInfo()

            expect(result.keys).toEqual([])
            expect(result.currentSize).toBe(0)
        })
    })

    describe('Integration scenarios', () => {
        it('should handle set and get workflow', async () => {
            const key = 'workflow_key'
            const value = { data: 'test workflow' }

            // Set data
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })
            await storageManager.set(key, value)

            // Get data
            mockUni.getStorage.mockImplementation((options: any) => {
                options.success({ data: value })
            })
            const result = await storageManager.get(key)

            expect(result).toEqual(value)
        })

        it('should handle set, remove, and get workflow', async () => {
            const key = 'workflow_key'
            const value = 'test value'

            // Set data
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })
            await storageManager.set(key, value)

            // Remove data
            mockUni.removeStorage.mockImplementation((options: any) => {
                options.success()
            })
            await storageManager.remove(key)

            // Get data (should return null)
            mockUni.getStorage.mockImplementation((options: any) => {
                options.fail({ errMsg: 'getStorage:fail data not found' })
            })
            const result = await storageManager.get(key)

            expect(result).toBeNull()
        })
    })

    describe('Edge cases', () => {
        it('should handle empty string as key', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set('', 'value')
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ key: '' })
            )
        })

        it('should handle null value', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set('null_key', null)
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ data: null })
            )
        })

        it('should handle undefined value', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set('undefined_key', undefined)
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ data: undefined })
            )
        })

        it('should handle empty object', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set('empty_object', {})
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ data: {} })
            )
        })

        it('should handle empty array', async () => {
            mockUni.setStorage.mockImplementation((options: any) => {
                options.success()
            })

            await storageManager.set('empty_array', [])
            expect(mockUni.setStorage).toHaveBeenCalledWith(
                expect.objectContaining({ data: [] })
            )
        })
    })
})
