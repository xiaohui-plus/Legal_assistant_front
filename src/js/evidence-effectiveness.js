// 证据效力分析功能
// API_BASE_URL 从 config.js 中获取

// 获取Token
function getToken() {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
}

// 处理401错误（登录过期）
function handle401Error() {
    alert('登录已过期，请重新登录');
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

// 显示加载状态
function showLoading(text = '处理中...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) {
        if (loadingText) loadingText.textContent = text;
        overlay.style.display = 'flex';
    }
}

// 隐藏加载状态
function hideLoading() {
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
async function evaluateEvidence(evidenceId, caseType, evidenceType = '', description = '', caseDescription = '') {
    showLoading('正在评估证据效力...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                evidence_id: evidenceId,
                case_type: caseType,
                evidence_type: evidenceType,
                description: description,
                case_description: caseDescription
            })
        });

        hideLoading();

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
 * @param {Array} evidenceList - 证据列表，每个包含 evidence_id, case_type, evidence_type, description, case_description
 */
async function batchEvaluateEvidence(evidenceList) {
    showLoading('正在批量评估证据效力...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/batch-evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                evidences: evidenceList.map(ev => ({
                    evidence_id: ev.evidence_id,
                    case_type: ev.case_type,
                    evidence_type: ev.evidence_type,
                    description: ev.description,
                    case_description: ev.case_description || ''
                }))
            })
        });

        hideLoading();

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage(`批量评估完成，成功评估 ${result.data.length} 个证据`, 'success');
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
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/${evaluationId}`);

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
    showLoading('正在对比分析...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                evidence_ids: evidenceIds
            })
        });

        hideLoading();

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
    showLoading('正在生成报告...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/${evaluationId}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                format: format,
                include_suggestions: includeSuggestions,
                include_charts: includeCharts
            })
        });

        hideLoading();

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('报告生成中，请稍后...', 'info');
            pollExportStatus(result.data.task_id);
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
 * 轮询导出状态
 * @param {string} taskId - 任务ID
 */
async function pollExportStatus(taskId) {
    let attempts = 0;
    const maxAttempts = 30;

    const checkStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/export/${taskId}/status`);

            const result = await response.json();

            if (result.data.status === 'completed') {
                showMessage('报告生成完成', 'success');
                downloadEvaluationReport(taskId);
            } else if (result.data.status === 'failed') {
                showMessage('报告生成失败', 'error');
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkStatus, 1000);
            } else {
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
    const url = `${API_BASE_URL}/api/v1/evidence/effectiveness/export/${taskId}/download`;

    const link = document.createElement('a');
    link.href = url;
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

    const { authenticity, relevance, legality, completeness, corroboration, overall, summary } = evaluation;

    container.innerHTML = `
        <div class="evaluation-result">
            <div class="overall-score-card">
                <div class="score-circle">
                    <svg width="200" height="200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                        <circle cx="100" cy="100" r="90" fill="none" stroke="${getScoreColor5(overall.score)}" 
                                stroke-width="12" stroke-dasharray="${overall.score * 5.65} 565" 
                                stroke-dashoffset="0" transform="rotate(-90 100 100)"/>
                    </svg>
                    <div class="score-text">
                        <div class="score-value">${overall.score.toFixed(0)}</div>
                        <div class="score-label">综合评分</div>
                    </div>
                </div>
                <div class="score-info">
                    <div class="score-level">${overall.emoji} ${overall.grade}</div>
                    <div class="score-description">${overall.description}</div>
                </div>
            </div>

            <div class="dimensions-grid">
                ${renderDimensionCard5('来源真实性', authenticity, '📄')}
                ${renderDimensionCard5('内容关联度', relevance, '🔗')}
                ${renderDimensionCard5('合法合规性', legality, '⚖️')}
                ${renderDimensionCard5('完整与清晰度', completeness, '📋')}
                ${renderDimensionCard5('印证潜力', corroboration, '🔍')}
            </div>

            ${summary ? `
                <div class="evaluation-summary">
                    <h4>AI评估总结</h4>
                    <p>${summary}</p>
                </div>
            ` : ''}

            <div class="evaluation-actions">
                <button class="btn-primary" onclick="exportEvaluationReport('${evaluation.evidence_id}', 'pdf')">
                    📄 导出PDF报告
                </button>
                <button class="btn-secondary" onclick="exportEvaluationReport('${evaluation.evidence_id}', 'word')">
                    📝 导出Word报告
                </button>
            </div>
        </div>
    `;
}

/**
 * 渲染维度评分卡片（5维度版）
 */
function renderDimensionCard5(title, dimension, icon) {
    const reason = dimension.reason || '无';
    const weight = dimension.weight ? `${(dimension.weight * 100).toFixed(0)}%` : '';

    return `
        <div class="dimension-card">
            <div class="dimension-header">
                <span class="dimension-icon">${icon}</span>
                <span class="dimension-title">${title}</span>
                ${weight ? `<span class="dimension-weight">${weight}</span>` : ''}
            </div>
            <div class="dimension-score">
                <div class="score-bar">
                    <div class="score-fill" style="width: ${dimension.score * 10}%; background: ${getScoreColor5(dimension.score)}"></div>
                </div>
                <div class="score-value">${dimension.score}/10</div>
            </div>
            <div class="dimension-reason">${reason}</div>
        </div>
    `;
}

/**
 * 根据分数获取颜色（5维度版，0-10分制）
 */
function getScoreColor5(score) {
    if (score >= 8.5) return '#10b981';
    if (score >= 7.0) return '#3b82f6';
    if (score >= 5.0) return '#f59e0b';
    return '#ef4444';
}

/**
 * 显示评估历史记录
 */
async function showEvaluationHistory(evidenceId) {
    const history = await getEvaluationHistory(evidenceId);
    if (!history) return;

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>评估历史记录</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">x</button>
            </div>
            <div class="modal-body">
                <p>历史记录功能开发中...</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 暴露函数到全局作用域，供HTML中的onclick使用
window.getEvaluationDetail = getEvaluationDetail;
window.getEvaluationHistory = getEvaluationHistory;
window.showEvaluationHistory = showEvaluationHistory;
window.evaluateEvidence = evaluateEvidence;
window.batchEvaluateEvidence = batchEvaluateEvidence;
window.exportEvaluationReport = exportEvaluationReport;
window.getToken = getToken;
window.handle401Error = handle401Error;
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
