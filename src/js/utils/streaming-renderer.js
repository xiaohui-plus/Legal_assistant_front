/**
 * StreamingRenderer - 高复用流式文本渲染器
 * 
 * 功能：
 * - 平滑流式文本渲染动画
 * - 可配置的渲染速度、帧率
 * - 支持 Markdown 实时渲染
 * - 自动滚动到最新消息
 * - 性能优化的批量渲染
 * 
 * 使用示例：
 * ```javascript
 * const renderer = new StreamingRenderer({
 *   container: document.getElementById('chat-messages'),
 *   speed: 60,        // 字/秒
 *   fps: 60           // 帧率
 * });
 * 
 * renderer.start(element, text);
 * renderer.append(text);
 * renderer.stop();
 * ```
 */
class StreamingRenderer {
  /**
   * @param {Object} options - 配置选项
   * @param {HTMLElement} options.container - 消息容器元素
   * @param {number} options.speed - 渲染速度（字/秒），默认 60
   * @param {number} options.fps - 帧率，默认 60
   * @param {number} options.chunkSize - 每次渲染字符数，默认 8
   * @param {boolean} options.autoScroll - 是否自动滚动，默认 true
   * @param {Function} options.onCharRendered - 字符渲染回调
   * @param {Function} options.onComplete - 渲染完成回调
   */
  constructor(options = {}) {
    this.container = options.container;
    this.speed = options.speed || 60;
    this.fps = options.fps || 60;
    this.chunkSize = options.chunkSize || 8;
    this.autoScroll = options.autoScroll !== false;
    this.onCharRendered = options.onCharRendered || (() => {});
    this.onComplete = options.onComplete || (() => {});

    // 内部状态
    this.charQueue = [];
    this.currentElement = null;
    this.fullText = '';
    this.renderTimer = null;
    this.isStreaming = false;
    this._lastRenderedLength = 0;
  }

  /**
   * 开始流式渲染
   * @param {HTMLElement} element - 目标显示元素
   * @param {string} initialText - 初始文本
   */
  start(element, initialText = '') {
    if (!element) {
      console.error('StreamingRenderer: element is required');
      return;
    }

    this.stop();
    this.currentElement = element;
    this.fullText = initialText;
    this._lastRenderedLength = 0;
    this.isStreaming = true;

    // 更新显示
    this._renderContent();

    // 启动渲染定时器
    const interval = 1000 / this.fps;
    this.renderTimer = setInterval(() => this._renderLoop(), interval);
  }

  /**
   * 追加文本到流
   * @param {string} text - 要追加的文本
   */
  append(text) {
    if (!this.isStreaming) return;

    for (const char of text) {
      this.charQueue.push(char);
    }
    this.fullText += text;
  }

  /**
   * 停止流式渲染
   * @param {boolean} forceComplete - 是否强制显示全部内容
   */
  stop(forceComplete = true) {
    if (this.renderTimer) {
      clearInterval(this.renderTimer);
      this.renderTimer = null;
    }

    if (forceComplete && this.fullText && this.currentElement) {
      this.currentElement.innerHTML = marked.parse(this.fullText);
      this._lastRenderedLength = this.fullText.length;
    }

    this.isStreaming = false;
    this.charQueue = [];
    this.onComplete();
  }

  /**
   * 重置渲染器
   */
  reset() {
    this.stop();
    this.currentElement = null;
    this.fullText = '';
    this._lastRenderedLength = 0;
  }

  /**
   * 渲染循环
   * @private
   */
  _renderLoop() {
    if (this.charQueue.length === 0) return;

    // 批量取字符
    const chunk = this.charQueue.splice(0, this.chunkSize).join('');
    this._renderContent();

    // 回调
    this.onCharRendered(chunk);

    // 自动滚动
    if (this.autoScroll) {
      this._scrollToBottom();
    }
  }

  /**
   * 渲染内容到 DOM
   * @private
   */
  _renderContent() {
    if (!this.currentElement) return;

    // 只渲染新增部分（性能优化）
    if (this.fullText.length > this._lastRenderedLength) {
      this.currentElement.innerHTML = marked.parse(this.fullText);
      this._lastRenderedLength = this.fullText.length;
    }
  }

  /**
   * 自动滚动到底部
   * @private
   */
  _scrollToBottom() {
    if (!this.container) return;

    requestAnimationFrame(() => {
      this.container.scrollTop = this.container.scrollHeight;
    });
  }

  /**
   * 获取当前渲染进度
   * @returns {number} 进度百分比 (0-100)
   */
  getProgress() {
    if (!this.fullText) return 0;
    return Math.round((this._lastRenderedLength / this.fullText.length) * 100);
  }

  /**
   * 获取剩余未渲染字符数
   * @returns {number}
   */
  getRemainingChars() {
    return this.charQueue.length;
  }

  /**
   * 设置渲染速度
   * @param {number} speed - 字/秒
   */
  setSpeed(speed) {
    this.speed = speed;
    // 根据速度自动调整 chunkSize
    this.chunkSize = Math.max(1, Math.round(speed / this.fps));
  }
}

// 导出为模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreamingRenderer;
}
