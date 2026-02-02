/**
 * 格式化工具单元测试
 */

import { describe, it, expect } from 'vitest'
import {
    formatDate,
    formatMoney,
    formatFileSize,
    formatRelativeTime,
    truncateText,
    formatPhone
} from '@/utils/formatter'

describe('formatDate', () => {
    it('应该正确格式化日期时间', () => {
        const timestamp = new Date('2021-01-01 12:30:45').getTime()
        expect(formatDate(timestamp)).toBe('2021-01-01 12:30:45')
    })

    it('应该支持自定义格式', () => {
        const timestamp = new Date('2021-01-01 12:30:45').getTime()
        expect(formatDate(timestamp, 'YYYY-MM-DD')).toBe('2021-01-01')
        expect(formatDate(timestamp, 'HH:mm:ss')).toBe('12:30:45')
        expect(formatDate(timestamp, 'YYYY/MM/DD HH:mm')).toBe('2021/01/01 12:30')
    })

    it('应该处理无效输入', () => {
        expect(formatDate(0)).toBe('')
        expect(formatDate(-1)).toBe('')
        expect(formatDate(NaN)).toBe('')
    })

    it('应该正确处理月份和日期的前导零', () => {
        const timestamp = new Date('2021-03-05 08:05:03').getTime()
        expect(formatDate(timestamp)).toBe('2021-03-05 08:05:03')
    })
})

describe('formatMoney', () => {
    it('应该正确格式化金额', () => {
        expect(formatMoney(1234.56)).toBe('¥1,234.56')
        expect(formatMoney(1000000)).toBe('¥1,000,000.00')
        expect(formatMoney(0)).toBe('¥0.00')
    })

    it('应该支持自定义货币符号', () => {
        expect(formatMoney(1234.56, { symbol: '$' })).toBe('$1,234.56')
        expect(formatMoney(1234.56, { symbol: '€' })).toBe('€1,234.56')
    })

    it('应该支持自定义小数位数', () => {
        expect(formatMoney(1234.56, { decimals: 0 })).toBe('¥1,235')
        expect(formatMoney(1234.56, { decimals: 1 })).toBe('¥1,234.6')
        expect(formatMoney(1234.567, { decimals: 3 })).toBe('¥1,234.567')
    })

    it('应该支持隐藏货币符号', () => {
        expect(formatMoney(1234.56, { showSymbol: false })).toBe('1,234.56')
    })

    it('应该正确处理负数', () => {
        expect(formatMoney(-1234.56)).toBe('¥-1,234.56')
    })

    it('应该处理无效输入', () => {
        expect(formatMoney(NaN)).toBe('¥0.00')
        expect(formatMoney(NaN, { showSymbol: false })).toBe('0.00')
    })

    it('应该正确添加千分位分隔符', () => {
        expect(formatMoney(1234567.89)).toBe('¥1,234,567.89')
        expect(formatMoney(123)).toBe('¥123.00')
    })
})

describe('formatFileSize', () => {
    it('应该正确格式化字节大小', () => {
        expect(formatFileSize(0)).toBe('0 B')
        expect(formatFileSize(500)).toBe('500.00 B')
        expect(formatFileSize(1024)).toBe('1.00 KB')
        expect(formatFileSize(1048576)).toBe('1.00 MB')
        expect(formatFileSize(1073741824)).toBe('1.00 GB')
        expect(formatFileSize(1099511627776)).toBe('1.00 TB')
    })

    it('应该支持自定义小数位数', () => {
        expect(formatFileSize(1536, 0)).toBe('2 KB')
        expect(formatFileSize(1536, 1)).toBe('1.5 KB')
        expect(formatFileSize(1536, 2)).toBe('1.50 KB')
    })

    it('应该处理无效输入', () => {
        expect(formatFileSize(-1)).toBe('0 B')
        expect(formatFileSize(NaN)).toBe('0 B')
    })

    it('应该正确处理大文件', () => {
        expect(formatFileSize(1536 * 1024)).toBe('1.50 MB')
        expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })
})

describe('formatRelativeTime', () => {
    const now = Date.now()

    it('应该显示"刚刚"对于1分钟内的时间', () => {
        expect(formatRelativeTime(now - 30 * 1000)).toBe('刚刚')
        expect(formatRelativeTime(now - 59 * 1000)).toBe('刚刚')
    })

    it('应该显示分钟数对于1小时内的时间', () => {
        expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe('5分钟前')
        expect(formatRelativeTime(now - 30 * 60 * 1000)).toBe('30分钟前')
    })

    it('应该显示小时数对于24小时内的时间', () => {
        expect(formatRelativeTime(now - 2 * 60 * 60 * 1000)).toBe('2小时前')
        expect(formatRelativeTime(now - 12 * 60 * 60 * 1000)).toBe('12小时前')
    })

    it('应该显示"昨天"对于24-48小时内的时间', () => {
        expect(formatRelativeTime(now - 30 * 60 * 60 * 1000)).toBe('昨天')
    })

    it('应该显示天数对于一周内的时间', () => {
        expect(formatRelativeTime(now - 3 * 24 * 60 * 60 * 1000)).toBe('3天前')
        expect(formatRelativeTime(now - 6 * 24 * 60 * 60 * 1000)).toBe('6天前')
    })

    it('应该显示完整日期对于一周以上的时间', () => {
        const oldTimestamp = now - 10 * 24 * 60 * 60 * 1000
        const result = formatRelativeTime(oldTimestamp)
        expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('应该处理无效输入', () => {
        expect(formatRelativeTime(0)).toBe('')
        expect(formatRelativeTime(-1)).toBe('')
    })

    it('应该处理未来时间', () => {
        const futureTimestamp = now + 60 * 60 * 1000
        const result = formatRelativeTime(futureTimestamp)
        expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    })
})

describe('truncateText', () => {
    it('应该正确截断文本', () => {
        expect(truncateText('这是一段很长的文本', 5)).toBe('这是一段很...')
        expect(truncateText('Hello World', 5)).toBe('Hello...')
    })

    it('应该不截断短文本', () => {
        expect(truncateText('短文本', 10)).toBe('短文本')
        expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('应该支持自定义省略符号', () => {
        expect(truncateText('这是一段很长的文本', 5, '…')).toBe('这是一段很…')
        expect(truncateText('Hello World', 5, '---')).toBe('Hello---')
    })

    it('应该处理无效输入', () => {
        expect(truncateText('', 5)).toBe('')
        expect(truncateText('text', 0)).toBe('')
        expect(truncateText('text', -1)).toBe('')
    })

    it('应该处理边界情况', () => {
        expect(truncateText('12345', 5)).toBe('12345')
        expect(truncateText('123456', 5)).toBe('12345...')
    })
})

describe('formatPhone', () => {
    it('应该正确格式化手机号', () => {
        expect(formatPhone('13812345678')).toBe('138****5678')
        expect(formatPhone('18888888888')).toBe('188****8888')
    })

    it('应该处理带有非数字字符的手机号', () => {
        expect(formatPhone('138-1234-5678')).toBe('138****5678')
        expect(formatPhone('138 1234 5678')).toBe('138****5678')
        expect(formatPhone('+86 138 1234 5678')).toBe('138****5678')
    })

    it('应该处理无效输入', () => {
        expect(formatPhone('')).toBe('')
        expect(formatPhone('123')).toBe('123')
        expect(formatPhone('12345678901234')).toBe('12345678901234')
    })

    it('应该保持非11位数字的原样', () => {
        expect(formatPhone('1234567890')).toBe('1234567890')
        expect(formatPhone('123456789012')).toBe('123456789012')
    })
})
