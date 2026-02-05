/**
 * 用户状态管理 - Vuex版本
 */
import { post, get } from '@/utils/request'

const state = {
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
}

const getters = {
	// 用户昵称
	nickname: (state) => state.userInfo?.nickname || '用户',
	// 用户手机号
	phone: (state) => state.userInfo?.phone || '',
	// 用户ID
	userId: (state) => state.userInfo?.id || null,
	// 是否已登录
	hasLogin: (state) => state.isLoggedIn && !!state.token
}

const mutations = {
	SET_USER_INFO(state, userInfo) {
		state.userInfo = userInfo
	},
	SET_LOGIN_STATUS(state, status) {
		state.isLoggedIn = status
	},
	SET_TOKEN(state, token) {
		state.token = token
	},
	SET_CODE_SENDING(state, status) {
		state.codeSending = status
	},
	SET_CODE_COUNTDOWN(state, countdown) {
		state.codeCountdown = countdown
	},
	CLEAR_USER_DATA(state) {
		state.userInfo = null
		state.isLoggedIn = false
		state.token = ''
	}
}

const actions = {
	/**
	 * 检查登录状态
	 */
	async checkLoginStatus({ commit, dispatch }) {
		try {
			const token = uni.getStorageSync('token')
			const userInfo = uni.getStorageSync('userInfo')
			
			if (token && userInfo) {
				commit('SET_TOKEN', token)
				commit('SET_USER_INFO', userInfo)
				commit('SET_LOGIN_STATUS', true)
				
				// 验证token是否有效
				await dispatch('validateToken')
			}
		} catch (error) {
			console.error('检查登录状态失败:', error)
			dispatch('logout')
		}
	},
	
	/**
	 * 验证token有效性
	 */
	async validateToken({ dispatch }) {
		try {
			// 调用需要认证的接口验证token
			await get('/api/conversations', {}, { loading: false })
		} catch (error) {
			// token无效，清除登录状态
			dispatch('logout')
			throw error
		}
	},
	
	/**
	 * 用户登录
	 */
	async login({ commit, dispatch }, loginData) {
		try {
			const response = await post('/api/auth/login', loginData, {
				loadingText: '登录中...'
			})
			
			// 保存登录信息
			dispatch('saveLoginInfo', response)
			
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
	 * 用户注册
	 */
	async register({ dispatch }, registerData) {
		try {
			const response = await post('/api/auth/register', registerData, {
				loadingText: '注册中...'
			})
			
			// 保存登录信息
			dispatch('saveLoginInfo', response)
			
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
	 * 保存登录信息
	 */
	saveLoginInfo({ commit }, response) {
		const { token, user } = response
		
		commit('SET_TOKEN', token)
		commit('SET_USER_INFO', user)
		commit('SET_LOGIN_STATUS', true)
		
		// 保存到本地存储
		uni.setStorageSync('token', token)
		uni.setStorageSync('userInfo', user)
	},
	
	/**
	 * 用户登出
	 */
	logout({ commit }) {
		// 清除状态
		commit('CLEAR_USER_DATA')
		
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
	updateUserInfo({ commit }, userInfo) {
		const newUserInfo = { ...state.userInfo, ...userInfo }
		commit('SET_USER_INFO', newUserInfo)
		uni.setStorageSync('userInfo', newUserInfo)
	},
	
	/**
	 * 开始验证码倒计时
	 */
	startCountdown({ commit }, seconds = 60) {
		commit('SET_CODE_COUNTDOWN', seconds)
		
		const timer = setInterval(() => {
			const currentCountdown = state.codeCountdown - 1
			commit('SET_CODE_COUNTDOWN', currentCountdown)
			
			if (currentCountdown <= 0) {
				clearInterval(timer)
			}
		}, 1000)
	},
	
	/**
	 * 快速登录（测试用）
	 */
	async quickLogin({ dispatch }) {
		return dispatch('login', {
			phone: '13800138000',
			password: '123456'
		})
	}
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}