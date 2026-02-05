/**
 * 网络请求封装
 */

const BASE_URL = 'http://localhost:8001'

// 请求拦截器
const requestInterceptor = (config) => {
	// 添加 token
	const token = uni.getStorageSync('token')
	if (token) {
		config.header = {
			...config.header,
			'Authorization': `Bearer ${token}`
		}
	}
	
	// 添加通用请求头
	config.header = {
		'Content-Type': 'application/json',
		...config.header
	}
	
	// 显示加载提示
	if (config.loading !== false) {
		uni.showLoading({
			title: config.loadingText || '加载中...',
			mask: true
		})
	}
	
	return config
}

// 响应拦截器
const responseInterceptor = (response, config) => {
	// 隐藏加载提示
	if (config.loading !== false) {
		uni.hideLoading()
	}
	
	const { statusCode, data } = response
	
	// HTTP 状态码检查
	if (statusCode !== 200) {
		handleHttpError(statusCode, data)
		return Promise.reject(response)
	}
	
	// 业务状态码检查
	if (data.status_code && data.status_code !== 200) {
		handleBusinessError(data.status_code, data.detail || data.message)
		return Promise.reject(data)
	}
	
	return data
}

// HTTP 错误处理
const handleHttpError = (statusCode, data) => {
	let message = '网络请求失败'
	
	switch (statusCode) {
		case 400:
			message = '请求参数错误'
			break
		case 401:
			message = '未授权，请重新登录'
			// 清除本地 token
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
			// 跳转到登录页
			uni.reLaunch({
				url: '/pages/auth/login'
			})
			break
		case 403:
			message = '拒绝访问'
			break
		case 404:
			message = '请求地址不存在'
			break
		case 429:
			message = '请求过于频繁，请稍后重试'
			break
		case 500:
			message = '服务器内部错误'
			break
		case 502:
			message = '网关错误'
			break
		case 503:
			message = '服务不可用'
			break
		case 504:
			message = '网关超时'
			break
		default:
			message = `请求失败 (${statusCode})`
	}
	
	uni.showToast({
		title: message,
		icon: 'none',
		duration: 2000
	})
}

// 业务错误处理
const handleBusinessError = (code, message) => {
	uni.showToast({
		title: message || '操作失败',
		icon: 'none',
		duration: 2000
	})
}

// 网络检查
const checkNetwork = () => {
	return new Promise((resolve, reject) => {
		uni.getNetworkType({
			success: (res) => {
				if (res.networkType === 'none') {
					uni.showToast({
						title: '网络连接失败',
						icon: 'none'
					})
					reject(new Error('网络连接失败'))
				} else {
					resolve(res)
				}
			},
			fail: reject
		})
	})
}

// 基础请求方法
const request = async (options) => {
	try {
		// 检查网络
		await checkNetwork()
		
		// 处理请求配置
		const config = {
			url: options.url.startsWith('http') ? options.url : BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: options.header || {},
			timeout: options.timeout || 10000,
			loading: options.loading,
			loadingText: options.loadingText
		}
		
		// 请求拦截
		const interceptedConfig = requestInterceptor(config)
		
		// 发送请求
		const response = await uni.request(interceptedConfig)
		
		// 响应拦截
		return responseInterceptor(response, config)
		
	} catch (error) {
		// 隐藏加载提示
		if (options.loading !== false) {
			uni.hideLoading()
		}
		
		console.error('请求失败:', error)
		throw error
	}
}

// GET 请求
export const get = (url, params = {}, options = {}) => {
	return request({
		url,
		method: 'GET',
		data: params,
		...options
	})
}

// POST 请求
export const post = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

// PUT 请求
export const put = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

// DELETE 请求
export const del = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}

// 文件上传
export const upload = (url, filePath, options = {}) => {
	return new Promise((resolve, reject) => {
		// 显示加载提示
		if (options.loading !== false) {
			uni.showLoading({
				title: options.loadingText || '上传中...',
				mask: true
			})
		}
		
		const token = uni.getStorageSync('token')
		const header = {
			...options.header
		}
		
		if (token) {
			header['Authorization'] = `Bearer ${token}`
		}
		
		uni.uploadFile({
			url: url.startsWith('http') ? url : BASE_URL + url,
			filePath,
			name: options.name || 'file',
			formData: options.formData || {},
			header,
			success: (res) => {
				// 隐藏加载提示
				if (options.loading !== false) {
					uni.hideLoading()
				}
				
				try {
					const data = JSON.parse(res.data)
					resolve(data)
				} catch (error) {
					resolve(res.data)
				}
			},
			fail: (error) => {
				// 隐藏加载提示
				if (options.loading !== false) {
					uni.hideLoading()
				}
				
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				})
				reject(error)
			}
		})
	})
}

// 导出默认请求实例
export default {
	get,
	post,
	put,
	delete: del,
	upload,
	request
}