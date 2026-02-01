/**
 * 文书 API 接口
 * 验证需求 6, 7
 */

import httpClient from './request'

/**
 * 获取模板列表
 */
export const getTemplates = async () => {
    // 实现待完成
}

/**
 * 获取模板详情
 */
export const getTemplateDetail = async (templateId: string) => {
    // 实现待完成
}

/**
 * 生成文书
 */
export const generateDocument = async (templateId: string, params: Record<string, any>) => {
    // 实现待完成
}
