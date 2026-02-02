/**
 * 用户 API 接口
 * 验证需求 9
 */

import httpClient from './request'
import type { UserProfile, UserSettings, StorageInfo } from '../types/user'
import type { ApiResponse } from '../types/api'

// 声明 uni 全局变量
declare const uni: any

// ==================== 用户信息管理 ====================

/**
 * 获取用户信息
 * 验证需求 9.1 - 显示用户头像、昵称和会员状态
 */
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const response = await httpClient.get<ApiResponse<UserProfile>>('/api/user/profile')
        return response.data
    } catch (error) {
        console.error('获取用户信息失败:', error)
        throw new Error('获取用户信息失败，请稍后重试')
    }
}

/**
 * 更新用户信息
 * 验证需求 9.1 - 允许用户修改头像和昵称
 */
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    try {
        await httpClient.put<ApiResponse<void>>('/api/user/profile', profile)
    } catch (error) {
        console.error('更新用户信息失败:', error)
        throw new Error('更新用户信息失败，请稍后重试')
    }
}

/**
 * 获取用户剩余配额
 * 验证需求 9.2 - 显示用户剩余的文书生成次数
 */
export const getUserQuota = async (): Promise<{ remaining: number; total: number }> => {
    try {
        const response = await httpClient.get<ApiResponse<{ remaining: number; total: number }>>('/api/user/quota')
        return response.data
    } catch (error) {
        console.error('获取用户配额失败:', error)
        throw new Error('获取用户配额失败，请稍后重试')
    }
}

// ==================== 收藏管理 ====================

/**
 * 获取收藏的聊天会话
 * 验证需求 9.3 - 显示收藏的聊天列表
 */
export const getFavoriteChats = async (): Promise<any[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ chats: any[] }>>('/api/user/favorites/chats')
        return response.data.chats
    } catch (error) {
        console.error('获取收藏聊天失败:', error)
        throw new Error('获取收藏聊天失败，请稍后重试')
    }
}

/**
 * 获取收藏的文书模板
 * 验证需求 9.3 - 显示收藏的文书模板列表
 */
export const getFavoriteTemplates = async (): Promise<any[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ templates: any[] }>>('/api/user/favorites/templates')
        return response.data.templates
    } catch (error) {
        console.error('获取收藏模板失败:', error)
        throw new Error('获取收藏模板失败，请稍后重试')
    }
}

/**
 * 收藏聊天会话
 * 验证需求 9.3 - 将聊天会话添加到收藏
 */
export const favoriteChat = async (chatId: string): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>('/api/user/favorites/chats', { chatId })
    } catch (error) {
        console.error('收藏聊天失败:', error)
        throw new Error('收藏聊天失败，请稍后重试')
    }
}

/**
 * 取消收藏聊天会话
 * 验证需求 9.3 - 从收藏中移除聊天会话
 */
export const unfavoriteChat = async (chatId: string): Promise<void> => {
    try {
        await httpClient.delete<ApiResponse<void>>(`/api/user/favorites/chats/${chatId}`)
    } catch (error) {
        console.error('取消收藏聊天失败:', error)
        throw new Error('取消收藏聊天失败，请稍后重试')
    }
}

// ==================== 我的文书管理 ====================

/**
 * 获取用户保存的文书列表
 * 验证需求 9.4 - 显示所有已保存的法律文书列表
 */
export const getUserDocuments = async (): Promise<any[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ documents: any[] }>>('/api/user/documents')
        return response.data.documents
    } catch (error) {
        console.error('获取用户文书失败:', error)
        throw new Error('获取用户文书失败，请稍后重试')
    }
}

/**
 * 删除用户文书
 * 验证需求 9.4 - 允许用户删除已保存的文书
 */
export const deleteUserDocument = async (documentId: string): Promise<void> => {
    try {
        await httpClient.delete<ApiResponse<void>>(`/api/user/documents/${documentId}`)
    } catch (error) {
        console.error('删除用户文书失败:', error)
        throw new Error('删除用户文书失败，请稍后重试')
    }
}

// ==================== 历史咨询管理 ====================

/**
 * 获取用户的历史咨询记录
 * 验证需求 9.5 - 显示历史咨询记录
 */
export const getUserChatHistory = async (): Promise<any[]> => {
    try {
        const response = await httpClient.get<ApiResponse<{ chats: any[] }>>('/api/user/chats')
        return response.data.chats
    } catch (error) {
        console.error('获取历史咨询失败:', error)
        throw new Error('获取历史咨询失败，请稍后重试')
    }
}

// ==================== 用户设置管理 ====================

/**
 * 获取用户设置
 * 验证需求 9.6 - 获取用户的个人设置
 */
export const getUserSettings = async (): Promise<UserSettings> => {
    try {
        const response = await httpClient.get<ApiResponse<UserSettings>>('/api/user/settings')
        return response.data
    } catch (error) {
        console.error('获取用户设置失败:', error)
        // 返回默认设置而不是抛出错误
        return {
            enableNotification: true,
            autoSaveChat: true,
            theme: 'light'
        }
    }
}

/**
 * 更新用户设置
 * 验证需求 9.6 - 允许用户修改个人设置
 */
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
    try {
        await httpClient.put<ApiResponse<void>>('/api/user/settings', settings)
        
        // 同时保存到本地存储
        await saveSettingsToLocal(settings)
    } catch (error) {
        console.error('更新用户设置失败:', error)
        throw new Error('更新用户设置失败，请稍后重试')
    }
}

/**
 * 获取存储信息
 * 验证需求 9.6 - 显示本地存储使用情况
 */
export const getStorageInfo = async (): Promise<StorageInfo> => {
    try {
        // 获取本地存储使用情况
        const storageInfo = await uni.getStorageInfo()
        
        return {
            currentSize: storageInfo.currentSize || 0,
            limitSize: storageInfo.limitSize || 10 * 1024 * 1024 // 默认 10MB
        }
    } catch (error) {
        console.error('获取存储信息失败:', error)
        return {
            currentSize: 0,
            limitSize: 10 * 1024 * 1024
        }
    }
}

/**
 * 清除缓存
 * 验证需求 9.6 - 清除所有本地存储的数据（除用户设置外）
 */
export const clearCache = async (): Promise<void> => {
    try {
        // 获取当前用户设置
        const currentSettings = await loadSettingsFromLocal()
        
        // 清除所有存储
        await uni.clearStorage()
        
        // 恢复用户设置
        if (currentSettings) {
            await saveSettingsToLocal(currentSettings)
        }
        
        uni.showToast({
            title: '缓存清除成功',
            icon: 'success',
            duration: 2000
        })
    } catch (error) {
        console.error('清除缓存失败:', error)
        uni.showToast({
            title: '清除缓存失败',
            icon: 'error',
            duration: 2000
        })
        throw new Error('清除缓存失败')
    }
}

// ==================== 本地存储相关 ====================

/**
 * 保存设置到本地存储
 */
export const saveSettingsToLocal = async (settings: Partial<UserSettings>): Promise<void> => {
    try {
        // 获取现有设置
        const existingSettings = await loadSettingsFromLocal()
        
        // 合并设置
        const mergedSettings = {
            ...existingSettings,
            ...settings
        }
        
        await uni.setStorage({
            key: 'user_settings',
            data: mergedSettings
        })
    } catch (error) {
        console.error('保存设置到本地失败:', error)
    }
}

/**
 * 从本地存储加载设置
 */
export const loadSettingsFromLocal = async (): Promise<UserSettings | null> => {
    try {
        const result = await uni.getStorage({ key: 'user_settings' })
        return result.data || null
    } catch (error) {
        console.log('没有找到本地设置:', error)
        return null
    }
}

/**
 * 保存用户信息到本地存储
 */
export const saveUserProfileToLocal = async (profile: UserProfile): Promise<void> => {
    try {
        await uni.setStorage({
            key: 'user_profile',
            data: profile
        })
    } catch (error) {
        console.error('保存用户信息到本地失败:', error)
    }
}

/**
 * 从本地存储加载用户信息
 */
export const loadUserProfileFromLocal = async (): Promise<UserProfile | null> => {
    try {
        const result = await uni.getStorage({ key: 'user_profile' })
        return result.data || null
    } catch (error) {
        console.log('没有找到本地用户信息:', error)
        return null
    }
}

// ==================== 法律免责声明 ====================

/**
 * 获取法律免责声明内容
 * 验证需求 9.7, 16 - 显示完整的免责声明内容
 */
export const getLegalDisclaimer = async (): Promise<string> => {
    try {
        const response = await httpClient.get<ApiResponse<{ content: string }>>('/api/legal/disclaimer')
        return response.data.content
    } catch (error) {
        console.error('获取免责声明失败:', error)
        // 返回默认免责声明
        return getDefaultLegalDisclaimer()
    }
}

/**
 * 获取隐私政策内容
 * 验证需求 9.8, 16 - 显示隐私政策内容
 */
export const getPrivacyPolicy = async (): Promise<string> => {
    try {
        const response = await httpClient.get<ApiResponse<{ content: string }>>('/api/legal/privacy')
        return response.data.content
    } catch (error) {
        console.error('获取隐私政策失败:', error)
        // 返回默认隐私政策
        return getDefaultPrivacyPolicy()
    }
}

/**
 * 获取用户协议内容
 * 验证需求 9.8, 16 - 显示用户协议内容
 */
export const getUserAgreement = async (): Promise<string> => {
    try {
        const response = await httpClient.get<ApiResponse<{ content: string }>>('/api/legal/agreement')
        return response.data.content
    } catch (error) {
        console.error('获取用户协议失败:', error)
        // 返回默认用户协议
        return getDefaultUserAgreement()
    }
}

/**
 * 记录用户同意协议
 * 验证需求 16.3 - 记录用户同意用户协议和隐私政策
 */
export const recordUserAgreement = async (): Promise<void> => {
    try {
        await httpClient.post<ApiResponse<void>>('/api/user/agreement', {
            agreedAt: Date.now(),
            version: '1.0'
        })
        
        // 同时保存到本地
        await uni.setStorage({
            key: 'user_agreement_accepted',
            data: {
                accepted: true,
                agreedAt: Date.now(),
                version: '1.0'
            }
        })
    } catch (error) {
        console.error('记录用户协议失败:', error)
        // 即使服务器记录失败，也要保存到本地
        await uni.setStorage({
            key: 'user_agreement_accepted',
            data: {
                accepted: true,
                agreedAt: Date.now(),
                version: '1.0'
            }
        })
    }
}

/**
 * 检查用户是否已同意协议
 * 验证需求 16.3 - 检查用户是否已同意协议
 */
export const checkUserAgreement = async (): Promise<boolean> => {
    try {
        const result = await uni.getStorage({ key: 'user_agreement_accepted' })
        return result.data?.accepted === true
    } catch (error) {
        console.log('用户尚未同意协议:', error)
        return false
    }
}

// ==================== 默认法律文档内容 ====================

/**
 * 获取默认法律免责声明
 */
function getDefaultLegalDisclaimer(): string {
    return `
# 法律免责声明

## 重要提示

本应用提供的所有内容仅供参考，不构成正式的法律意见或建议。

## 服务范围

1. 本应用提供的法律咨询内容基于人工智能技术生成，可能存在不准确或不完整的情况。
2. 生成的法律文书模板仅为参考格式，具体使用时需要根据实际情况进行调整。
3. 用户在使用本应用时，应当结合具体情况，必要时咨询专业律师。

## 责任限制

1. 本应用不对内容的准确性、完整性、时效性承担责任。
2. 用户因使用本应用内容而产生的任何损失，本应用不承担责任。
3. 本应用不对用户的具体法律问题提供最终解决方案。

## 建议

对于重要的法律事务，建议用户：
1. 咨询专业律师
2. 寻求正式的法律服务
3. 根据最新法律法规进行判断

本声明的解释权归本应用所有。
    `.trim()
}

/**
 * 获取默认隐私政策
 */
function getDefaultPrivacyPolicy(): string {
    return `
# 隐私政策

## 信息收集

我们可能收集以下信息：
1. 用户提供的个人信息（昵称、头像等）
2. 使用应用时产生的数据（聊天记录、文书内容等）
3. 设备信息和使用统计

## 信息使用

收集的信息用于：
1. 提供和改进服务
2. 个性化用户体验
3. 技术支持和客户服务

## 信息保护

我们承诺：
1. 不会向第三方出售用户信息
2. 采用适当的安全措施保护用户数据
3. 仅在必要时使用用户信息

## 用户权利

用户有权：
1. 查看和修改个人信息
2. 删除个人数据
3. 选择退出某些数据收集

如有疑问，请联系我们。
    `.trim()
}

/**
 * 获取默认用户协议
 */
function getDefaultUserAgreement(): string {
    return `
# 用户协议

## 服务条款

1. 用户应当合法使用本应用提供的服务
2. 不得利用本应用从事违法活动
3. 尊重他人权利和隐私

## 用户责任

1. 保护账户安全
2. 提供真实信息
3. 遵守相关法律法规

## 服务变更

我们保留：
1. 修改服务内容的权利
2. 暂停或终止服务的权利
3. 更新协议条款的权利

## 争议解决

如发生争议，应当：
1. 友好协商解决
2. 适用中华人民共和国法律
3. 由有管辖权的法院处理

本协议自用户同意之日起生效。
    `.trim()
}