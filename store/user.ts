/**
 * 用户状态管理
 * 验证需求 9
 */

import { defineStore } from 'pinia'
import type { UserProfile, UserSettings, StorageInfo, MemberLevel } from '../types/user'
import StorageManager from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'
import * as userApi from '../api/userApi'

export const useUserStore = defineStore('user', {
    state: () => ({
        // 用户信息
        profile: null as UserProfile | null,
        
        // 用户设置
        settings: {
            enableNotification: true,
            autoSaveChat: true,
            theme: 'light' as 'light' | 'dark'
        } as UserSettings,
        
        // 存储信息
        storageInfo: {
            currentSize: 0,
            limitSize: 10 * 1024 * 1024 // 10MB
        } as StorageInfo,
        
        // 收藏数据
        favoriteChats: [] as any[],
        favoriteTemplates: [] as any[],
        
        // 用户文书
        userDocuments: [] as any[],
        
        // 历史咨询
        chatHistory: [] as any[],
        
        // 法律文档
        legalDisclaimer: '',
        privacyPolicy: '',
        userAgreement: '',
        hasAgreedToTerms: false,
        
        // 加载状态
        loading: false,
        profileLoading: false,
        
        // 错误状态
        error: null as string | null
    }),

    getters: {
        // 获取用户显示名称
        displayName(): string {
            return this.profile?.nickname || '未登录用户'
        },

        // 获取用户头像
        avatarUrl(): string {
            return this.profile?.avatar || '/static/images/default-avatar.png'
        },

        // 获取会员等级显示文本
        memberLevelText(): string {
            if (!this.profile) return '未登录'
            
            switch (this.profile.memberLevel) {
                case 'free':
                    return '免费用户'
                case 'basic':
                    return '基础会员'
                case 'premium':
                    return '高级会员'
                default:
                    return '未知等级'
            }
        },

        // 获取剩余配额显示文本
        quotaText(): string {
            if (!this.profile) return '0'
            return this.profile.remainingQuota.toString()
        },

        // 检查是否为会员
        isPremiumMember(): boolean {
            return this.profile?.memberLevel === 'premium'
        },

        // 获取存储使用率
        storageUsagePercent(): number {
            if (this.storageInfo.limitSize === 0) return 0
            return Math.round((this.storageInfo.currentSize / this.storageInfo.limitSize) * 100)
        },

        // 获取存储使用情况文本
        storageUsageText(): string {
            const currentMB = (this.storageInfo.currentSize / (1024 * 1024)).toFixed(1)
            const limitMB = (this.storageInfo.limitSize / (1024 * 1024)).toFixed(1)
            return `${currentMB}MB / ${limitMB}MB`
        },

        // 检查是否需要同意协议
        needsAgreement(): boolean {
            return !this.hasAgreedToTerms
        }
    },

    actions: {
        // ==================== 用户信息管理 ====================

        /**
         * 获取用户信息
         * 验证需求 9.1 - 显示用户头像、昵称和会员状态
         */
        async getUserProfile(): Promise<void> {
            this.profileLoading = true
            this.error = null

            try {
                // 优先从服务器获取
                try {
                    this.profile = await userApi.getUserProfile()
                    // 保存到本地
                    await userApi.saveUserProfileToLocal(this.profile)
                } catch (error) {
                    // 服务器获取失败，从本地加载
                    this.profile = await userApi.loadUserProfileFromLocal()
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                this.error = '获取用户信息失败，请稍后重试'
            } finally {
                this.profileLoading = false
            }
        },

        /**
         * 更新用户信息
         * 验证需求 9.1 - 允许用户修改头像和昵称
         */
        async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
            if (!this.profile) return

            this.profileLoading = true
            this.error = null

            try {
                await userApi.updateUserProfile(updates)
                
                // 更新本地状态
                Object.assign(this.profile, updates)
                
                // 保存到本地
                await userApi.saveUserProfileToLocal(this.profile)
            } catch (error) {
                console.error('更新用户信息失败:', error)
                this.error = '更新用户信息失败，请稍后重试'
                throw error
            } finally {
                this.profileLoading = false
            }
        },

        /**
         * 获取用户配额
         * 验证需求 9.2 - 显示用户剩余的文书生成次数
         */
        async getUserQuota(): Promise<void> {
            try {
                const quota = await userApi.getUserQuota()
                
                if (this.profile) {
                    this.profile.remainingQuota = quota.remaining
                }
            } catch (error) {
                console.error('获取用户配额失败:', error)
            }
        },

        // ==================== 收藏管理 ====================

        /**
         * 获取收藏的聊天会话
         * 验证需求 9.3 - 显示收藏的聊天列表
         */
        async getFavoriteChats(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                this.favoriteChats = await userApi.getFavoriteChats()
            } catch (error) {
                console.error('获取收藏聊天失败:', error)
                this.error = '获取收藏聊天失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 获取收藏的文书模板
         * 验证需求 9.3 - 显示收藏的文书模板列表
         */
        async getFavoriteTemplates(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                this.favoriteTemplates = await userApi.getFavoriteTemplates()
            } catch (error) {
                console.error('获取收藏模板失败:', error)
                this.error = '获取收藏模板失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 收藏聊天会话
         * 验证需求 9.3 - 将聊天会话添加到收藏
         */
        async favoriteChat(chatId: string): Promise<void> {
            try {
                await userApi.favoriteChat(chatId)
                
                // 重新加载收藏列表
                await this.getFavoriteChats()
            } catch (error) {
                console.error('收藏聊天失败:', error)
                throw error
            }
        },

        /**
         * 取消收藏聊天会话
         * 验证需求 9.3 - 从收藏中移除聊天会话
         */
        async unfavoriteChat(chatId: string): Promise<void> {
            try {
                await userApi.unfavoriteChat(chatId)
                
                // 从本地列表中移除
                this.favoriteChats = this.favoriteChats.filter((chat: any) => chat.id !== chatId)
            } catch (error) {
                console.error('取消收藏聊天失败:', error)
                throw error
            }
        },

        // ==================== 我的文书管理 ====================

        /**
         * 获取用户保存的文书列表
         * 验证需求 9.4 - 显示所有已保存的法律文书列表
         */
        async getUserDocuments(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                this.userDocuments = await userApi.getUserDocuments()
            } catch (error) {
                console.error('获取用户文书失败:', error)
                this.error = '获取用户文书失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        /**
         * 删除用户文书
         * 验证需求 9.4 - 允许用户删除已保存的文书
         */
        async deleteUserDocument(documentId: string): Promise<void> {
            try {
                await userApi.deleteUserDocument(documentId)
                
                // 从本地列表中移除
                this.userDocuments = this.userDocuments.filter((doc: any) => doc.id !== documentId)
            } catch (error) {
                console.error('删除用户文书失败:', error)
                throw error
            }
        },

        // ==================== 历史咨询管理 ====================

        /**
         * 获取用户的历史咨询记录
         * 验证需求 9.5 - 显示历史咨询记录
         */
        async getChatHistory(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                this.chatHistory = await userApi.getUserChatHistory()
            } catch (error) {
                console.error('获取历史咨询失败:', error)
                this.error = '获取历史咨询失败，请稍后重试'
            } finally {
                this.loading = false
            }
        },

        // ==================== 用户设置管理 ====================

        /**
         * 获取用户设置
         * 验证需求 9.6 - 获取用户的个人设置
         */
        async getUserSettings(): Promise<void> {
            try {
                // 优先从服务器获取
                try {
                    this.settings = await userApi.getUserSettings()
                } catch (error) {
                    // 服务器获取失败，从本地加载
                    const localSettings = await userApi.loadSettingsFromLocal()
                    if (localSettings) {
                        this.settings = localSettings
                    }
                }
            } catch (error) {
                console.error('获取用户设置失败:', error)
            }
        },

        /**
         * 更新用户设置
         * 验证需求 9.6 - 允许用户修改个人设置
         */
        async updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
            try {
                await userApi.updateUserSettings(updates)
                
                // 更新本地状态
                Object.assign(this.settings, updates)
            } catch (error) {
                console.error('更新用户设置失败:', error)
                throw error
            }
        },

        /**
         * 获取存储信息
         * 验证需求 9.6 - 显示本地存储使用情况
         */
        async getStorageInfo(): Promise<void> {
            try {
                this.storageInfo = await userApi.getStorageInfo()
            } catch (error) {
                console.error('获取存储信息失败:', error)
            }
        },

        /**
         * 清除缓存
         * 验证需求 9.6，属性 16：缓存清除删除所有存储
         */
        async clearCache(): Promise<void> {
            this.loading = true
            this.error = null

            try {
                await userApi.clearCache()
                
                // 重新获取存储信息
                await this.getStorageInfo()
                
                // 清空本地状态（除用户设置外）
                this.favoriteChats = []
                this.favoriteTemplates = []
                this.userDocuments = []
                this.chatHistory = []
            } catch (error) {
                console.error('清除缓存失败:', error)
                this.error = '清除缓存失败，请稍后重试'
                throw error
            } finally {
                this.loading = false
            }
        },

        // ==================== 法律免责声明 ====================

        /**
         * 获取法律免责声明内容
         * 验证需求 9.7, 16 - 显示完整的免责声明内容
         */
        async getLegalDisclaimer(): Promise<void> {
            try {
                this.legalDisclaimer = await userApi.getLegalDisclaimer()
            } catch (error) {
                console.error('获取免责声明失败:', error)
            }
        },

        /**
         * 获取隐私政策内容
         * 验证需求 9.8, 16 - 显示隐私政策内容
         */
        async getPrivacyPolicy(): Promise<void> {
            try {
                this.privacyPolicy = await userApi.getPrivacyPolicy()
            } catch (error) {
                console.error('获取隐私政策失败:', error)
            }
        },

        /**
         * 获取用户协议内容
         * 验证需求 9.8, 16 - 显示用户协议内容
         */
        async getUserAgreement(): Promise<void> {
            try {
                this.userAgreement = await userApi.getUserAgreement()
            } catch (error) {
                console.error('获取用户协议失败:', error)
            }
        },

        /**
         * 记录用户同意协议
         * 验证需求 16.3 - 记录用户同意用户协议和隐私政策
         */
        async agreeToTerms(): Promise<void> {
            try {
                await userApi.recordUserAgreement()
                this.hasAgreedToTerms = true
            } catch (error) {
                console.error('记录用户协议失败:', error)
                throw error
            }
        },

        /**
         * 检查用户是否已同意协议
         * 验证需求 16.3 - 检查用户是否已同意协议
         */
        async checkUserAgreement(): Promise<void> {
            try {
                this.hasAgreedToTerms = await userApi.checkUserAgreement()
            } catch (error) {
                console.error('检查用户协议失败:', error)
                this.hasAgreedToTerms = false
            }
        },

        // ==================== 数据初始化 ====================

        /**
         * 初始化用户数据
         */
        async initializeUserData(): Promise<void> {
            try {
                // 并行加载用户数据
                await Promise.all([
                    this.getUserProfile(),
                    this.getUserSettings(),
                    this.getStorageInfo(),
                    this.checkUserAgreement()
                ])

                // 如果用户已登录，加载更多数据
                if (this.profile) {
                    await Promise.all([
                        this.getUserQuota(),
                        this.getFavoriteChats(),
                        this.getFavoriteTemplates(),
                        this.getUserDocuments(),
                        this.getChatHistory()
                    ])
                }
            } catch (error) {
                console.error('初始化用户数据失败:', error)
            }
        },

        /**
         * 刷新用户数据
         */
        async refreshUserData(): Promise<void> {
            await this.initializeUserData()
        },

        // ==================== 状态管理 ====================

        /**
         * 清除错误状态
         */
        clearError(): void {
            this.error = null
        },

        /**
         * 设置用户信息
         */
        setUserProfile(profile: UserProfile | null): void {
            this.profile = profile
        },

        /**
         * 登出用户
         */
        async logout(): Promise<void> {
            // 清空用户状态
            this.profile = null
            this.favoriteChats = []
            this.favoriteTemplates = []
            this.userDocuments = []
            this.chatHistory = []
            
            // 重置设置为默认值
            this.settings = {
                enableNotification: true,
                autoSaveChat: true,
                theme: 'light'
            }
            
            // 清除本地存储的用户信息
            try {
                await StorageManager.remove(STORAGE_KEYS.USER_PROFILE)
            } catch (error) {
                console.error('清除本地用户信息失败:', error)
            }
        },

        /**
         * 重置状态
         */
        reset(): void {
            this.profile = null
            this.settings = {
                enableNotification: true,
                autoSaveChat: true,
                theme: 'light'
            }
            this.storageInfo = {
                currentSize: 0,
                limitSize: 10 * 1024 * 1024
            }
            this.favoriteChats = []
            this.favoriteTemplates = []
            this.userDocuments = []
            this.chatHistory = []
            this.legalDisclaimer = ''
            this.privacyPolicy = ''
            this.userAgreement = ''
            this.hasAgreedToTerms = false
            this.error = null
        }
    }
})