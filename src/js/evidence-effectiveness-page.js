// ==================== 证据效力分析页面脚本 ====================

// DOMContentLoaded 事件绑定
document.addEventListener('DOMContentLoaded', () => {
    // 表单提交处理
    const form = document.getElementById('uploadEvidenceForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const caseType = document.getElementById('caseType').value;
            const fileInput = document.getElementById('evidenceFile');
            
            if (!caseType) {
                showMessage('请选择案件类型', 'error');
                return;
            }
            
            if (!fileInput.files || fileInput.files.length === 0) {
                showMessage('请选择文件', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            const fileName = file.name;
            
            // 推断证据类型
            let evidenceType = '书证';
            const ext = fileName.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                evidenceType = '视听资料';
            } else if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) {
                evidenceType = '视听资料';
            } else if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
                evidenceType = '视听资料';
            } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
                evidenceType = '书证';
            }
            
            // 先上传文件
            const formData = new FormData();
            formData.append('file', file);
            formData.append('case_id', 'effectiveness_' + Date.now());
            formData.append('device_fingerprint', localStorage.getItem('device_fingerprint') || 'browser_' + Date.now());
            
            showLoading('正在上传文件...');
            
            try {
                const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                const uploadResult = await uploadResponse.json();
                
                if (uploadResult.code !== 200 || !uploadResult.data.evidence_ids || uploadResult.data.evidence_ids.length === 0) {
                    hideLoading();
                    showMessage('文件上传失败: ' + (uploadResult.message || '未知错误'), 'error');
                    return;
                }
                
                const evidenceId = uploadResult.data.evidence_ids[0];
                showLoading('正在评估证据效力...');
                
                // 调用效力评估API
                const evalResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/effectiveness/evaluate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        evidence_id: evidenceId,
                        case_type: caseType,
                        evidence_type: evidenceType,
                        description: fileName,
                        case_description: ''
                    })
                });
                
                const evalResult = await evalResponse.json();
                
                hideLoading();
                
                if (evalResult.code === 200) {
                    // 渲染评估结果
                    renderEvaluationResult(evalResult.data, 'evaluationResultContainer');
                    // 切换到结果标签页
                    switchTab('evaluate');
                    showMessage('证据效力评估完成', 'success');
                } else {
                    showMessage('评估失败: ' + (evalResult.message || '未知错误'), 'error');
                }
            } catch (error) {
                hideLoading();
                console.error('[uploadEvidenceForm] 错误:', error);
                showMessage('操作失败: ' + error.message, 'error');
            }
        });
    }
    
    // Tab 切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

function switchTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    // 更新面板显示
    document.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.toggle('active', p.id === tabName + 'Tab');
    });
}
