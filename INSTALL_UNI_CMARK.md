# 安装 uni-cmark 模块

## 为什么需要 uni-cmark？

uni-cmark 是一个 Markdown 解析和渲染模块，用于：
- 解析 AI 返回的 Markdown 格式文本
- 渲染代码块、表格、列表等
- 支持数学公式（LaTeX）
- 支持语法高亮

## 安装方法

### 🎯 方法一：HBuilderX 插件市场（最简单）

1. 在 HBuilderX 中打开项目

2. 右键点击项目根目录

3. 选择菜单：
   ```
   uni_modules -> 从插件市场导入
   ```

4. 在弹出的窗口中搜索：
   ```
   uni-cmark
   ```

5. 找到 "uni-cmark" 插件，点击"导入"

6. 等待下载和安装完成

7. 安装完成后，项目结构应该是：
   ```
   uni_modules/
   ├── uni-ai-x/
   ├── uni-cmark/          ← 新安装的模块
   ├── uni-config-center/
   ├── uni-highlight/
   └── uni-id-common/
   ```

### 🌐 方法二：在线下载

1. 访问插件市场页面：
   ```
   https://ext.dcloud.net.cn/plugin?name=uni-cmark
   ```

2. 点击"下载插件 ZIP"按钮

3. 解压下载的 ZIP 文件

4. 将解压后的 `uni-cmark` 文件夹复制到项目的 `uni_modules` 目录下

5. 确保目录结构正确：
   ```
   你的项目/
   └── uni_modules/
       └── uni-cmark/
           ├── package.json
           ├── readme.md
           ├── utssdk/
           └── ...
   ```

### 📦 方法三：使用 npm（如果项目支持）

```bash
# 在项目根目录执行
npm install @dcloudio/uni-cmark
```

## 验证安装

安装完成后，检查以下内容：

### 1. 检查文件结构

确认 `uni_modules/uni-cmark` 目录存在，且包含以下文件：
```
uni_modules/uni-cmark/
├── package.json
├── readme.md
├── changelog.md
├── utssdk/
│   ├── interface.uts
│   ├── app-android/
│   ├── app-ios/
│   └── web/
└── ...
```

### 2. 重新编译项目

在 HBuilderX 中：
```
运行 -> 清理项目缓存
```

然后重新运行项目。

### 3. 检查是否有报错

运行项目后，查看控制台是否还有关于 `uni-cmark` 的错误。

## 安装后运行

安装完成后，按照以下步骤运行项目：

### H5 端（推荐）

```
1. 在 HBuilderX 中点击"运行"
2. 选择"运行到浏览器"
3. 选择 Chrome 或其他浏览器
4. 等待编译完成
5. 浏览器会自动打开项目
```

### 小程序端

```
1. 确保已安装微信开发者工具
2. 在 HBuilderX 中点击"运行"
3. 选择"运行到小程序模拟器"
4. 选择"微信开发者工具"
5. 等待编译完成
```

## 常见问题

### ❌ 安装后仍然报错

**问题：** 安装后仍然提示找不到模块

**解决方案：**
1. 清理项目缓存：`运行` -> `清理项目缓存`
2. 重启 HBuilderX
3. 重新运行项目

### ❌ 下载失败

**问题：** 从插件市场下载失败

**解决方案：**
1. 检查网络连接
2. 尝试使用方法二手动下载
3. 检查 HBuilderX 是否需要更新

### ❌ 版本不兼容

**问题：** uni-cmark 版本与项目不兼容

**解决方案：**
1. 更新 HBuilderX 到最新版本
2. 更新 uni-app x 到最新版本
3. 重新安装 uni-cmark

### ❌ 目录结构错误

**问题：** 解压后目录结构不对

**正确结构：**
```
uni_modules/
└── uni-cmark/          ← 直接是这个文件夹
    ├── package.json
    └── ...
```

**错误结构：**
```
uni_modules/
└── uni-cmark/
    └── uni-cmark/      ← 多了一层
        ├── package.json
        └── ...
```

如果是错误结构，需要将内层的 `uni-cmark` 文件夹移到外层。

## 其他依赖模块

项目还依赖以下模块（已包含）：

- ✅ **uni-ai-x**: AI 聊天核心模块
- ✅ **uni-highlight**: 代码高亮模块
- ✅ **uni-config-center**: 配置中心
- ✅ **uni-id-common**: 用户身份模块

这些模块已经在项目中，无需额外安装。

## 完成安装

安装完成后，你应该能够：

1. ✅ 正常运行项目，无报错
2. ✅ 看到 AI 问答界面
3. ✅ 发送消息并接收 AI 响应
4. ✅ Markdown 内容正常渲染

## 下一步

安装完成后：

1. 📖 阅读 `RUN_GUIDE.md` 了解如何运行项目
2. ⚙️ 阅读 `config.example.md` 了解如何配置 AI 服务
3. 🚀 开始使用 AI 问答功能

---

**需要帮助？**

如果安装过程中遇到问题：
1. 查看 HBuilderX 控制台的错误信息
2. 访问 uni-app 社区：https://ask.dcloud.net.cn/
3. 查看 uni-cmark 插件页面的评论和文档
