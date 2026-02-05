/**
 * 认证相关API
 */
import { post } from '@/utils/request'

/**
 * 发送注册验证码
 */
export const sendRegisterCode = (phone) => {
	return post('/v1/auth/send-code', { phone })
}

/**
 * 发送重置密码验证码
 */
export const sendResetCode = (phone) => {
	return post('/v1/auth/send-reset-code', { phone })
}

/**
 * 验证验证码
 */
export const verifyCode = (phone, code) => {
	return post('/v1/auth/verify-code', { phone, code })
}

/**
 * 用户注册
 */
export const register = (data) => {
	return post('/v1/auth/register', data)
}

/**
 * 用户登录
 */
export const login = (data) => {
	return post('/v1/auth/login', data)
}

/**
 * 重置密码
 */
export const resetPassword = (data) => {
	return post('/v1/auth/reset-password', data)
}