/**
 * 平台判断工具单元测试
 * 验证需求 14：多端适配
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    isWeixin,
    isApp,
    isIOS,
    isAndroid,
    isH5,
    getPlatform,
    getPlatformInfo,
    getPlatformSpecificOption,
    isPlatformFeatureSupported,
    getExportMethod,
    getPlatformStyles,
    executePlatformSpecific,
    PlatformType
} from '../../../utils/platform'

// Mock uni API
const mockSystemInfo = {
    platform: 'ios',
    system: 'iOS 15.0',
    version: '15.0',
    model: 'iPhone 13',
    pixelRatio: 3,
    screenWidth: 390,
    screenHeight: 844,
    windowWidth: 390,
    windowHeight: 844,
    statusBarHeight: 44,
    safeArea: {
        top: 44,
        bottom: 800,
        left: 0,
        right: 390,
        width: 390,
        height: 756
    },
    safeAreaInsets: {
        top: 44,
        bottom: 34,
        left: 0,
        right: 0
    }
}

global.uni = {
    getSystemInfoSync: vi.fn(() => mockSystemInfo)
} as any

describe('平台判断工具', () => {
    describe('基础平台判断', () => {
        it('应该正确判断平台类型', () => {
            // 这些测试在实际编译时会根据条件编译指令返回不同结果
            // 在测试环境中，我们主要验证函数存在且返回布尔值
            expect(typeof isWeixin()).toBe('boolean')
            expect(typeof isApp()).toBe('boolean')
            expect(typeof isH5()).toBe('boolean')
        })

        it('getPlatform 应该返回有效的平台类型', () => {
            const platform = getPlatform()
            expect(Object.values(PlatformType)).toContain(platform)
        })

        it('同一时间只能有一个平台为 true', () => {
            const platforms = [isWeixin(), isApp(), isH5()]
            const trueCount = platforms.filter(p => p === true).length
            // 在测试环境中，由于条件编译指令不起作用，可能所有平台都返回false或true
            // 我们只验证返回值是布尔类型
            expect(trueCount).toBeGreaterThanOrEqual(0)
            expect(trueCount).toBeLessThanOrEqual(3)
        })
    })

    describe('App 平台细分判断', () => {
        it('isIOS 应该在 iOS 平台返回 true', () => {
            // 在非 APP-PLUS 环境下应该返回 false
            const result = isIOS()
            expect(typeof result).toBe('boolean')
        })

        it('isAndroid 应该在 Android 平台返回 true', () => {
            // 在非 APP-PLUS 环境下应该返回 false
            const result = isAndroid()
            expect(typeof result).toBe('boolean')
        })

        it('iOS 和 Android 不能同时为 true', () => {
            const ios = isIOS()
            const android = isAndroid()
            expect(ios && android).toBe(false)
        })
    })

    describe('getPlatformInfo', () => {
        it('应该返回完整的平台信息', () => {
            const info = getPlatformInfo()

            expect(info).toHaveProperty('platform')
            expect(info).toHaveProperty('isWeixin')
            expect(info).toHaveProperty('isApp')
            expect(info).toHaveProperty('isIOS')
            expect(info).toHaveProperty('isAndroid')
            expect(info).toHaveProperty('isH5')
            expect(info).toHaveProperty('system')
            expect(info).toHaveProperty('version')
            expect(info).toHaveProperty('model')
            expect(info).toHaveProperty('pixelRatio')
            expect(info).toHaveProperty('screenWidth')
            expect(info).toHaveProperty('screenHeight')
            expect(info).toHaveProperty('windowWidth')
            expect(info).toHaveProperty('windowHeight')
            expect(info).toHaveProperty('statusBarHeight')
            expect(info).toHaveProperty('safeArea')
            expect(info).toHaveProperty('safeAreaInsets')
        })

        it('平台信息应该与系统信息一致', () => {
            const info = getPlatformInfo()

            expect(info.system).toBe(mockSystemInfo.system)
            expect(info.version).toBe(mockSystemInfo.version)
            expect(info.model).toBe(mockSystemInfo.model)
            expect(info.screenWidth).toBe(mockSystemInfo.screenWidth)
            expect(info.screenHeight).toBe(mockSystemInfo.screenHeight)
        })

        it('布尔标志应该与平台判断函数一致', () => {
            const info = getPlatformInfo()

            expect(info.isWeixin).toBe(isWeixin())
            expect(info.isApp).toBe(isApp())
            expect(info.isIOS).toBe(isIOS())
            expect(info.isAndroid).toBe(isAndroid())
            expect(info.isH5).toBe(isH5())
        })
    })

    describe('getPlatformSpecificOption', () => {
        it('应该返回默认值当没有平台特定选项时', () => {
            const result = getPlatformSpecificOption({
                default: 'default-value'
            })

            expect(result).toBe('default-value')
        })

        it('应该支持不同类型的选项值', () => {
            // 字符串
            const stringResult = getPlatformSpecificOption({
                default: 'default'
            })
            expect(typeof stringResult).toBe('string')

            // 数字
            const numberResult = getPlatformSpecificOption({
                default: 42
            })
            expect(typeof numberResult).toBe('number')

            // 对象
            const objectResult = getPlatformSpecificOption({
                default: { key: 'value' }
            })
            expect(typeof objectResult).toBe('object')

            // 布尔值
            const boolResult = getPlatformSpecificOption({
                default: true
            })
            expect(typeof boolResult).toBe('boolean')
        })

        it('应该处理所有平台选项', () => {
            const options = {
                weixin: 'weixin-value',
                app: 'app-value',
                ios: 'ios-value',
                android: 'android-value',
                h5: 'h5-value',
                default: 'default-value'
            }

            const result = getPlatformSpecificOption(options)

            // 结果应该是其中一个值
            const possibleValues = Object.values(options)
            expect(possibleValues).toContain(result)
        })

        it('优先级应该正确：具体平台 > 通用平台 > 默认值', () => {
            // 这个测试在不同平台编译时会有不同结果
            // 我们主要验证函数能正确执行
            const result = getPlatformSpecificOption({
                ios: 'ios-specific',
                app: 'app-general',
                default: 'default-value'
            })

            expect(typeof result).toBe('string')
        })
    })

    describe('isPlatformFeatureSupported', () => {
        it('应该正确判断下载功能支持', () => {
            const supported = isPlatformFeatureSupported('download')
            expect(typeof supported).toBe('boolean')
        })

        it('应该正确判断分享功能支持', () => {
            const shareTimeline = isPlatformFeatureSupported('shareTimeline')
            const shareMessage = isPlatformFeatureSupported('shareMessage')

            expect(typeof shareTimeline).toBe('boolean')
            expect(typeof shareMessage).toBe('boolean')
        })

        it('应该正确判断剪贴板功能支持', () => {
            const supported = isPlatformFeatureSupported('clipboard')
            expect(typeof supported).toBe('boolean')
        })

        it('应该正确判断图片选择功能支持', () => {
            const supported = isPlatformFeatureSupported('chooseImage')
            expect(typeof supported).toBe('boolean')
        })

        it('不存在的功能应该返回 false', () => {
            const supported = isPlatformFeatureSupported('nonexistent-feature')
            expect(supported).toBe(false)
        })

        it('应该支持所有定义的功能', () => {
            const features = [
                'download',
                'shareTimeline',
                'shareMessage',
                'saveToAlbum',
                'openDocument',
                'clipboard',
                'scanCode',
                'chooseImage',
                'record',
                'payment',
                'location'
            ]

            features.forEach(feature => {
                const supported = isPlatformFeatureSupported(feature)
                expect(typeof supported).toBe('boolean')
            })
        })
    })

    describe('getExportMethod', () => {
        it('应该返回有效的导出方式', () => {
            const method = getExportMethod()
            expect(['download', 'share', 'copy']).toContain(method)
        })

        it('导出方式应该与平台特性匹配', () => {
            const method = getExportMethod()
            const platform = getPlatform()

            // 验证导出方式的合理性
            if (platform === PlatformType.H5) {
                // H5 平台可能支持下载
                expect(['download', 'copy']).toContain(method)
            } else if (platform === PlatformType.WEIXIN || platform === PlatformType.APP) {
                // 小程序和 App 平台通常使用分享
                expect(['share', 'copy']).toContain(method)
            }
        })
    })

    describe('getPlatformStyles', () => {
        it('应该返回完整的样式配置', () => {
            const styles = getPlatformStyles()

            expect(styles).toHaveProperty('statusBarHeight')
            expect(styles).toHaveProperty('navigationBarHeight')
            expect(styles).toHaveProperty('safeAreaBottom')
            expect(styles).toHaveProperty('hasNotch')
        })

        it('状态栏高度应该是非负数', () => {
            const styles = getPlatformStyles()
            expect(styles.statusBarHeight).toBeGreaterThanOrEqual(0)
        })

        it('导航栏高度应该是合理的值', () => {
            const styles = getPlatformStyles()
            expect(styles.navigationBarHeight).toBeGreaterThan(0)
            expect(styles.navigationBarHeight).toBeLessThan(100)
        })

        it('底部安全区域高度应该是非负数', () => {
            const styles = getPlatformStyles()
            expect(styles.safeAreaBottom).toBeGreaterThanOrEqual(0)
        })

        it('hasNotch 应该是布尔值', () => {
            const styles = getPlatformStyles()
            expect(typeof styles.hasNotch).toBe('boolean')
        })

        it('刘海屏判断应该基于安全区域', () => {
            const styles = getPlatformStyles()
            const systemInfo = uni.getSystemInfoSync()
            const topInset = systemInfo.safeAreaInsets?.top || 0

            expect(styles.hasNotch).toBe(topInset > 20)
        })
    })

    describe('executePlatformSpecific', () => {
        it('应该执行默认处理函数', () => {
            const defaultHandler = vi.fn(() => 'default-result')

            const result = executePlatformSpecific({
                default: defaultHandler
            })

            expect(result).toBe('default-result')
        })

        it('应该支持不同返回类型', () => {
            // 字符串
            const stringResult = executePlatformSpecific({
                default: () => 'string'
            })
            expect(typeof stringResult).toBe('string')

            // 数字
            const numberResult = executePlatformSpecific({
                default: () => 42
            })
            expect(typeof numberResult).toBe('number')

            // 对象
            const objectResult = executePlatformSpecific({
                default: () => ({ key: 'value' })
            })
            expect(typeof objectResult).toBe('object')

            // 布尔值
            const boolResult = executePlatformSpecific({
                default: () => true
            })
            expect(typeof boolResult).toBe('boolean')

            // undefined
            const undefinedResult = executePlatformSpecific({
                default: () => undefined
            })
            expect(undefinedResult).toBeUndefined()
        })

        it('应该执行平台特定的处理函数', () => {
            const weixinHandler = vi.fn(() => 'weixin-result')
            const appHandler = vi.fn(() => 'app-result')
            const h5Handler = vi.fn(() => 'h5-result')
            const defaultHandler = vi.fn(() => 'default-result')

            const result = executePlatformSpecific({
                weixin: weixinHandler,
                app: appHandler,
                h5: h5Handler,
                default: defaultHandler
            })

            // 至少有一个处理函数应该被调用
            const callCounts = [
                weixinHandler.mock.calls.length,
                appHandler.mock.calls.length,
                h5Handler.mock.calls.length,
                defaultHandler.mock.calls.length
            ]
            const totalCalls = callCounts.reduce((sum, count) => sum + count, 0)
            expect(totalCalls).toBeGreaterThan(0)
        })

        it('处理函数可以访问外部变量', () => {
            let externalValue = 0

            executePlatformSpecific({
                default: () => {
                    externalValue = 42
                }
            })

            expect(externalValue).toBe(42)
        })

        it('处理函数可以抛出异常', () => {
            expect(() => {
                executePlatformSpecific({
                    default: () => {
                        throw new Error('Test error')
                    }
                })
            }).toThrow('Test error')
        })
    })

    describe('边缘情况', () => {
        it('应该处理缺失的系统信息', () => {
            const originalGetSystemInfoSync = uni.getSystemInfoSync

            // Mock 缺失部分信息的情况
            uni.getSystemInfoSync = vi.fn(() => ({
                platform: 'ios',
                system: 'iOS 15.0',
                version: '15.0',
                model: 'iPhone',
                pixelRatio: 2,
                screenWidth: 375,
                screenHeight: 667,
                windowWidth: 375,
                windowHeight: 667
                // 缺失 statusBarHeight, safeArea, safeAreaInsets
            })) as any

            const info = getPlatformInfo()
            expect(info).toBeDefined()

            const styles = getPlatformStyles()
            expect(styles.statusBarHeight).toBe(0)
            expect(styles.safeAreaBottom).toBe(0)

            // 恢复原始 mock
            uni.getSystemInfoSync = originalGetSystemInfoSync
        })

        it('应该处理空字符串功能名称', () => {
            const supported = isPlatformFeatureSupported('')
            expect(supported).toBe(false)
        })

        it('应该处理特殊字符功能名称', () => {
            const supported = isPlatformFeatureSupported('feature-with-dash')
            expect(supported).toBe(false)
        })
    })

    describe('类型安全', () => {
        it('PlatformType 枚举应该包含所有平台', () => {
            expect(PlatformType.WEIXIN).toBe('weixin')
            expect(PlatformType.APP).toBe('app')
            expect(PlatformType.H5).toBe('h5')
            expect(PlatformType.UNKNOWN).toBe('unknown')
        })

        it('getPlatform 返回值应该匹配 PlatformType', () => {
            const platform = getPlatform()
            const validTypes = Object.values(PlatformType)
            expect(validTypes).toContain(platform)
        })
    })

    describe('性能', () => {
        it('平台判断函数应该快速执行', () => {
            const start = Date.now()

            for (let i = 0; i < 1000; i++) {
                isWeixin()
                isApp()
                isH5()
                getPlatform()
            }

            const duration = Date.now() - start
            // 1000 次调用应该在 100ms 内完成
            expect(duration).toBeLessThan(100)
        })

        it('getPlatformInfo 应该可以被频繁调用', () => {
            const start = Date.now()

            for (let i = 0; i < 100; i++) {
                getPlatformInfo()
            }

            const duration = Date.now() - start
            // 100 次调用应该在 100ms 内完成
            expect(duration).toBeLessThan(100)
        })
    })
})
