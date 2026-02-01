/**
 * 平台判断工具
 * 验证需求 14
 */

/**
 * 判断是否为微信小程序
 */
export const isWeixin = () => {
    // #ifdef MP-WEIXIN
    return true
    // #endif
    // #ifndef MP-WEIXIN
    return false
    // #endif
}

/**
 * 判断是否为 App
 */
export const isApp = () => {
    // #ifdef APP-PLUS
    return true
    // #endif
    // #ifndef APP-PLUS
    return false
    // #endif
}

/**
 * 判断是否为 H5
 */
export const isH5 = () => {
    // #ifdef H5
    return true
    // #endif
    // #ifndef H5
    return false
    // #endif
}

/**
 * 获取当前平台名称
 */
export const getPlatform = () => {
    if (isWeixin()) return 'weixin'
    if (isApp()) return 'app'
    if (isH5()) return 'h5'
    return 'unknown'
}
