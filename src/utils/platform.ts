/**
 * 平台判断工具
 * 验证需求 14：多端适配
 * 
 * 提供跨平台判断和平台特定功能适配
 */

/**
 * 平台类型枚举
 */
export enum PlatformType {
    WEIXIN = 'weixin',
    APP = 'app',
    H5 = 'h5',
    UNKNOWN = 'unknown'
}

/**
 * 判断是否为微信小程序
 * 验证需求 14.1
 */
export const isWeixin = (): boolean => {
    // #ifdef MP-WEIXIN
    return true
    // #endif
    // #ifndef MP-WEIXIN
    return false
    // #endif
}

/**
 * 判断是否为 App
 * 验证需求 14.2
 */
export const isApp = (): boolean => {
    // #ifdef APP-PLUS
    return true
    // #endif
    // #ifndef APP-PLUS
    return false
    // #endif
}

/**
 * 判断是否为 iOS App
 * 验证需求 14.2
 */
export const isIOS = (): boolean => {
    // #ifdef APP-PLUS
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.platform === 'ios'
    // #endif
    // #ifndef APP-PLUS
    return false
    // #endif
}

/**
 * 判断是否为 Android App
 * 验证需求 14.2
 */
export const isAndroid = (): boolean => {
    // #ifdef APP-PLUS
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.platform === 'android'
    // #endif
    // #ifndef APP-PLUS
    return false
    // #endif
}

/**
 * 判断是否为 H5
 * 验证需求 14.3
 */
export const isH5 = (): boolean => {
    // #ifdef H5
    return true
    // #endif
    // #ifndef H5
    return false
    // #endif
}

/**
 * 获取当前平台名称
 * 验证需求 14.1, 14.2, 14.3
 */
export const getPlatform = (): PlatformType => {
    if (isWeixin()) return PlatformType.WEIXIN
    if (isApp()) return PlatformType.APP
    if (isH5()) return PlatformType.H5
    return PlatformType.UNKNOWN
}

/**
 * 获取详细的平台信息
 * 验证需求 14.4
 */
export const getPlatformInfo = () => {
    const platform = getPlatform()
    const systemInfo = uni.getSystemInfoSync()

    return {
        platform,
        isWeixin: isWeixin(),
        isApp: isApp(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isH5: isH5(),
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model,
        pixelRatio: systemInfo.pixelRatio,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight,
        statusBarHeight: systemInfo.statusBarHeight,
        safeArea: systemInfo.safeArea,
        safeAreaInsets: systemInfo.safeAreaInsets
    }
}

/**
 * 根据平台调整交互方式
 * 验证需求 14.4
 * 
 * @param options 平台特定选项
 * @returns 当前平台适用的选项
 */
export const getPlatformSpecificOption = <T>(options: {
    weixin?: T
    app?: T
    ios?: T
    android?: T
    h5?: T
    default: T
}): T => {
    // 优先级：具体平台 > 通用平台 > 默认值
    if (isIOS() && options.ios !== undefined) {
        return options.ios
    }
    if (isAndroid() && options.android !== undefined) {
        return options.android
    }
    if (isWeixin() && options.weixin !== undefined) {
        return options.weixin
    }
    if (isApp() && options.app !== undefined) {
        return options.app
    }
    if (isH5() && options.h5 !== undefined) {
        return options.h5
    }
    return options.default
}

/**
 * 检查平台是否支持某个功能
 * 验证需求 14.4
 */
export const isPlatformFeatureSupported = (feature: string): boolean => {
    const platform = getPlatform()

    // 定义各平台支持的功能
    const featureSupport: Record<string, PlatformType[]> = {
        // 文件下载
        'download': [PlatformType.APP, PlatformType.H5],
        // 分享到朋友圈
        'shareTimeline': [PlatformType.WEIXIN],
        // 分享给好友
        'shareMessage': [PlatformType.WEIXIN, PlatformType.APP],
        // 保存到相册
        'saveToAlbum': [PlatformType.WEIXIN, PlatformType.APP],
        // 打开文档
        'openDocument': [PlatformType.WEIXIN, PlatformType.APP],
        // 复制到剪贴板
        'clipboard': [PlatformType.WEIXIN, PlatformType.APP, PlatformType.H5],
        // 扫码
        'scanCode': [PlatformType.WEIXIN, PlatformType.APP],
        // 选择图片
        'chooseImage': [PlatformType.WEIXIN, PlatformType.APP, PlatformType.H5],
        // 录音
        'record': [PlatformType.WEIXIN, PlatformType.APP],
        // 支付
        'payment': [PlatformType.WEIXIN, PlatformType.APP],
        // 获取位置
        'location': [PlatformType.WEIXIN, PlatformType.APP, PlatformType.H5]
    }

    const supportedPlatforms = featureSupport[feature]
    if (!supportedPlatforms) {
        return false
    }

    return supportedPlatforms.includes(platform)
}

/**
 * 获取平台特定的导出方式
 * 验证需求 14.4 - 根据平台特性调整交互方式（如导出功能）
 */
export const getExportMethod = (): 'download' | 'share' | 'copy' => {
    return getPlatformSpecificOption({
        weixin: 'share' as const,
        app: 'share' as const,
        h5: 'download' as const,
        default: 'copy' as const
    })
}

/**
 * 获取平台特定的样式调整
 * 验证需求 14.5 - 保持一致的视觉风格
 */
export const getPlatformStyles = () => {
    const systemInfo = uni.getSystemInfoSync()

    return {
        // 状态栏高度（用于顶部安全区域）
        statusBarHeight: systemInfo.statusBarHeight || 0,
        // 导航栏高度
        navigationBarHeight: getPlatformSpecificOption({
            weixin: 44,
            ios: 44,
            android: 48,
            h5: 44,
            default: 44
        }),
        // 底部安全区域高度（用于 iPhone X 等机型）
        safeAreaBottom: systemInfo.safeAreaInsets?.bottom || 0,
        // 是否需要适配刘海屏
        hasNotch: (systemInfo.safeAreaInsets?.top || 0) > 20
    }
}

/**
 * 执行平台特定的操作
 * 验证需求 14.4
 */
export const executePlatformSpecific = <T>(handlers: {
    weixin?: () => T
    app?: () => T
    ios?: () => T
    android?: () => T
    h5?: () => T
    default: () => T
}): T => {
    // 优先级：具体平台 > 通用平台 > 默认处理
    if (isIOS() && handlers.ios) {
        return handlers.ios()
    }
    if (isAndroid() && handlers.android) {
        return handlers.android()
    }
    if (isWeixin() && handlers.weixin) {
        return handlers.weixin()
    }
    if (isApp() && handlers.app) {
        return handlers.app()
    }
    if (isH5() && handlers.h5) {
        return handlers.h5()
    }
    return handlers.default()
}
