/**
 * 文书相关API
 */
import { get, post } from '@/utils/request'

/**
 * 获取文书模板
 */
export const getTemplates = () => {
	return get('/v1/documents/templates')
}

/**
 * 生成文书
 */
export const generateDocument = (templateId, formData) => {
	return post('/v1/documents/generate', {
		template_id: templateId,
		form_data: formData
	})
}

/**
 * 获取用户文书
 */
export const getUserDocuments = () => {
	return get('/v1/documents')
}