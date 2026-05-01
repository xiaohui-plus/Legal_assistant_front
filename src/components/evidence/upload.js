// 证据上传组件

import { evidenceApi } from '../../services/api.js';
import { getCurrentCaseId } from '../../services/storage.js';
import { isFileTypeSupported, isFileSizeValid, formatFileSize } from '../../utils/file.js';

class EvidenceUploader {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentCaseId = getCurrentCaseId();
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 绑定文件选择事件
    const fileInput = this.container.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        this.handleFileSelect(event);
      });
    }

    // 绑定拖拽事件
    const dropArea = this.container.querySelector('.drop-area');
    if (dropArea) {
      dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('drag-over');
      });

      dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('drag-over');
      });

      dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('drag-over');
        if (event.dataTransfer.files.length > 0) {
          this.uploadFiles(event.dataTransfer.files);
        }
      });

      dropArea.addEventListener('click', () => {
        fileInput.click();
      });
    }
  }

  async handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
      try {
        await this.uploadFiles(files);
        // 清空input，允许重复上传同一文件
        event.target.value = '';
        console.log('�?文件选择处理完成');
      } catch (error) {
        console.error('�?文件选择处理失败:', error);
        throw error;
      }
    } else {
      console.log('⚠️ 没有选择文件');
    }
  }

  async uploadFiles(files) {
    if (!files || files.length === 0) {
      console.warn('⚠️ 没有文件需要上�?);
      return;
    }

    // 限制文件数量
    if (files.length > 20) {
      alert('单次最多上�?0个文�?);
      return;
    }

    const validFiles = [];
    const errors = [];

    // 验证文件
    for (const file of files) {
      if (!isFileTypeSupported(file.name)) {
        errors.push(`${file.name}：文件类型不支持`);
        continue;
      }

      if (!isFileSizeValid(file.size, 100 * 1024 * 1024)) { // 100MB
        errors.push(`${file.name}：文件大小超�?00MB限制`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      alert('部分文件验证失败：\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      // 创建FormData
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append('files', file);
      }
      formData.append('case_id', this.currentCaseId);
      
      // 添加案件标题和设备指纹
      const caseTitle = document.getElementById('uploadCaseSelector')?.selectedOptions[0]?.text || '';
      if (caseTitle) {
        formData.append('case_title', caseTitle);
      }
      
      // 获取设备指纹
      const deviceFingerprint = localStorage.getItem('device_fingerprint') || '';
      if (deviceFingerprint) {
        formData.append('device_fingerprint', deviceFingerprint);
      }

      // 显示上传状态
      this.showUploadStatus('正在上传...', 0);

      // 调用API上传文件
      const result = await evidenceApi.upload(formData);

      if (result.code === 200) {
        this.showUploadStatus(`上传完成，成功 ${result.data.uploaded_count} 个，失败 ${result.data.failed_count} 个`, 100);
        
        // 上传成功后，自动触发分析
        if (result.data.evidence_ids && result.data.evidence_ids.length > 0) {
          console.log('开始自动分析证据:', result.data.evidence_ids);
          await this.analyzeEvidences(result.data.evidence_ids);
        }
        
        // 通知父组件更新证据列表
        if (this.onUploadComplete) {
          this.onUploadComplete(result);
        }
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('⚠️ 上传失败:', error);
      this.showUploadStatus(`上传失败: ${error.message}`, 0);
      throw error;
    } finally {
      // 3秒后隐藏上传状态
      setTimeout(() => {
        this.hideUploadStatus();
      }, 3000);
    }
  }

  async analyzeEvidences(evidenceIds) {
    // 并行触发所有证据的分析
    const analyzePromises = evidenceIds.map(async (evidenceId) => {
      try {
        console.log(`正在分析证据: ${evidenceId}`);
        const deviceFingerprint = localStorage.getItem('device_fingerprint') || '';
        
        const response = await fetch(`${window.API_BASE_URL}/api/v1/evidence/analyze/${evidenceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...evidenceApi.getAuthHeaders?.() || {}
          },
          body: JSON.stringify({
            device_fingerprint: deviceFingerprint
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`证据 ${evidenceId} 分析完成:`, result.message);
          return { evidenceId, success: true };
        } else {
          console.error(`证据 ${evidenceId} 分析失败: HTTP ${response.status}`);
          return { evidenceId, success: false };
        }
      } catch (error) {
        console.error(`证据 ${evidenceId} 分析异常:`, error);
        return { evidenceId, success: false, error: error.message };
      }
    });
    
    // 等待所有分析完成
    const results = await Promise.all(analyzePromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`证据分析完成: ${successCount}/${evidenceIds.length} 成功`);
    
    // 刷新证据列表以更新状态
    if (this.onUploadComplete) {
      this.onUploadComplete({ action: 'analyze_complete' });
    }
  }

  showUploadStatus(message, progress) {
    let statusDiv = document.getElementById('uploadStatus');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'uploadStatus';
      statusDiv.className = 'upload-status';
      statusDiv.innerHTML = `
        <div class="status-message"></div>
        <div class="status-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">0%</div>
        </div>
      `;
      document.body.appendChild(statusDiv);
    }

    statusDiv.querySelector('.status-message').textContent = message;
    const progressFill = statusDiv.querySelector('.progress-fill');
    const progressText = statusDiv.querySelector('.progress-text');
    
    if (progressFill && progressText) {
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }

    statusDiv.style.display = 'block';
  }

  hideUploadStatus() {
    const statusDiv = document.getElementById('uploadStatus');
    if (statusDiv) {
      statusDiv.style.display = 'none';
    }
  }

  // 设置上传完成回调
  setOnUploadComplete(callback) {
    this.onUploadComplete = callback;
  }
}

export default EvidenceUploader;