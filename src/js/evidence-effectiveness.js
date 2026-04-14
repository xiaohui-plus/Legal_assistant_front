// 证据效力分析功能
// API_BASE_URL �?config.js 中获�?
// 获取Token
function getToken() {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
}

// 处理401错误（登录过期）
function handle401Error() {
    alert('登录已过期，请重新登�?);
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.location.href = '/index.html';
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// 显示加载状�?function showLoading(text = '处理�?..') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) {
        if (loadingText) loadingText.textContent = text;
        overlay.style.display = 'flex';
    }
}

// 隐藏加载状�?function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ==================== 证据效力评估 ====================

/**
 * 单个证据效力评估
 * @param {string} evidenceId - 证据ID
 * @param {string} caseType - 案件类型
 * @param {string} evidenceType - 证据类型
 * @param {string} description - 证据描述
 */
async function evaluateEvidence(evidenceId, caseType, evidenceType = '', description = '') {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    showLoading('正在评估证据效力...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                evidence_id: evidenceId,
                case_type: caseType,
                evidence_type: evidenceType,
                description: description
            })
        });

        hideLoading();

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('证据效力评估完成', 'success');
            return result.data;
        } else {
            showMessage(result.message || '评估失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoading();
        console.error('[evaluateEvidence] 错误:', error);
        showMessage('评估失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 批量证据效力评估
 * @param {string} caseId - 案件ID
 * @param {string} caseType - 案件类型
 * @param {Array} evidenceList - 证据列表
 */
async function batchEvaluateEvidence(caseId, caseType, evidenceList) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    showLoading('正在批量评估证据效力...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/batch-evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                case_id: caseId,
                case_type: caseType,
                evidence_list: evidenceList
            })
        });

        hideLoading();

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage(`批量评估完成，成功评�?${result.data.evaluated_count} 个证据`, 'success');
            return result.data;
        } else {
            showMessage(result.message || '批量评估失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoading();
        console.error('[batchEvaluateEvidence] 错误:', error);
        showMessage('批量评估失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 获取评估详情
 * @param {string} evaluationId - 评估ID
 */
async function getEvaluationDetail(evaluationId) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/${evaluationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            return result.data;
        } else {
            showMessage(result.message || '获取评估详情失败', 'error');
            return null;
        }
    } catch (error) {
        console.error('[getEvaluationDetail] 错误:', error);
        showMessage('获取评估详情失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 获取证据效力历史记录
 * @param {string} evidenceId - 证据ID
 */
async function getEvaluationHistory(evidenceId) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/${evidenceId}/effectiveness/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            return result.data;
        } else {
            showMessage(result.message || '获取历史记录失败', 'error');
            return null;
        }
    } catch (error) {
        console.error('[getEvaluationHistory] 错误:', error);
        showMessage('获取历史记录失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 证据效力对比分析
 * @param {Array} evidenceIds - 证据ID列表
 */
async function compareEvidence(evidenceIds) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    showLoading('正在对比分析...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                evidence_ids: evidenceIds
            })
        });

        hideLoading();

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('对比分析完成', 'success');
            return result.data;
        } else {
            showMessage(result.message || '对比分析失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoading();
        console.error('[compareEvidence] 错误:', error);
        showMessage('对比分析失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 导出评估报告
 * @param {string} evaluationId - 评估ID
 * @param {string} format - 导出格式 (pdf/word/html)
 * @param {boolean} includeSuggestions - 是否包含建议
 * @param {boolean} includeCharts - 是否包含图表
 */
async function exportEvaluationReport(evaluationId, format = 'pdf', includeSuggestions = true, includeCharts = true) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return null;
    }

    showLoading('正在生成报告...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/${evaluationId}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                format: format,
                include_suggestions: includeSuggestions,
                include_charts: includeCharts
            })
        });

        hideLoading();

        if (response.status === 401) {
            handle401Error();
            return null;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('报告生成中，请稍�?..', 'info');
            // 轮询检查报告生成状�?            pollExportStatus(result.data.task_id);
            return result.data;
        } else {
            showMessage(result.message || '导出失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoading();
        console.error('[exportEvaluationReport] 错误:', error);
        showMessage('导出失败: ' + error.message, 'error');
        return null;
    }
}

/**
 * 轮询导出状�? * @param {string} taskId - 任务ID
 */
async function pollExportStatus(taskId) {
    const token = getToken();
    let attempts = 0;
    const maxAttempts = 30; // 最多轮�?0次（30秒）

    const checkStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/export/${taskId}/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.data.status === 'completed') {
                showMessage('报告生成完成', 'success');
                // 自动下载
                downloadEvaluationReport(taskId);
            } else if (result.data.status === 'failed') {
                showMessage('报告生成失败', 'error');
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkStatus, 1000); // 1秒后再次检�?            } else {
                showMessage('报告生成超时，请稍后手动下载', 'warning');
            }
        } catch (error) {
            console.error('[pollExportStatus] 错误:', error);
        }
    };

    checkStatus();
}

/**
 * 下载评估报告
 * @param {string} taskId - 任务ID
 */
function downloadEvaluationReport(taskId) {
    const token = getToken();
    const url = `${API_BASE_URL}/api/v1/evidence/effectiveness/export/${taskId}/download`;

    // 创建隐藏的下载链�?    const link = document.createElement('a');
    link.href = url + `?token=${token}`;
    link.download = `evaluation_report_${taskId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== UI渲染函数 ====================

/**
 * 渲染评估结果
 * @param {Object} evaluation - 评估结果数据
 * @param {string} containerId - 容器ID
 */
function renderEvaluationResult(evaluation, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { authenticity, legality, relevance, overall, risk_assessment, improvement_suggestions } = evaluation;

    container.innerHTML = `
        <div class="evaluation-result">
            <!-- 综合评分卡片 -->
            <div class="overall-score-card">
                <div class="score-circle">
                    <svg width="200" height="200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                        <circle cx="100" cy="100" r="90" fill="none" stroke="${getScoreColor(overall.score)}" 
                                stroke-width="12" stroke-dasharray="${overall.score * 565} 565" 
                                stroke-dashoffset="0" transform="rotate(-90 100 100)"/>
                    </svg>
                    <div class="score-text">
                        <div class="score-value">${(overall.score * 100).toFixed(0)}</div>
                        <div class="score-label">综合评分</div>
                    </div>
                </div>
                <div class="score-info">
                    <div class="score-level ${overall.grade.toLowerCase()}">${overall.level}</div>
                    <div class="score-grade">等级: ${overall.grade}</div>
                    <div class="score-description">${overall.description}</div>
                </div>
            </div>

            <!-- 三维度评�?-->
            <div class="dimensions-grid">
                ${renderDimensionCard('真实�?, authenticity, '<img src="../images/效力.svg" style="width: 20px; height: 20px; vertical-align: middle;">')}
                ${renderDimensionCard('合法�?, legality, '<img src="../images/综合评估1.svg" style="width: 20px; height: 20px; vertical-align: middle;">')}
                ${renderDimensionCard('关联�?, relevance, '<img src="../images/返回.svg" style="width: 20px; height: 20px; vertical-align: middle;">')}
            </div>

            <!-- 风险评估 -->
            <div class="risk-assessment-section">
                <h3><img src="../images/风险分析.svg" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"> 风险评估</h3>
                <div class="risk-level ${risk_assessment.level.replace('风险', '')}">${risk_assessment.level}</div>
                <div class="risks-list">
                    ${risk_assessment.risks.map(risk => `
                        <div class="risk-item">
                            <div class="risk-header">
                                <span class="risk-type">${risk.type}</span>
                                <span class="risk-probability ${risk.probability}">${risk.probability}概率</span>
                            </div>
                            <div class="risk-description">${risk.description}</div>
                            <div class="risk-mitigation">
                                <strong>应对措施:</strong> ${risk.mitigation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 改进建议 -->
            <div class="improvement-section">
                <h3><img src="../images/综合评估1.svg" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"> 改进建议</h3>
                <div class="suggestions-list">
                    ${improvement_suggestions.map(suggestion => `
                        <div class="suggestion-item priority-${suggestion.priority}">
                            <div class="suggestion-header">
                                <span class="priority-badge">${suggestion.priority}优先�?/span>
                                <span class="category">${suggestion.category}</span>
                            </div>
                            <div class="suggestion-content">${suggestion.suggestion}</div>
                            <div class="suggestion-footer">
                                <span class="improvement">预期提升: ${suggestion.expected_improvement}</span>
                                <span class="cost">${suggestion.cost}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="evaluation-actions">
                <button class="btn-primary" onclick="exportEvaluationReport('${evaluation.evaluation_id}', 'pdf')">
                    <img src="../images/文件-文书审查.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 导出PDF报告
                </button>
                <button class="btn-secondary" onclick="exportEvaluationReport('${evaluation.evaluation_id}', 'word')">
                    <img src="../images/文书生成.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 导出Word报告
                </button>
                <button class="btn-secondary" onclick="showEvaluationHistory('${evaluation.evidence_id}')">
                    <img src="../images/日历.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 查看历史记录
                </button>
            </div>
        </div>
    `;
}

/**
 * 渲染维度评分卡片
 */
function renderDimensionCard(title, dimension, icon) {
    return `
        <div class="dimension-card">
            <div class="dimension-header">
                <span class="dimension-icon">${icon}</span>
                <span class="dimension-title">${title}</span>
            </div>
            <div class="dimension-score">
                <div class="score-bar">
                    <div class="score-fill" style="width: ${dimension.score * 100}%; background: ${getScoreColor(dimension.score)}"></div>
                </div>
                <div class="score-value">${(dimension.score * 100).toFixed(0)}�?/div>
            </div>
            <div class="dimension-level">${dimension.level}</div>
            
            ${dimension.factors.length > 0 ? `
                <div class="factors-section">
                    <div class="section-title">�?优势因素</div>
                    <ul class="factors-list">
                        ${dimension.factors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${dimension.issues.length > 0 ? `
                <div class="issues-section">
                    <div class="section-title">⚠️ 存在问题</div>
                    <ul class="issues-list">
                        ${dimension.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${dimension.suggestions.length > 0 ? `
                <div class="suggestions-section">
                    <div class="section-title">💡 改进建议</div>
                    <ul class="suggestions-list">
                        ${dimension.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * 根据分数获取颜色
 */
function getScoreColor(score) {
    if (score >= 0.9) return '#10b981'; // 绿色
    if (score >= 0.8) return '#3b82f6'; // 蓝色
    if (score >= 0.7) return '#f59e0b'; // 橙色
    if (score >= 0.6) return '#ef4444'; // 红色
    return '#991b1b'; // 深红�?}

/**
 * 显示评估历史记录
 */
async function showEvaluationHistory(evidenceId) {
    const history = await getEvaluationHistory(evidenceId);
    if (!history) return;

    // 创建模态框显示历史记录
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3><img src="../images/日历.svg" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"> 评估历史记录</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="history-stats">
                    <div class="stat-item">
                        <div class="stat-label">总评估次�?/div>
                        <div class="stat-value">${history.total_evaluations}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">趋势</div>
                        <div class="stat-value ${history.trend}">${getTrendText(history.trend)}</div>
                    </div>
                </div>
                <div class="history-list">
                    ${history.history.map((item, index) => `
                        <div class="history-item">
                            <div class="history-index">#${index + 1}</div>
                            <div class="history-info">
                                <div class="history-time">${formatDateTime(item.timestamp)}</div>
                                <div class="history-score">
                                    <span class="score-badge" style="background: ${getScoreColor(item.overall_score)}">
                                        ${(item.overall_score * 100).toFixed(0)}�?                                    </span>
                                    <span class="score-level">${item.level}</span>
                                </div>
                            </div>
                            <button class="btn-small" onclick="viewEvaluationDetail('${item.evaluation_id}')">
                                查看详情
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * 查看评估详情
 */
async function viewEvaluationDetail(evaluationId) {
    const detail = await getEvaluationDetail(evaluationId);
    if (!detail) return;

    // 关闭历史记录模态框
    const historyModal = document.querySelector('.modal');
    if (historyModal) historyModal.remove();

    // 显示评估详情
    renderEvaluationResult(detail.result, 'evaluationResultContainer');
}

/**
 * 获取趋势文本
 */
function getTrendText(trend) {
    const trendMap = {
        'improving': '<img src="../images/综合评估1.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 持续改善',
        'stable': '<img src="../images/返回.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 保持稳定',
        'declining': '<img src="../images/风险分析.svg" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"> 有所下降'
    };
    return trendMap[trend] || trend;
}

/**
 * 格式化日期时�? */
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== 页面初始�?====================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('[证据效力分析] 页面初始�?);

    // 检查登录状�?    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'warning');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    }
});
