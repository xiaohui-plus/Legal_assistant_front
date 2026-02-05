import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import chat from './modules/chat'
import document from './modules/document'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		user,
		chat,
		document
	},
	
	state: {
		// 全局状态
		appVersion: '1.0.0',
		systemInfo: null,
		networkStatus: 'unknown'
	},
	
	getters: {
		// 全局getters
		isOnline: (state) => state.networkStatus !== 'none',
		appInfo: (state) => ({
			version: state.appVersion,
			platform: state.systemInfo?.platform || 'unknown'
		})
	},
	
	mutations: {
		SET_SYSTEM_INFO(state, info) {
			state.systemInfo = info
		},
		
		SET_NETWORK_STATUS(state, status) {
			state.networkStatus = status
		}
	},
	
	actions: {
		// 初始化应用
		async initApp({ commit, dispatch }) {
			try {
				// 获取系统信息
				const systemInfo = uni.getSystemInfoSync()
				commit('SET_SYSTEM_INFO', systemInfo)
				
				// 检查网络状态
				uni.getNetworkType({
					success: (res) => {
						commit('SET_NETWORK_STATUS', res.networkType)
					}
				})
				
				// 监听网络状态变化
				uni.onNetworkStatusChange((res) => {
					commit('SET_NETWORK_STATUS', res.networkType)
				})
				
				// 检查登录状态
				await dispatch('user/checkLoginStatus')
				
			} catch (error) {
				console.error('应用初始化失败:', error)
			}
		}
	}
})

export default store