// 文件工具函数

/**
 * 格式化文件大�? * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大�? */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件类型文本
 * @param {string} fileType - 文件类型
 * @returns {string} 文件类型文本
 */
export function getFileTypeText(fileType) {
  const typeMap = {
    'image': '图片',
    'pdf': 'PDF文档',
    'audio': '音频',
    'video': '视频',
    'document': 'Word文档',
    'excel': 'Excel表格'
  };
  return typeMap[fileType] || '其他文件';
}

/**
 * 获取文件图标
 * @param {string} fileType - 文件类型
 * @param {string} fileName - 文件�? * @returns {string} 文件图标路径
 */
export function getFileIcon(fileType, fileName) {
  // 标准化文件类�?  const type = (fileType || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  
  // 先尝试文件类型匹�?  if (type.includes('image')) return '../images/图片.svg';
  if (type.includes('audio')) return '../images/有音�?svg';
  if (type.includes('pdf')) return '../images/pdf.svg';
  if (type.includes('video')) return '../images/文件.svg';
  if (type.includes('document')) return '../images/word.svg';
  if (type.includes('excel')) return '../images/excel.svg';
  
  // 再尝试文件名后缀匹配
  if (name.includes('.mp3') || name.includes('.wav') || name.includes('.ogg') || name.includes('.flac') || name.includes('.m4a')) {
    return '../images/有音�?svg';
  }
  if (name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png') || name.includes('.gif') || name.includes('.bmp')) {
    return '../images/图片.svg';
  }
  if (name.includes('.pdf')) {
    return '../images/pdf.svg';
  }
  if (name.includes('.doc') || name.includes('.docx')) {
    return '../images/word.svg';
  }
  if (name.includes('.xls') || name.includes('.xlsx')) {
    return '../images/excel.svg';
  }
  
  return '../images/文件.svg';
}

/**
 * 获取文件扩展�? * @param {string} fileName - 文件�? * @returns {string} 文件扩展�? */
export function getFileExtension(fileName) {
  if (!fileName) return '';
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * 检查文件类型是否支�? * @param {string} fileName - 文件�? * @returns {boolean} 是否支持
 */
export function isFileTypeSupported(fileName) {
  const supportedExtensions = [
    // 图片
    'jpg', 'jpeg', 'png', 'gif', 'bmp',
    // PDF
    'pdf',
    // 音频
    'mp3', 'wav', 'm4a', 'aac',
    // 视频
    'mp4', 'avi', 'mov', 'wmv',
    // 文档
    'doc', 'docx',
    // 表格
    'xls', 'xlsx'
  ];
  const extension = getFileExtension(fileName);
  return supportedExtensions.includes(extension);
}

/**
 * 检查文件大小是否符合要�? * @param {number} fileSize - 文件大小（字节）
 * @param {number} maxSize - 最大文件大小（字节�? * @returns {boolean} 是否符合要求
 */
export function isFileSizeValid(fileSize, maxSize = 50 * 1024 * 1024) { // 默认50MB
  return fileSize <= maxSize;
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} fileName - 文件�? */
export function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 读取文件为Base64
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Base64字符�? */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * 读取文件为文�? * @param {File} file - 文件对象
 * @returns {Promise<string>} 文本内容
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}