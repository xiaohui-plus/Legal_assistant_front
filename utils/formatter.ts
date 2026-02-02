/**
 * 格式化工具
 * 提供日期、金额、文件大小等常用格式化功能
 */

/**
 * 格式化日期
 * @param timestamp 时间戳（毫秒）
 * @param format 格式字符串，支持 YYYY-MM-DD HH:mm:ss 等格式
 * @returns 格式化后的日期字符串
 * 
 * @example
 * formatDate(1609459200000) // '2021-01-01 00:00:00'
 * formatDate(1609459200000, 'YYYY-MM-DD') // '2021-01-01'
 * formatDate(1609459200000, 'HH:mm') // '00:00'
 */
export const formatDate = (timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
    if (!timestamp || timestamp <= 0) {
        return ''
    }

    const date = new Date(timestamp)

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 格式化金额
 * @param amount 金额数字
 * @param options 格式化选项
 * @returns 格式化后的金额字符串
 * 
 * @example
 * formatMoney(1234.56) // '¥1,234.56'
 * formatMoney(1234.56, { symbol: '$' }) // '$1,234.56'
 * formatMoney(1234.56, { decimals: 0 }) // '¥1,235'
 * formatMoney(1234.56, { showSymbol: false }) // '1,234.56'
 */
export const formatMoney = (
    amount: number,
    options: {
        symbol?: string
        decimals?: number
        showSymbol?: boolean
    } = {}
): string => {
    const {
        symbol = '¥',
        decimals = 2,
        showSymbol = true
    } = options

    // 处理无效输入
    if (typeof amount !== 'number' || isNaN(amount)) {
        return showSymbol ? `${symbol}0.00` : '0.00'
    }

    // 四舍五入到指定小数位
    const rounded = Number(amount.toFixed(decimals))

    // 分离整数和小数部分
    const parts = Math.abs(rounded).toFixed(decimals).split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]

    // 添加千分位分隔符
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // 组合结果
    let result = decimals > 0 ? `${formattedInteger}.${decimalPart}` : formattedInteger

    // 添加负号
    if (rounded < 0) {
        result = `-${result}`
    }

    // 添加货币符号
    if (showSymbol) {
        result = `${symbol}${result}`
    }

    return result
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的文件大小字符串
 * 
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824) // '1.00 GB'
 * formatFileSize(1024, 0) // '1 KB'
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    // 处理无效输入
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
        return '0 B'
    }

    if (bytes === 0) {
        return '0 B'
    }

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    // 确保索引不超出范围
    const sizeIndex = Math.min(i, sizes.length - 1)
    const value = bytes / Math.pow(k, sizeIndex)

    return `${value.toFixed(decimals)} ${sizes[sizeIndex]}`
}

/**
 * 格式化相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串（如"刚刚"、"5分钟前"、"昨天"等）
 * 
 * @example
 * formatRelativeTime(Date.now() - 30000) // '刚刚'
 * formatRelativeTime(Date.now() - 300000) // '5分钟前'
 * formatRelativeTime(Date.now() - 86400000) // '昨天'
 */
export const formatRelativeTime = (timestamp: number): string => {
    if (!timestamp || timestamp <= 0) {
        return ''
    }

    const now = Date.now()
    const diff = now - timestamp

    // 无效时间戳
    if (diff < 0) {
        return formatDate(timestamp, 'YYYY-MM-DD HH:mm')
    }

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day

    if (diff < minute) {
        return '刚刚'
    } else if (diff < hour) {
        const minutes = Math.floor(diff / minute)
        return `${minutes}分钟前`
    } else if (diff < day) {
        const hours = Math.floor(diff / hour)
        return `${hours}小时前`
    } else if (diff < 2 * day) {
        return '昨天'
    } else if (diff < week) {
        const days = Math.floor(diff / day)
        return `${days}天前`
    } else {
        return formatDate(timestamp, 'YYYY-MM-DD')
    }
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param ellipsis 省略符号，默认为 '...'
 * @returns 截断后的文本
 * 
 * @example
 * truncateText('这是一段很长的文本', 5) // '这是一段很...'
 * truncateText('短文本', 10) // '短文本'
 */
export const truncateText = (text: string, maxLength: number, ellipsis: string = '...'): string => {
    if (!text || typeof text !== 'string') {
        return ''
    }

    if (maxLength <= 0) {
        return ''
    }

    if (text.length <= maxLength) {
        return text
    }

    return text.slice(0, maxLength) + ellipsis
}

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 * @returns 格式化后的手机号
 * 
 * @example
 * formatPhone('13812345678') // '138****5678'
 */
export const formatPhone = (phone: string): string => {
    if (!phone || typeof phone !== 'string') {
        return ''
    }

    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, '')

    // 如果包含国家代码（如+86），移除前面的86
    let phoneNumber = cleaned
    if (cleaned.length === 13 && cleaned.startsWith('86')) {
        phoneNumber = cleaned.slice(2)
    }

    // 检查是否是有效的手机号（11位）
    if (phoneNumber.length !== 11) {
        return phone
    }

    return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
