/**
 * 用户相关类型定义
 * 验证需求 9
 */

/**
 * 会员等级
 */
export enum MemberLevel {
    FREE = 'free',
    BASIC = 'basic',
    PREMIUM = 'premium'
}

/**
 * 用户信息
 */
export interface UserProfile {
    id: string
    nickname: string
    avatar: string
    memberLevel: MemberLevel
    remainingQuota: number
}

/**
 * 用户设置
 */
export interface UserSettings {
    enableNotification: boolean
    autoSaveChat: boolean
    theme: 'light' | 'dark'
}

/**
 * 存储信息
 */
export interface StorageInfo {
    currentSize: number
    limitSize: number
}
