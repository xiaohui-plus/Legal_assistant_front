/**
 * 通用工具函数
 */

/**
 * 格式化时间
 * @param {Date|string|number} time 时间
 * @param {string} format 格式 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的时间
 */
export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
	const date = new Date(time)
	
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')
	
	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hour)
		.replace('mm', minute)
		.replace('ss', second)
}

/**
 * 相对时间格式化
 * @param {Date|string|number} time 时间
 * @returns {string} 相对时间
 */
export const formatRelativeTime = (time) => {
	const now = new Date()
	const date = new Date(time)
	const diff = now - date
	
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	const week = 7 * day
	const month = 30 * day
	
	if (diff < minute) {
		return '刚刚'
	} else if (diff < hour) {
		return Math.floor(diff / minute) + '分钟前'
	} else if (diff < day) {
		return Math.floor(diff / hour) + '小时前'
	} else if (diff < week) {
		return Math.floor(diff / day) + '天前'
	} else if (diff < month) {
		return Math.floor(diff / week) + '周前'
	} else {
		return formatTime(time, 'YYYY-MM-DD')
	}
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay = 300) => {
	let timer = null
	return function(...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, delay)
	}
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, delay = 300) => {
	let timer = null
	return function(...args) {
		if (!timer) {
			timer = setTimeout(() => {
				func.apply(this, args)
				timer = null
			}, delay)
		}
	}
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
	if (obj === null || typeof obj !== 'object') return obj
	if (obj instanceof Date) return new Date(obj)
	if (obj instanceof Array) return obj.map(item => deepClone(item))
	if (typeof obj === 'object') {
		const clonedObj = {}
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				clonedObj[key] = deepClone(obj[key])
			}
		}
		return clonedObj
	}
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 手机号验证
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
	const reg = /^1[3-9]\d{9}$/
	return reg.test(phone)
}

/**
 * 身份证号验证
 * @param {string} idCard 身份证号
 * @returns {boolean} 是否有效
 */
export const validateIdCard = (idCard) => {
	const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
	return reg.test(idCard)
}

/**
 * 邮箱验证
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
export const validateEmail = (email) => {
	const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return reg.test(email)
}

/**
 * 密码强度验证
 * @param {string} password 密码
 * @returns {object} 验证结果
 */
export const validatePassword = (password) => {
	const result = {
		valid: false,
		strength: 0,
		message: ''
	}
	
	if (!password) {
		result.message = '密码不能为空'
		return result
	}
	
	if (password.length < 6) {
		result.message = '密码长度至少6位'
		return result
	}
	
	if (password.length > 20) {
		result.message = '密码长度不能超过20位'
		return result
	}
	
	// 计算密码强度
	let strength = 0
	if (/[a-z]/.test(password)) strength++
	if (/[A-Z]/.test(password)) strength++
	if (/\d/.test(password)) strength++
	if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
	
	result.strength = strength
	result.valid = strength >= 2
	
	if (strength < 2) {
		result.message = '密码强度太弱，请包含字母和数字'
	} else if (strength === 2) {
		result.message = '密码强度一般'
	} else if (strength === 3) {
		result.message = '密码强度良好'
	} else {
		result.message = '密码强度很强'
	}
	
	return result
}

/**
 * 数字转中文大写
 * @param {number} num 数字
 * @returns {string} 中文大写
 */
export const numberToChinese = (num) => {
	const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
	const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
	
	if (num === 0) return '零'
	
	let result = ''
	let numStr = num.toString()
	let len = numStr.length
	
	for (let i = 0; i < len; i++) {
		let digit = parseInt(numStr[i])
		let unit = units[len - i - 1]
		
		if (digit !== 0) {
			result += digits[digit] + unit
		} else if (result && !result.endsWith('零')) {
			result += '零'
		}
	}
	
	// 处理特殊情况
	result = result.replace(/零+/g, '零')
	result = result.replace(/零$/, '')
	
	return result
}

/**
 * 金额转中文大写
 * @param {number} amount 金额
 * @returns {string} 中文大写金额
 */
export const amountToChinese = (amount) => {
	const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
	const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
	
	if (amount === 0) return '零元整'
	
	// 分离整数和小数部分
	const parts = amount.toFixed(2).split('.')
	const integerPart = parseInt(parts[0])
	const decimalPart = parts[1]
	
	let result = ''
	
	// 处理整数部分
	if (integerPart > 0) {
		result += numberToChinese(integerPart) + '元'
	}
	
	// 处理小数部分
	const jiao = parseInt(decimalPart[0])
	const fen = parseInt(decimalPart[1])
	
	if (jiao > 0) {
		result += digits[jiao] + '角'
	}
	
	if (fen > 0) {
		result += digits[fen] + '分'
	}
	
	if (jiao === 0 && fen === 0) {
		result += '整'
	}
	
	return result
}

/**
 * 文件大小格式化
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的大小
 */
export const formatFileSize = (size) => {
	if (size === 0) return '0 B'
	
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	const k = 1024
	const i = Math.floor(Math.log(size) / Math.log(k))
	
	return (size / Math.pow(k, i)).toFixed(2) + ' ' + units[i]
}

/**
 * URL参数解析
 * @param {string} url URL地址
 * @returns {object} 参数对象
 */
export const parseUrlParams = (url) => {
	const params = {}
	const queryString = url.split('?')[1]
	
	if (queryString) {
		queryString.split('&').forEach(param => {
			const [key, value] = param.split('=')
			params[decodeURIComponent(key)] = decodeURIComponent(value || '')
		})
	}
	
	return params
}

/**
 * 对象转URL参数
 * @param {object} params 参数对象
 * @returns {string} URL参数字符串
 */
export const objectToUrlParams = (params) => {
	return Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join('&')
}

/**
 * 获取系统信息
 * @returns {Promise<object>} 系统信息
 */
export const getSystemInfo = () => {
	return new Promise((resolve) => {
		uni.getSystemInfo({
			success: resolve,
			fail: () => resolve({})
		})
	})
}

/**
 * 复制到剪贴板
 * @param {string} text 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export const copyToClipboard = (text) => {
	return new Promise((resolve) => {
		uni.setClipboardData({
			data: text,
			success: () => {
				uni.showToast({
					title: '复制成功',
					icon: 'success'
				})
				resolve(true)
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				})
				resolve(false)
			}
		})
	})
}

/**
 * 震动反馈
 * @param {string} type 震动类型 short|medium|long
 */
export const vibrate = (type = 'short') => {
	if (type === 'short') {
		uni.vibrateShort()
	} else if (type === 'long') {
		uni.vibrateLong()
	}
}

/**
 * 显示确认对话框
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns {Promise<boolean>} 用户选择结果
 */
export const showConfirm = (title, content) => {
	return new Promise((resolve) => {
		uni.showModal({
			title,
			content,
			success: (res) => {
				resolve(res.confirm)
			},
			fail: () => {
				resolve(false)
			}
		})
	})
}

/**
 * 显示操作菜单
 * @param {Array<string>} itemList 菜单项列表
 * @returns {Promise<number>} 选择的索引
 */
export const showActionSheet = (itemList) => {
	return new Promise((resolve, reject) => {
		uni.showActionSheet({
			itemList,
			success: (res) => {
				resolve(res.tapIndex)
			},
			fail: reject
		})
	})
}