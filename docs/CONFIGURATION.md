# 法律助手应用配置说明

本文档说明了法律助手应用的配置文件及其关键设置。

## 配置文件概览

### 1. manifest.json - 应用清单配置

应用的核心配置文件，定义了应用的基本信息和各平台特定配置。

#### 基本信息
- **应用名称**: 法律助手
- **应用ID**: __UNI__LEGAL_ASSISTANT
- **版本号**: 1.0.0 (versionCode: 100)
- **描述**: 智能法律咨询和文书生成应用

#### 关键配置项

**transformPx: false**
- 不自动转换 px 单位
- 使用 rpx 单位进行响应式适配

**Vue 版本**
- vueVersion: "3" - 使用 Vue 3 框架

#### 平台配置

##### H5 配置
```json
{
  "router": {
    "mode": "hash",      // 使用 hash 路由模式
    "base": "./"
  },
  "optimization": {
    "treeShaking": {
      "enable": true     // 启用 tree shaking 优化
    }
  }
}
```

##### 微信小程序配置
- **urlCheck**: false - 开发时不检查合法域名
- **es6**: true - 启用 ES6 转 ES5
- **minified**: true - 上传时压缩代码
- **权限声明**:
  - scope.userLocation: 用于提供本地法律服务

##### App 配置
- **启动页**: 自动关闭，始终在渲染前显示
- **Android 权限**:
  - INTERNET - 网络访问
  - WRITE_EXTERNAL_STORAGE - 写入外部存储
  - READ_EXTERNAL_STORAGE - 读取外部存储
- **iOS 隐私描述**:
  - NSPhotoLibraryUsageDescription: 用于上传法律证据图片
  - NSPhotoLibraryAddUsageDescription: 用于保存图片到相册

### 2. pages.json - 页面路由配置

定义了应用的页面路由、导航栏样式和底部标签栏。

#### 页面列表

| 路径 | 标题 | 特殊配置 |
|------|------|----------|
| pages/chat/list | 法律咨询 | 启用下拉刷新 |
| pages/chat/window | 聊天 | - |
| pages/document/templates | 法律文书 | - |
| pages/document/form | 填写参数 | - |
| pages/document/preview | 文书预览 | - |
| pages/profile/index | 个人中心 | - |
| pages/profile/favorites | 我的收藏 | - |
| pages/profile/documents | 我的文书 | - |
| pages/profile/settings | 设置 | - |

#### 底部标签栏 (TabBar)

配置了三个主要功能入口：

1. **咨询** (pages/chat/list)
   - 图标: static/icons/chat.png / chat-active.png
   - 颜色: 未选中 #999999, 选中 #165DFF

2. **文书** (pages/document/templates)
   - 图标: static/icons/document.png / document-active.png
   - 颜色: 未选中 #999999, 选中 #165DFF

3. **我的** (pages/profile/index)
   - 图标: static/icons/profile.png / profile-active.png
   - 颜色: 未选中 #999999, 选中 #165DFF

#### 全局样式

```json
{
  "navigationBarTextStyle": "black",
  "navigationBarTitleText": "法律助手",
  "navigationBarBackgroundColor": "#FFFFFF",
  "backgroundColor": "#F5F7FA"
}
```

### 3. uni.scss - 全局样式变量

定义了应用的设计系统变量，自动注入到每个页面和组件。

#### 颜色系统

**主色调**
- Primary: #165DFF (深蓝色)
- Success: #52C41A (绿色)
- Warning: #FF7D00 (橙色)
- Error: #F5222D (红色)

**文字颜色**
- 正文: #333333
- 次要文字: #999999
- 占位符: #CCCCCC

**背景颜色**
- 主背景: #FFFFFF
- 次背景: #F5F7FA
- 悬停: #E8F3FF
- 遮罩: rgba(0, 0, 0, 0.4)

#### 字体大小
- 小号: 26rpx (辅助文字)
- 基础: 30rpx (正文)
- 大号: 36rpx (标题)

#### 间距系统
- 小: 10rpx
- 中: 20rpx
- 大: 30rpx

#### 圆角
- 小: 4rpx
- 中: 8rpx
- 大: 16rpx
- 圆形: 50%

### 4. main.ts - 应用入口

应用的主入口文件，配置了：
- Vue 3 SSR 应用创建
- Pinia 状态管理集成

### 5. App.vue - 应用根组件

应用的根组件，包含：
- 生命周期钩子 (onLaunch, onShow, onHide)
- 全局样式导入

## 待完成事项

### 图标文件
底部标签栏引用的图标文件需要创建：
- chat.png / chat-active.png
- document.png / document-active.png
- profile.png / profile-active.png

**规格要求**:
- 尺寸: 81px × 81px
- 格式: PNG with transparency
- 颜色: 未选中 #999999, 选中 #165DFF

详见: `static/icons/PLACEHOLDER_ICONS_NEEDED.txt`

## 配置验证

### 检查清单

- [x] manifest.json 配置完整
- [x] pages.json 路由配置完整
- [x] uni.scss 样式变量定义
- [x] main.ts 入口配置
- [x] App.vue 根组件配置
- [x] 全局样式符合设计规范
- [x] 多端配置 (H5, 微信小程序, App)
- [ ] 标签栏图标文件 (待添加)

## 相关文档

- [需求文档](.kiro/specs/legal-assistant-app/requirements.md)
- [设计文档](.kiro/specs/legal-assistant-app/design.md)
- [任务列表](.kiro/specs/legal-assistant-app/tasks.md)

## 注意事项

1. **微信小程序发布前**:
   - 需要在 manifest.json 的 mp-weixin.appid 中填入真实的小程序 AppID
   - 需要配置合法的服务器域名

2. **App 发布前**:
   - 需要配置真实的应用签名
   - iOS 需要配置 Bundle ID
   - Android 需要配置包名

3. **H5 部署前**:
   - 需要配置生产环境的 API 地址
   - 需要配置 HTTPS 域名

4. **图标资源**:
   - 在正式发布前必须替换为设计师提供的正式图标
   - 确保图标符合各平台的设计规范
