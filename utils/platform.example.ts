/**
 * 平台判断工具使用示例
 * 验证需求 14：多端适配
 */

import {
    isWeixin,
    isApp,
    isH5,
    isIOS,
    isAndroid,
    getPlatform,
    getPlatformInfo,
    getPlatformSpecificOption,
    isPlatformFeatureSupported,
    getExportMethod,
    getPlatformStyles,
    executePlatformSpecific,
    PlatformType
} from './platform'

/**
 * 示例 1：基础平台判断
 */
export function example1_BasicPlatformDetection() {
    console.log('=== 示例 1：基础平台判断 ===')

    console.log('是否为微信小程序:', isWeixin())
    console.log('是否为 App:', isApp())
    console.log('是否为 H5:', isH5())
    console.log('是否为 iOS:', isIOS())
    console.log('是否为 Android:', isAndroid())
    console.log('当前平台:', getPlatform())
}

/**
 * 示例 2：获取详细平台信息
 */
export function example2_GetPlatformInfo() {
    console.log('=== 示例 2：获取详细平台信息 ===')

    const info = getPlatformInfo()
    console.log('平台信息:', JSON.stringify(info, null, 2))
}

/**
 * 示例 3：平台特定配置
 */
export function example3_PlatformSpecificConfig() {
    console.log('=== 示例 3：平台特定配置 ===')

    // 获取平台特定的按钮文字
    const buttonText = getPlatformSpecificOption({
        weixin: '分享给好友',
        app: '分享',
        h5: '下载',
        default: '导出'
    })
    console.log('按钮文字:', buttonText)

    // 获取平台特定的样式
    const buttonStyle = getPlatformSpecificOption({
        ios: { padding: 20, fontSize: 16, borderRadius: 10 },
        android: { padding: 16, fontSize: 14, borderRadius: 8 },
        h5: { padding: 18, fontSize: 15, borderRadius: 6 },
        default: { padding: 16, fontSize: 14, borderRadius: 4 }
    })
    console.log('按钮样式:', buttonStyle)

    // 获取平台特定的 API 端点
    const apiEndpoint = getPlatformSpecificOption({
        weixin: 'https://api.example.com/weixin',
        app: 'https://api.example.com/app',
        h5: 'https://api.example.com/h5',
        default: 'https://api.example.com'
    })
    console.log('API 端点:', apiEndpoint)
}

/**
 * 示例 4：功能支持检测
 */
export function example4_FeatureDetection() {
    console.log('=== 示例 4：功能支持检测 ===')

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
        console.log(`${feature}: ${supported ? '✓ 支持' : '✗ 不支持'}`)
    })
}

/**
 * 示例 5：文书导出功能
 */
export async function example5_DocumentExport(content: string, title: string) {
    console.log('=== 示例 5：文书导出功能 ===')

    const exportMethod = getExportMethod()
    console.log('导出方式:', exportMethod)

    return executePlatformSpecific({
        weixin: async () => {
            console.log('微信小程序：使用分享功能')
            // 微信小程序分享
            return uni.shareAppMessage({
                title: title,
                path: '/pages/document/preview',
                imageUrl: '/static/share-image.png'
            })
        },
        app: async () => {
            console.log('App：保存到本地并分享')
            // App 保存到本地
            const filePath = `${uni.env.USER_DATA_PATH}/${title}.txt`
            await uni.getFileSystemManager().writeFile({
                filePath,
                data: content,
                encoding: 'utf8'
            })
            // 分享文件
            return uni.share({
                provider: 'weixin',
                type: 0,
                title: title,
                href: filePath
            })
        },
        h5: async () => {
            console.log('H5：下载文件')
            // H5 下载文件
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${title}.txt`
            link.click()
            URL.revokeObjectURL(url)
            return Promise.resolve()
        },
        default: async () => {
            console.log('默认：复制到剪贴板')
            // 默认复制到剪贴板
            await uni.setClipboardData({
                data: content
            })
            uni.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
            })
            return Promise.resolve()
        }
    })
}

/**
 * 示例 6：图片上传功能
 */
export async function example6_ImageUpload() {
    console.log('=== 示例 6：图片上传功能 ===')

    // 检查是否支持图片选择
    if (!isPlatformFeatureSupported('chooseImage')) {
        uni.showToast({
            title: '当前平台不支持图片上传',
            icon: 'none'
        })
        return
    }

    return executePlatformSpecific({
        weixin: async () => {
            console.log('微信小程序：使用 wx.chooseImage')
            const res = await uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera']
            })
            return res.tempFilePaths[0]
        },
        app: async () => {
            console.log('App：使用 plus.gallery')
            const res = await uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera']
            })
            return res.tempFilePaths[0]
        },
        h5: async () => {
            console.log('H5：使用 input[type=file]')
            return new Promise((resolve, reject) => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e: any) => {
                    const file = e.target.files[0]
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            resolve(e.target?.result as string)
                        }
                        reader.onerror = reject
                        reader.readAsDataURL(file)
                    } else {
                        reject(new Error('未选择文件'))
                    }
                }
                input.click()
            })
        },
        default: async () => {
            throw new Error('当前平台不支持图片上传')
        }
    })
}

/**
 * 示例 7：页面样式适配
 */
export function example7_StyleAdaptation() {
    console.log('=== 示例 7：页面样式适配 ===')

    const styles = getPlatformStyles()
    console.log('样式配置:', styles)

    // 计算页面容器样式
    const pageStyle = {
        paddingTop: `${styles.statusBarHeight}px`,
        paddingBottom: `${styles.safeAreaBottom}px`
    }
    console.log('页面样式:', pageStyle)

    // 计算导航栏样式
    const navBarStyle = {
        height: `${styles.navigationBarHeight}px`,
        paddingTop: `${styles.statusBarHeight}px`,
        totalHeight: `${styles.statusBarHeight + styles.navigationBarHeight}px`
    }
    console.log('导航栏样式:', navBarStyle)

    // 判断是否需要适配刘海屏
    if (styles.hasNotch) {
        console.log('检测到刘海屏，需要特殊适配')
    }

    return {
        pageStyle,
        navBarStyle,
        hasNotch: styles.hasNotch
    }
}

/**
 * 示例 8：支付功能
 */
export async function example8_Payment(amount: number, orderId: string) {
    console.log('=== 示例 8：支付功能 ===')

    // 检查是否支持支付
    if (!isPlatformFeatureSupported('payment')) {
        uni.showToast({
            title: '当前平台不支持支付',
            icon: 'none'
        })
        return
    }

    return executePlatformSpecific({
        weixin: async () => {
            console.log('微信小程序：使用微信支付')
            // 调用后端获取支付参数
            const paymentParams = await getWeixinPaymentParams(orderId, amount)
            // 发起微信支付
            return uni.requestPayment({
                provider: 'wxpay',
                ...paymentParams
            })
        },
        app: async () => {
            console.log('App：使用原生支付')
            const platform = isIOS() ? 'applePay' : 'alipay'
            console.log('支付平台:', platform)
            // 调用后端获取支付参数
            const paymentParams = await getAppPaymentParams(orderId, amount, platform)
            // 发起支付
            return uni.requestPayment({
                provider: platform,
                ...paymentParams
            })
        },
        default: async () => {
            throw new Error('当前平台不支持支付')
        }
    })
}

/**
 * 示例 9：扫码功能
 */
export async function example9_ScanCode() {
    console.log('=== 示例 9：扫码功能 ===')

    // 检查是否支持扫码
    if (!isPlatformFeatureSupported('scanCode')) {
        uni.showToast({
            title: '当前平台不支持扫码',
            icon: 'none'
        })
        return
    }

    return executePlatformSpecific({
        weixin: async () => {
            console.log('微信小程序：使用 wx.scanCode')
            const res = await uni.scanCode({
                onlyFromCamera: false,
                scanType: ['qrCode', 'barCode']
            })
            return res.result
        },
        app: async () => {
            console.log('App：使用原生扫码')
            const res = await uni.scanCode({
                onlyFromCamera: false,
                scanType: ['qrCode', 'barCode']
            })
            return res.result
        },
        default: async () => {
            throw new Error('当前平台不支持扫码')
        }
    })
}

/**
 * 示例 10：位置获取
 */
export async function example10_GetLocation() {
    console.log('=== 示例 10：位置获取 ===')

    // 检查是否支持位置获取
    if (!isPlatformFeatureSupported('location')) {
        uni.showToast({
            title: '当前平台不支持位置获取',
            icon: 'none'
        })
        return
    }

    return executePlatformSpecific({
        weixin: async () => {
            console.log('微信小程序：使用 wx.getLocation')
            const res = await uni.getLocation({
                type: 'gcj02'
            })
            return {
                latitude: res.latitude,
                longitude: res.longitude,
                address: await getAddressFromCoords(res.latitude, res.longitude)
            }
        },
        app: async () => {
            console.log('App：使用原生定位')
            const res = await uni.getLocation({
                type: 'gcj02'
            })
            return {
                latitude: res.latitude,
                longitude: res.longitude,
                address: await getAddressFromCoords(res.latitude, res.longitude)
            }
        },
        h5: async () => {
            console.log('H5：使用浏览器定位 API')
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('浏览器不支持定位'))
                    return
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords
                        resolve({
                            latitude,
                            longitude,
                            address: await getAddressFromCoords(latitude, longitude)
                        })
                    },
                    (error) => {
                        reject(new Error(`定位失败: ${error.message}`))
                    }
                )
            })
        },
        default: async () => {
            throw new Error('当前平台不支持位置获取')
        }
    })
}

// 辅助函数（模拟）
async function getWeixinPaymentParams(orderId: string, amount: number) {
    // 实际应该调用后端 API
    return {
        timeStamp: Date.now().toString(),
        nonceStr: 'random-string',
        package: 'prepay_id=xxx',
        signType: 'MD5',
        paySign: 'signature'
    }
}

async function getAppPaymentParams(orderId: string, amount: number, platform: string) {
    // 实际应该调用后端 API
    return {
        orderInfo: 'order-info',
        sign: 'signature'
    }
}

async function getAddressFromCoords(latitude: number, longitude: number) {
    // 实际应该调用地理编码 API
    return '北京市朝阳区'
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
    console.log('========================================')
    console.log('平台判断工具使用示例')
    console.log('========================================\n')

    example1_BasicPlatformDetection()
    console.log('\n')

    example2_GetPlatformInfo()
    console.log('\n')

    example3_PlatformSpecificConfig()
    console.log('\n')

    example4_FeatureDetection()
    console.log('\n')

    example7_StyleAdaptation()
    console.log('\n')

    console.log('========================================')
    console.log('示例运行完成')
    console.log('========================================')
}
