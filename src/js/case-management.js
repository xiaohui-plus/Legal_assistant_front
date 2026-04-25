// 案件管理功能

let currentPage = 1;
let currentStatus = '';
let currentSearch = '';
let editingCaseId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCaseList();
    loadCaseStatistics();
});

async function loadCaseList() {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return;
    }

    showLoading('加载案件列表...');

    try {
        const params = new URLSearchParams({
            page: currentPage,
            page_size: 20
        });

        if (currentStatus) {
            params.append('status', currentStatus);
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/cases?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        hideLoading();

        if (response.status === 401) {
            handle401Error();
            return;
        }

        const result = await response.json();

        if (response.ok && result.code === 200) {
            renderCaseList(result.data.cases);
            renderPagination(result.data);
        } else {
            showMessage(result.message || '加载失败', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('[loadCaseList] 错误:', error);
        showMessage('加载失败: ' + error.message, 'error');
    }
}

async function loadCaseStatistics() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cases/statistics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 200) {
                document.getElementById('totalCases').textContent = result.data.total_cases;
                document.getElementById('activeCases').textContent = result.data.active_cases;
                document.getElementById('closedCases').textContent = result.data.closed_cases;
                document.getElementById('totalEvidence').textContent = result.data.total_evidence;
            }
        }
    } catch (error) {
        console.error('[loadCaseStatistics] 错误:', error);
    }
}

function renderCaseList(cases) {
    const container = document.getElementById('caseList');

    if (!cases || cases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <p>暂无案件</p>
                <button class="btn-primary" onclick="showCreateCaseModal()">创建第一个案件</button>
            </div>
        `;
        return;
    }

    container.innerHTML = cases.map(caseItem => `
        <div class="case-card status-${caseItem.status}" onclick="showCaseDetail('${caseItem.id}')">
            <div class="case-card-header">
                <div>
                    <h3 class="case-title">${escapeHtml(caseItem.title)}</h3>
                    <span class="case-type">${escapeHtml(caseItem.case_type)}</span>
                </div>
                <span class="case-status ${caseItem.status}">
                    ${caseItem.status === 'active' ? '进行中' : caseItem.status === 'closed' ? '已结案' : '已归档'}
                </span>
            </div>
            ${caseItem.description ? `<div class="case-description">${escapeHtml(caseItem.description)}</div>` : ''}
            <div class="case-info-row">
                ${caseItem.opposing_party ? `<div class="case-info-item">👤 ${escapeHtml(caseItem.opposing_party)}</div>` : ''}
                ${caseItem.court ? `<div class="case-info-item">⚖️ ${escapeHtml(caseItem.court)}</div>` : ''}
                <div class="case-info-item">📎 ${caseItem.evidence_count || 0} 个证据</div>
                ${caseItem.filing_date ? `<div class="case-info-item">📅 ${formatDate(caseItem.filing_date)}</div>` : ''}
            </div>
            ${caseItem.tags && caseItem.tags.length > 0 ? `
                <div class="case-footer">
                    <div class="case-tags">
                        ${caseItem.tags.map(tag => `<span class="case-tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <div class="case-actions">
                        <button class="case-action-btn" onclick="event.stopPropagation(); editCase('${caseItem.id}')">编辑</button>
                        <button class="case-action-btn" onclick="event.stopPropagation(); goToEvidenceChain('${caseItem.id}')">证据链</button>
                        <button class="case-action-btn delete" onclick="event.stopPropagation(); deleteCase('${caseItem.id}')">归档</button>
                    </div>
                </div>
            ` : `
                <div class="case-footer">
                    <div></div>
                    <div class="case-actions">
                        <button class="case-action-btn" onclick="event.stopPropagation(); editCase('${caseItem.id}')">编辑</button>
                        <button class="case-action-btn" onclick="event.stopPropagation(); goToEvidenceChain('${caseItem.id}')">证据链</button>
                        <button class="case-action-btn delete" onclick="event.stopPropagation(); deleteCase('${caseItem.id}')">归档</button>
                    </div>
                </div>
            `}
        </div>
    `).join('');
}

function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');

    if (data.total_pages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    pageInfo.textContent = `${data.page} / ${data.total_pages}`;
}

function filterByStatus(status, btn) {
    currentStatus = status;
    currentPage = 1;

    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');

    loadCaseList();
}

function searchCases(keyword) {
    currentSearch = keyword;
    currentPage = 1;
    loadCaseList();
}

function goToPage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next') {
        currentPage++;
    }
    loadCaseList();
}

function showCreateCaseModal() {
    editingCaseId = null;
    document.getElementById('modalTitle').textContent = '新建案件';
    document.getElementById('submitBtn').textContent = '创建案件';
    document.getElementById('caseForm').reset();
    document.getElementById('createCaseModal').style.display = 'flex';
}

function closeCreateCaseModal() {
    document.getElementById('createCaseModal').style.display = 'none';
    editingCaseId = null;
}

async function editCase(caseId) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return;
    }

    showLoading('加载案件信息...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            if (result.code === 200) {
                const caseData = result.data;
                editingCaseId = caseId;

                document.getElementById('modalTitle').textContent = '编辑案件';
                document.getElementById('submitBtn').textContent = '保存修改';
                document.getElementById('caseTitle').value = caseData.title;
                document.getElementById('caseType').value = caseData.case_type;
                document.getElementById('caseNumber').value = caseData.case_number || '';
                document.getElementById('opposingParty').value = caseData.opposing_party || '';
                document.getElementById('court').value = caseData.court || '';
                document.getElementById('filingDate').value = caseData.filing_date ? caseData.filing_date.split('T')[0] : '';
                document.getElementById('deadline').value = caseData.deadline ? caseData.deadline.split('T')[0] : '';
                document.getElementById('caseDescription').value = caseData.description || '';
                document.getElementById('caseTags').value = caseData.tags ? caseData.tags.join(', ') : '';
                document.getElementById('caseNotes').value = caseData.notes || '';

                document.getElementById('createCaseModal').style.display = 'flex';
            }
        }
    } catch (error) {
        hideLoading();
        console.error('[editCase] 错误:', error);
        showMessage('加载失败: ' + error.message, 'error');
    }
}

document.getElementById('caseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return;
    }

    const tagsStr = document.getElementById('caseTags').value;
    const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t) : [];

    const caseData = {
        title: document.getElementById('caseTitle').value,
        case_type: document.getElementById('caseType').value,
        case_number: document.getElementById('caseNumber').value || null,
        opposing_party: document.getElementById('opposingParty').value || null,
        court: document.getElementById('court').value || null,
        filing_date: document.getElementById('filingDate').value || null,
        deadline: document.getElementById('deadline').value || null,
        description: document.getElementById('caseDescription').value || null,
        tags: tags,
        notes: document.getElementById('caseNotes').value || null
    };

    showLoading(editingCaseId ? '保存中...' : '创建中...');

    try {
        const url = editingCaseId
            ? `${API_BASE_URL}/api/v1/cases/${editingCaseId}`
            : `${API_BASE_URL}/api/v1/cases`;

        const method = editingCaseId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(caseData)
        });

        hideLoading();

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage(editingCaseId ? '保存成功' : '创建成功', 'success');
            closeCreateCaseModal();
            loadCaseList();
            loadCaseStatistics();
        } else {
            showMessage(result.message || '操作失败', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('[saveCase] 错误:', error);
        showMessage('操作失败: ' + error.message, 'error');
    }
});

async function showCaseDetail(caseId) {
    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return;
    }

    showLoading('加载案件详情...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            if (result.code === 200) {
                renderCaseDetail(result.data);
                document.getElementById('caseDetailModal').style.display = 'flex';
            }
        }
    } catch (error) {
        hideLoading();
        console.error('[showCaseDetail] 错误:', error);
        showMessage('加载失败: ' + error.message, 'error');
    }
}

function renderCaseDetail(caseData) {
    document.getElementById('detailTitle').textContent = caseData.title;

    const content = document.getElementById('caseDetailContent');
    content.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">基本信息</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">案件标题</span>
                    <span class="detail-value">${escapeHtml(caseData.title)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">案件类型</span>
                    <span class="detail-value">${escapeHtml(caseData.case_type)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">案件编号</span>
                    <span class="detail-value">${caseData.case_number ? escapeHtml(caseData.case_number) : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">案件状态</span>
                    <span class="detail-value">
                        <span class="case-status ${caseData.status}">
                            ${caseData.status === 'active' ? '进行中' : caseData.status === 'closed' ? '已结案' : '已归档'}
                        </span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">对方当事人</span>
                    <span class="detail-value">${caseData.opposing_party ? escapeHtml(caseData.opposing_party) : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">受理法院</span>
                    <span class="detail-value">${caseData.court ? escapeHtml(caseData.court) : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">立案日期</span>
                    <span class="detail-value">${caseData.filing_date ? formatDate(caseData.filing_date) : '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">截止日期</span>
                    <span class="detail-value">${caseData.deadline ? formatDate(caseData.deadline) : '-'}</span>
                </div>
            </div>
        </div>

        ${caseData.description ? `
            <div class="detail-section">
                <div class="detail-section-title">案件描述</div>
                <p>${escapeHtml(caseData.description)}</p>
            </div>
        ` : ''}

        ${caseData.notes ? `
            <div class="detail-section">
                <div class="detail-section-title">备注</div>
                <p>${escapeHtml(caseData.notes)}</p>
            </div>
        ` : ''}

        ${caseData.tags && caseData.tags.length > 0 ? `
            <div class="detail-section">
                <div class="detail-section-title">标签</div>
                <div class="case-tags">
                    ${caseData.tags.map(tag => `<span class="case-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        ` : ''}

        <div class="detail-section">
            <div class="detail-section-title">证据材料 (${caseData.evidence_count || 0})</div>
            <button class="btn-primary" onclick="goToEvidenceChain('${caseData.id}')">查看证据链</button>
        </div>
    `;
}

function closeCaseDetailModal() {
    document.getElementById('caseDetailModal').style.display = 'none';
}

async function deleteCase(caseId) {
    if (!confirm('确定要归档此案件吗？归档后案件将变为只读状态。')) {
        return;
    }

    const token = getToken();
    if (!token) {
        showMessage('请先登录', 'error');
        return;
    }

    showLoading('归档中...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        hideLoading();

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('案件已归档', 'success');
            loadCaseList();
            loadCaseStatistics();
        } else {
            showMessage(result.message || '归档失败', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('[deleteCase] 错误:', error);
        showMessage('归档失败: ' + error.message, 'error');
    }
}

function goToEvidenceChain(caseId) {
    localStorage.setItem('currentCaseId', caseId);
    window.location.href = '/pages/evidence-chain.html';
}

function getToken() {
    return localStorage.getItem('token') || localStorage.getItem('access_token');
}

function handle401Error() {
    alert('登录已过期，请重新登录');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.location.href = '/index.html';
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}
