/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { post, get } from '@/utils/request'

export const useUserStore = defineStore('user', {
	state: () => ({
		// 用户信息
		userInfo: null,
		// 登录状态
		isLoggedIn: false,
		// 登录token
		token: '',
		// 验证码发送状态
		codeSending: false,
		// 验证码倒计时
		codeCountdown: 0
	}),
	
	getters: {
		// 用户昵称
		nickname: (state) => state.userInfo?.nickname || '用户',
		// 用户手机号
		phone: (state) => state.userInfo?.phone || '',
		// 用户ID
		userId: (state) => state.userInfo?.id || null,
		// 是否已登录
		hasLogin: (state) => state.isLoggedIn && !!state.token
	},
	
	actions: {
		/**
		 * 检查登录状态
		 */
		async checkLoginStatus() {
			try {
				const token = uni.getStorageSync('token')
				const userInfo = uni.getStorageSync('userInfo')
				
				if (token && userInfo) {
					this.token = token
					this.userInfo = userInfo
					this.isLoggedIn = true
					
					// 验证token是否有效
					await this.validateToken()
				}
			} catch (error) {
				console.error('检查登录状态失败:', error)
				this.logout()
			}
		},
		
		/**
		 * 验证token有效性
		 */
		async validateToken() {
			try {
				// 调用需要认证的接口验证token
				await get('/api/conversations', {}, { loading: false })
			} catch (error) {
				// token无效，清除登录状态
				this.logout()
				throw error
			}
		},
		
		/**
		 * 发送注册验证码
		 */
		async sendRegisterCode(phone) {
			try {
				this.codeSending = true
				
				const response = await post('/v1/auth/send-code', {
					phone
				}, {
					loadingText: '发送验证码中...'
				})
				
				// 开始倒计时
				this.startCountdown()
				
				uni.showToast({
					title: '验证码发送成功',
					icon: 'success'
				})
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.detail || '验证码发送失败',
					icon: 'none'
				})
				throw error
			} finally {
				this.codeSending = false
			}
		},
		
		/**
		 * 发送重置密码验证码
		 */
		async sendResetCode(phone) {
			try {
				this.codeSending = true
				
				const response = await post('/v1/auth/send-reset-code', {
					phone
				}, {
					loadingText: '发送验证码中...'
				})
				
				// 开始倒计时
				this.startCountdown()
				
				uni.showToast({
					title: '验证码发送成功',
					icon: 'success'
				})
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.detail || '验证码发送失败',
					icon: 'none'
				})
				throw error
			} finally {
				this.codeSending = false
			}
		},
		
		/**
		 * 验证验证码
		 */
		async verifyCode(phone, code) {
			try {
				const response = await post('/v1/auth/verify-code', {
					phone,
					code
				}, {
					loading: false
				})
				
				return response
			} catch (error) {
				throw error
			}
		},
		
		/**
		 * 用户注册
		 */
		async register(registerData) {
			try {
				const response = await post('/api/auth/register', registerData, {
					loadingText: '注册中...'
				})
				
				// 保存登录信息
				this.saveLoginInfo(response)
				
				uni.showToast({
					title: '注册成功',
					icon: 'success'
				})
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.message || '注册失败',
					icon: 'none'
				})
				throw error
			}
		},
		
		/**
		 * 用户登录
		 */
		async login(loginData) {
			try {
				const response = await post('/api/auth/login', loginData, {
					loadingText: '登录中...'
				})
				
				// 保存登录信息
				this.saveLoginInfo(response)
				
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.message || '登录失败',
					icon: 'none'
				})
				throw error
			}
		},
		
		/**
		 * 重置密码
		 */
		async resetPassword(resetData) {
			try {
				const response = await post('/v1/auth/reset-password', resetData, {
					loadingText: '重置密码中...'
				})
				
				uni.showToast({
					title: '密码重置成功',
					icon: 'success'
				})
				
				return response
			} catch (error) {
				uni.showToast({
					title: error.detail || '密码重置失败',
					icon: 'none'
				})
				throw error
			}
		},
		
		/**
		 * 保存登录信息
		 */
		saveLoginInfo(response) {
			const { token, user } = response
			
			this.token = token
			this.userInfo = user
			this.isLoggedIn = true
			
			// 保存到本地存储
			uni.setStorageSync('token', token)
			uni.setStorageSync('userInfo', user)
		},
		
		/**
		 * 用户登出
		 */
		logout() {
			// 清除状态
			this.token = ''
			this.userInfo = null
			this.isLoggedIn = false
			
			// 清除本地存储
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
			
			// 跳转到登录页
			uni.reLaunch({
				url: '/pages/auth/login'
			})
		},
		
		/**
		 * 更新用户信息
		 */
		updateUserInfo(userInfo) {
			this.userInfo = { ...this.userInfo, ...userInfo }
			uni.setStorageSync('userInfo', this.userInfo)
		},
		
		/**
		 * 开始验证码倒计时
		 */
		startCountdown(seconds = 60) {
			this.codeCountdown = seconds
			
			const timer = setInterval(() => {
				this.codeCountdown--
				
				if (this.codeCountdown <= 0) {
					clearInterval(timer)
					this.codeCountdown = 0
				}
			}, 1000)
		},
		
		/**
		 * 快速登录（测试用）
		 */
		async quickLogin() {
			return this.login({
				phone: '13800138000',
				password: '123456'
			})
		}
	}
})