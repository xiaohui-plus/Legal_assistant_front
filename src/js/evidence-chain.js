// 证据链管理功能
// API_BASE_URL 从 config.js 中获取

let currentCaseId = null;
let currentCaseList = [];
let timelineChart = null;
let radarChart = null;

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
    window.location.href = 'professional.html';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function () {
    await loadCaseList();
    await loadEvidenceList();
});

async function loadCaseList() {
    const token = getToken();
    if (!token) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cases?status=active&page=1&page_size=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 200) {
                currentCaseList = result.data.cases || [];
                renderCaseSelector();
                
                const savedCaseId = localStorage.getItem('currentCaseId');
                if (savedCaseId && currentCaseList.some(c => c.id === savedCaseId)) {
                    switchCase(savedCaseId);
                } else if (currentCaseList.length > 0) {
                    switchCase(currentCaseList[0].id);
                }
            }
        }
    } catch (error) {
        console.error('[loadCaseList] 错误:', error);
    }
}

function renderCaseSelector() {
    const selector = document.getElementById('caseSelector');
    const uploadSelector = document.getElementById('uploadCaseSelector');
    
    if (!selector) return;

    const options = currentCaseList.map(caseItem => 
        `<option value="${caseItem.id}">${escapeHtml(caseItem.title)} (${escapeHtml(caseItem.case_type)})</option>`
    ).join('');

    selector.innerHTML = '<option value="">请选择案件</option>' + options;
    
    if (uploadSelector) {
        uploadSelector.innerHTML = '<option value="">请选择案件</option>' + options;
    }
}

async function switchCase(caseId) {
    currentCaseId = caseId;
    localStorage.setItem('currentCaseId', caseId);

    const selector = document.getElementById('caseSelector');
    if (selector) selector.value = caseId;

    const uploadSelector = document.getElementById('uploadCaseSelector');
    if (uploadSelector) uploadSelector.value = caseId;

    if (caseId) {
        const caseItem = currentCaseList.find(c => c.id === caseId);
        if (caseItem) {
            document.getElementById('caseId').textContent = `案件ID: ${caseItem.id}`;
            document.getElementById('caseTitle').textContent = `案件名称: ${caseItem.title}`;
        }
    } else {
        document.getElementById('caseId').textContent = '案件ID: -';
        document.getElementById('caseTitle').textContent = '案件名称: -';
    }

    await loadEvidenceList();
}

async function loadEvidenceList() {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        window.location.href = 'professional.html';
        return;
    }

    if (!currentCaseId) {
        document.getElementById('evidenceList').innerHTML = '<div class="empty-state"><p>请先选择案件</p></div>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayEvidenceList(data);
            updateStats(data);
        } else {
            console.error('加载证据列表失败');
        }
    } catch (error) {
        console.error('加载证据列表失败:', error);
    }
}

function displayEvidenceList(data) {
    const container = document.getElementById('evidenceList');
    if (!container) return;

    const evidenceList = data.evidence_list || data || [];

    if (evidenceList.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无证据</p><button onclick="showUploadModal()">上传第一个证据</button></div>';
        return;
    }

    container.innerHTML = evidenceList.map(item => `
        <div class="evidence-item" data-id="${item.id || ''}">
            <div class="evidence-info">
                <div class="evidence-name">${item.file_name || item.name || '未命名证据'}</div>
                <div class="evidence-status">${item.status || '待识别'}</div>
            </div>
            <div class="evidence-actions">
                <button onclick="viewEvidence('${item.id}')">查看</button>
                <button onclick="deleteEvidence('${item.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function updateStats(data) {
    const evidenceList = data.evidence_list || data || [];
    document.getElementById('evidenceCount').textContent = evidenceList.length;
}

async function buildChain() {
    if (!currentCaseId) {
        alert('请先选择案件');
        return;
    }

    showLoading('正在构建证据链...');

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/chain/build/${currentCaseId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            showMessage('证据链构建成功', 'success');
            loadTimeline(result);
        } else {
            showMessage('证据链构建失败', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('构建证据链失败:', error);
        showMessage('构建证据链失败: ' + error.message, 'error');
    }
}

async function loadTimeline(chainData) {
    if (!timelineChart) {
        timelineChart = echarts.init(document.getElementById('timelineChart'));
    }

    const timeline = chainData.timeline || [];
    
    const option = {
        title: { text: '证据时序图', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: timeline.map(item => item.time || ''),
            axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value', name: '证据' },
        series: [{
            name: '证据',
            type: 'bar',
            data: timeline.map(item => ({
                value: 1,
                name: item.evidence_name
            })),
            label: {
                show: true,
                position: 'top',
                formatter: '{b}'
            }
        }]
    };

    timelineChart.setOption(option, true);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showUploadModal() {
    if (!currentCaseId) {
        alert('请先选择案件');
        return;
    }
    document.getElementById('uploadModal').style.display = 'flex';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

async function uploadEvidence(file) {
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', currentCaseId);

    const caseItem = currentCaseList.find(c => c.id === currentCaseId);
    if (caseItem) {
        formData.append('case_title', caseItem.title);
    }

    showLoading('正在上传证据...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            showMessage('证据上传成功', 'success');
            closeUploadModal();
            loadEvidenceList();
            return result;
        } else {
            showMessage('证据上传失败', 'error');
            return null;
        }
    } catch (error) {
        hideLoading();
        console.error('上传证据失败:', error);
        showMessage('上传证据失败: ' + error.message, 'error');
        return null;
    }
}

async function viewEvidence(id) {
    console.log('查看证据:', id);
    
    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }
    
    try {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (loadingOverlay) {
            if (loadingText) loadingText.textContent = '正在生成评估报告...';
            loadingOverlay.style.display = 'flex';
        }
        
        const evidenceResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!evidenceResponse.ok) {
            throw new Error('获取证据信息失败');
        }
        
        const evidenceData = await evidenceResponse.json();
        
        const reportResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                evidence_id: id,
                case_type: evidenceData.case_type || '其他',
                evidence_type: evidenceData.evidence_type || '书证',
                description: evidenceData.description || evidenceData.file_name || ''
            })
        });
        
        if (!reportResponse.ok) {
            throw new Error('生成评估报告失败');
        }
        
        const reportData = await reportResponse.json();
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        const sidebar = document.getElementById('evidenceSidebar');
        const sidebarContent = document.getElementById('sidebarContent');
        
        if (sidebar && sidebarContent) {
            sidebarContent.innerHTML = `
                <div class="report-header">
                    <h4>证据评估报告</h4>
                    <p class="evidence-name">${evidenceData.file_name || '未命名证据'}</p>
                </div>
                
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="summary-label">综合评分:</span>
                        <span class="summary-value">${reportData.data.overall.score}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">等级评定:</span>
                        <span class="summary-value">${reportData.data.overall.grade}</span>
                    </div>
                </div>
                
                <div class="report-content">
                    <h5>详细评估报告</h5>
                    <div class="report-text">${reportData.report.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            
            sidebar.style.display = 'block';
        }
        
    } catch (error) {
        console.error('查看证据失败:', error);
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        alert('查看证据失败: ' + error.message);
    }
}

async function deleteEvidence(id) {
    if (!confirm('确定要删除这个证据吗？')) {
        return;
    }

    const token = getToken();
    if (!token) {
        alert('请先登录');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/evidence/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showMessage('证据删除成功', 'success');
            loadEvidenceList();
        } else {
            showMessage('证据删除失败', 'error');
        }
    } catch (error) {
        console.error('删除证据失败:', error);
        showMessage('删除证据失败: ' + error.message, 'error');
    }
}

function batchAnalyze() {
    console.log('批量分析');
}

function exportDocuments() {
    console.log('导出文档');
}

function closeSidebar() {
    document.getElementById('evidenceSidebar').style.display = 'none';
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.classList.add('show'), 100);
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 3000);
}

function showLoading(text = '处理中...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) {
        if (loadingText) loadingText.textContent = text;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
