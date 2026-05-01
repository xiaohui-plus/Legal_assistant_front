/**
 * SSEStreamParser - 高复用 SSE 流式响应解析器
 * 
 * 功能：
 * - 解析 Server-Sent Events (SSE) 格式的流式响应
 * - 支持标准 SSE 格式 (data: {...})
 * - 自动处理缓冲区、解码和错误恢复
 * - 可配置的回调机制
 * 
 * 使用示例：
 * ```javascript
 * const parser = new SSEStreamParser({
 *   onData: (parsedData) => { ... },
 *   onComplete: () => { ... },
 *   onError: (error) => { ... }
 * });
 * 
 * await parser.parseFromResponse(fetchResponse);
 * ```
 */
class SSEStreamParser {
  /**
   * @param {Object} options - 配置选项
   * @param {Function} options.onData - 数据到达回调 (data: any) => void
   * @param {Function} options.onComplete - 流完成回调 () => void
   * @param {Function} options.onError - 错误回调 (error: Error) => void
   * @param {string} options.prefix - SSE 数据前缀，默认 'data: '
   */
  constructor(options = {}) {
    this.onData = options.onData || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || ((e) => console.error('SSE Error:', e));
    this.prefix = options.prefix || 'data: ';
    this.buffer = '';
    this.decoder = new TextDecoder();
    this.isDone = false;
  }

  /**
   * 从 Response 对象解析流
   * @param {Response} response - fetch API 返回的 Response
   * @param {Object} options - 额外选项
   * @returns {Promise<void>}
   */
  async parseFromResponse(response, options = {}) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const chunkSize = options.chunkSize || 64 * 1024; // 64KB
    const timeout = options.timeout || 300000; // 5分钟

    try {
      while (true) {
        const { done, value } = await Promise.race([
          reader.read(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Stream timeout')), timeout)
          )
        ]);

        if (done) {
          this._flushBuffer();
          this.onComplete();
          this.isDone = true;
          break;
        }

        this._processChunk(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 处理数据块
   * @param {Uint8Array} chunk - 原始数据块
   * @private
   */
  _processChunk(chunk) {
    this.buffer += this.decoder.decode(chunk, { stream: true });

    // 按 SSE 事件分隔符分割
    const events = this.buffer.split('\n\n');
    this.buffer = events.pop() || '';

    for (const event of events) {
      if (!event.trim()) continue;

      const lines = event.split('\n');
      let dataStr = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith(this.prefix)) {
          dataStr = trimmed.slice(this.prefix.length);
          break;
        }
      }

      if (!dataStr || dataStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(dataStr);
        this.onData(parsed);
      } catch (e) {
        // 非 JSON 数据，直接传递原始字符串
        this.onData({ raw: dataStr });
      }
    }
  }

  /**
   * 清空缓冲区
   * @private
   */
  _flushBuffer() {
    if (this.buffer.trim()) {
      const trimmed = this.buffer.trim();
      if (trimmed.startsWith(this.prefix)) {
        const dataStr = trimmed.slice(this.prefix.length);
        if (dataStr && dataStr !== '[DONE]') {
          try {
            this.onData(JSON.parse(dataStr));
          } catch (e) {
            this.onData({ raw: dataStr });
          }
        }
      }
    }
    this.buffer = '';
  }

  /**
   * 重置解析器状态
   */
  reset() {
    this.buffer = '';
    this.isDone = false;
  }
}

// 导出为模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SSEStreamParser;
}
