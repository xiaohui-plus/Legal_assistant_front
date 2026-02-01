/**
 * 本地存储工具
 * 验证需求 10
 */

/**
 * 存储信息接口
 */
export interface StorageInfo {
    keys: string[]
    currentSize: number
    limitSize: number
}

/**
 * StorageManager - 本地存储管理器
 * 
 * 统一管理本地数据的存储和读取，封装 uni.setStorage API
 * 
 * 验证需求 10：本地数据存储
 * - 10.1: 保存消息到本地存储
 * - 10.2: 保存文书到本地存储
 * - 10.3: 保存收藏信息到本地存储
 * - 10.4: 保存表单数据到本地存储
 * - 10.5: 从本地存储加载历史数据
 * - 10.6: 清除缓存删除所有本地存储数据
 */
export class StorageManager {
    /**
     * 保存数据到本地存储
     * @param key 存储键
     * @param value 存储值
     */
    async set<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            uni.setStorage({
                key,
                data: value,
                success: () => resolve(),
                fail: (error) => reject(new Error(`Storage set failed: ${error.errMsg}`))
            })
        })
    }

    /**
     * 从本地存储读取数据
     * @param key 存储键
     * @returns 存储的值，如果不存在则返回 null
     */
    async get<T>(key: string): Promise<T | null> {
        return new Promise((resolve, reject) => {
            uni.getStorage({
                key,
                success: (res) => resolve(res.data as T),
                fail: (error) => {
                    // 如果是数据不存在的错误，返回 null 而不是抛出异常
                    if (error.errMsg.includes('data not found')) {
                        resolve(null)
                    } else {
                        reject(new Error(`Storage get failed: ${error.errMsg}`))
                    }
                }
            })
        })
    }

    /**
     * 从本地存储删除指定数据
     * @param key 存储键
     */
    async remove(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            uni.removeStorage({
                key,
                success: () => resolve(),
                fail: (error) => reject(new Error(`Storage remove failed: ${error.errMsg}`))
            })
        })
    }

    /**
     * 清空所有本地存储数据
     */
    async clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            uni.clearStorage({
                success: () => resolve(),
                fail: (error) => reject(new Error(`Storage clear failed: ${error.errMsg}`))
            })
        })
    }

    /**
     * 获取本地存储信息
     * @returns 存储信息，包含所有键、当前大小和限制大小
     */
    async getStorageInfo(): Promise<StorageInfo> {
        return new Promise((resolve, reject) => {
            uni.getStorageInfo({
                success: (res) => {
                    resolve({
                        keys: res.keys,
                        currentSize: res.currentSize,
                        limitSize: res.limitSize
                    })
                },
                fail: (error) => reject(new Error(`Get storage info failed: ${error.errMsg}`))
            })
        })
    }
}

export default new StorageManager()
