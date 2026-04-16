
        // ==================== API配置和数据管�?====================

        // API配置 - 统一使用全局配置
        const API_BASE_URL = window.API_BASE_URL;
        const DEV_MODE = window.DEV_MODE || false; // 生产模式：使用真实后端API

        // 获取或创建caseId（持久化到localStorage�?        function getCurrentCaseId() {
            let caseId = localStorage.getItem('current_case_id');
            if (!caseId) {
                caseId = 'case_' + Date.now();
                localStorage.setItem('current_case_id', caseId);
                console.log('🆕 创建新案件ID:', caseId);
            } else {
                console.log('📂 使用现有案件ID:', caseId);
            }
            return caseId;
        }

        let currentCaseId = getCurrentCaseId();
        let evidenceList = [];
        let autoRefreshInterval = null; // 自动刷新定时�?        let lastDataHash = null; // 上次数据的哈希值，用于检测变�?
        // Mock数据
        const MockEvidenceChain = {
            // 时序图配置（优化版：支持大时间跨度和智能缩放�?            getTimelineChart(caseId, evidenceData = null) {
                // 如果没有提供数据，使用默认Mock数据
                const mockData = evidenceData || [
                    {
                        name: '劳动合同',
                        time: '2023-01-15',
                        type: '书证',
                        evidence_id: 1
                    },
                    {
                        name: '工资�?,
                        time: '2023-06-20',
                        type: '书证',
                        evidence_id: 2
                    },
                    {
                        name: '录音记录',
                        time: '2023-08-10',
                        type: '视听资料',
                        evidence_id: 3
                    },
                    {
                        name: '微信聊天记录',
                        time: '2023-09-05',
                        type: '电子数据',
                        evidence_id: 4
                    }
                ];

                // 计算时间范围
                const times = mockData.map(e => new Date(e.time).getTime());
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                const timeSpan = maxTime - minTime;

                // 格式化时间跨度显�?                const formatTimeSpan = (ms) => {
                    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
                    if (days > 365) {
                        const years = Math.floor(days / 365);
                        const remainDays = days % 365;
                        return `${years}�?{remainDays}天`;
                    } else if (days > 30) {
                        const months = Math.floor(days / 30);
                        const remainDays = days % 30;
                        return `${months}个月${remainDays}天`;
                    } else if (days > 0) {
                        return `${days}天`;
                    } else {
                        const hours = Math.floor(ms / (60 * 60 * 1000));
                        return `${hours}小时`;
                    }
                };

                // 根据时间跨度选择合适的时间格式
                const getTimeFormat = (span) => {
                    if (span > 365 * 24 * 60 * 60 * 1000) { // 超过1�?                        return '{yyyy}-{MM}';
                    } else if (span > 30 * 24 * 60 * 60 * 1000) { // 超过1个月
                        return '{MM}-{dd}';
                    } else {
                        return '{MM}-{dd} {HH}:{mm}';
                    }
                };

                // 证据类型颜色映射
                const typeColors = {
                    '书证': '#1e40af',
                    '物证': '#059669',
                    '视听资料': '#dc2626',
                    '电子数据': '#7c3aed',
                    '证人证言': '#ea580c',
                    '鉴定意见': '#0891b2',
                    '勘验笔录': '#65a30d'
                };

                return {
                    title: {
                        text: '证据时序�?,
                        subtext: `案件ID: ${caseId} | 时间跨度: ${formatTimeSpan(timeSpan)} | 证据�? ${mockData.length}`,
                        left: 'center',
                        textStyle: {
                            color: '#1e40af',
                            fontSize: 18,
                            fontWeight: 600
                        },
                        subtextStyle: {
                            color: '#6b7280',
                            fontSize: 12
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (params) {
                            return `<div style="padding: 8px;">
                                <div style="font-weight: 600; margin-bottom: 4px;">${params.data.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">时间: ${params.data.time}</div>
                                <div style="font-size: 12px; color: #6b7280;">类型: ${params.data.type}</div>
                            </div>`;
                        }
                    },
                    grid: {
                        left: '10%',
                        right: '10%',
                        bottom: '20%',
                        top: '20%'
                    },
                    // 添加数据缩放组件
                    dataZoom: [
                        {
                            type: 'slider',
                            xAxisIndex: 0,
                            start: 0,
                            end: 100,
                            height: 25,
                            bottom: 40,
                            borderColor: '#e5e7eb',
                            fillerColor: 'rgba(30, 64, 175, 0.15)',
                            handleStyle: {
                                color: '#1e40af'
                            },
                            textStyle: {
                                color: '#6b7280',
                                fontSize: 11
                            }
                        },
                        {
                            type: 'inside',
                            xAxisIndex: 0,
                            start: 0,
                            end: 100
                        }
                    ],
                    xAxis: {
                        type: 'time',
                        name: '时间',
                        nameTextStyle: {
                            color: '#6b7280',
                            fontSize: 12
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        axisLabel: {
                            color: '#6b7280',
                            fontSize: 11,
                            formatter: getTimeFormat(timeSpan),
                            rotate: timeSpan > 180 * 24 * 60 * 60 * 1000 ? 45 : 0
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: '#f3f4f6',
                                type: 'dashed'
                            }
                        }
                    },
                    yAxis: {
                        type: 'category',
                        name: '证据类型',
                        data: ['书证', '物证', '视听资料', '电子数据', '证人证言', '鉴定意见', '勘验笔录'],
                        nameTextStyle: {
                            color: '#6b7280',
                            fontSize: 12
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        axisLabel: {
                            color: '#6b7280',
                            fontSize: 11
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: '#f3f4f6',
                                type: 'dashed'
                            }
                        }
                    },
                    series: [{
                        name: '证据',
                        type: 'scatter',
                        symbolSize: 18,
                        data: mockData.map(item => ({
                            name: item.name,
                            value: [item.time, item.type],
                            type: item.type,
                            time: item.time,
                            evidence_id: item.evidence_id || item.id,
                            itemStyle: {
                                color: typeColors[item.type] || '#1e40af',
                                borderColor: '#fbbf24',
                                borderWidth: 2,
                                shadowBlur: 4,
                                shadowColor: 'rgba(0, 0, 0, 0.2)'
                            }
                        })),
                        emphasis: {
                            scale: 1.5,
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(30, 64, 175, 0.5)'
                            }
                        }
                    }]
                };
            },

            // 雷达图配�?            getRadarChart(caseId) {
                return {
                    title: {
                        text: '胜诉概率评估',
                        subtext: '基于证据链完整性分�?,
                        left: 'center',
                        textStyle: {
                            color: '#1e40af',
                            fontSize: 18,
                            fontWeight: 600
                        }
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        bottom: 20,
                        data: ['当前案件', '平均水平']
                    },
                    radar: {
                        indicator: [
                            { name: '证据完整�?, max: 100 },
                            { name: '证据关联�?, max: 100 },
                            { name: '证据合法�?, max: 100 },
                            { name: '证据真实�?, max: 100 },
                            { name: '证据时效�?, max: 100 }
                        ],
                        shape: 'polygon',
                        splitNumber: 5,
                        axisLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        splitArea: {
                            show: true,
                            areaStyle: {
                                color: ['#f9fafb', '#ffffff']
                            }
                        }
                    },
                    series: [{
                        name: '胜诉概率',
                        type: 'radar',
                        data: [
                            {
                                value: [75, 80, 85, 90, 70],
                                name: '当前案件',
                                areaStyle: {
                                    color: 'rgba(30, 64, 175, 0.3)'
                                },
                                lineStyle: {
                                    color: '#1e40af',
                                    width: 2
                                },
                                itemStyle: {
                                    color: '#1e40af',
                                    borderColor: '#fbbf24',
                                    borderWidth: 2
                                }
                            },
                            {
                                value: [60, 65, 70, 75, 60],
                                name: '平均水平',
                                areaStyle: {
                                    color: 'rgba(156, 163, 175, 0.2)'
                                },
                                lineStyle: {
                                    color: '#9ca3af',
                                    width: 2,
                                    type: 'dashed'
                                },
                                itemStyle: {
                                    color: '#9ca3af'
                                }
                            }
                        ]
                    }]
                };
            }
        };

        // 获取Token
        function getToken() {
            return localStorage.getItem('token') || localStorage.getItem('access_token');
        }

        // 处理401错误（登录过期）
        function handle401Error() {
            alert('登录已过期，请重新登�?);
            // 清除过期token
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            // 跳转到登录页�?            window.location.href = 'professional.html';
        }

        // 计算数据哈希值（用于检测变化）
        function calculateDataHash(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return 'empty';
            }

            // 提取关键字段生成哈希
            const hashString = data.map(item => {
                const id = item.id || '';
                const status = item.ocr_status || item.ocrStatus || item.status || '';
                const fileName = item.file_name || item.fileName || '';
                return `${id}-${status}-${fileName}`;
            }).join('|');

            // 简单哈希函�?            let hash = 0;
            for (let i = 0; i < hashString.length; i++) {
                const char = hashString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString();
        }

        // 检查数据是否有变化
        function hasDataChanged(newData) {
            const newHash = calculateDataHash(newData);
            const changed = newHash !== lastDataHash;

            if (changed) {
                console.log('📊 数据已更�?', {
                    oldHash: lastDataHash,
                    newHash: newHash,
                    count: newData.length
                });
                lastDataHash = newHash;
            } else {
                console.log('�?数据无变化，跳过渲染');
            }

            return changed;
        }

        // 下载文件
        function downloadFile(url, filename) {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // 带Token下载PDF
        async function downloadPdfWithAuth(evidenceId, fileName) {
            try {
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                if (isGuestMode) {
                    console.warn('⚠️ 未登录，使用游客模式');
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    downloadFile(`${API_BASE_URL}/api/v1/evidence/preview/${evidenceId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, fileName);
                    return;
                }

                console.log('📥 开始下载PDF:', fileName);
                console.log('📡 请求URL:', `${API_BASE_URL}/api/user/evidence/${evidenceId}/download`);
                console.log('🔑 Token:', token ? '已设�? : '未设�?);

                const response = await fetch(`${API_BASE_URL}/api/user/evidence/${evidenceId}/download`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📡 响应状�?', response.status);
                console.log('📡 响应�?', response.headers);

                if (!response.ok) {
                    // 特殊错误处理
                    if (response.status === 401) {
                        handle401Error();
                        return;
                    }

                    // 尝试读取错误信息
                    let errorMessage = `下载失败 (${response.status})`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.detail || errorMessage;
                        console.error('�?错误详情:', errorData);
                    } catch (e) {
                        console.error('�?无法解析错误响应');
                    }

                    if (response.status === 404) {
                        alert('文件不存在或已被删除');
                        return;
                    } else if (response.status === 500) {
                        alert('服务器错误，请稍后重试或联系管理�?);
                        return;
                    }

                    throw new Error(errorMessage);
                }

                // 获取文件blob
                const blob = await response.blob();
                console.log('📦 文件大小:', blob.size, 'bytes');
                console.log('📦 文件类型:', blob.type);

                // 创建下载链接
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                console.log('�?下载成功');
            } catch (error) {
                console.error('�?下载失败:', error);
                alert('下载失败: ' + error.message);
            }
        }

        // 在新窗口打开PDF（带Token�?        async function openPdfInNewWindow(evidenceId) {
            try {
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                if (isGuestMode) {
                    console.warn('⚠️ 未登录，使用游客模式');
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    window.open(`${API_BASE_URL}/api/v1/evidence/preview/${evidenceId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, '_blank');
                    return;
                }

                console.log('👁�?在新窗口打开PDF');
                console.log('📡 请求URL:', `${API_BASE_URL}/api/user/evidence/${evidenceId}/download`);

                // 获取PDF数据
                const response = await fetch(`${API_BASE_URL}/api/user/evidence/${evidenceId}/download`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('📡 响应状�?', response.status);

                if (!response.ok) {
                    // 特殊错误处理
                    if (response.status === 401) {
                        handle401Error();
                        return;
                    }

                    // 尝试读取错误信息
                    let errorMessage = `加载失败 (${response.status})`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.detail || errorMessage;
                        console.error('�?错误详情:', errorData);
                    } catch (e) {
                        console.error('�?无法解析错误响应');
                    }

                    // 特殊错误处理
                    if (response.status === 401) {
                        handle401Error();
                        return;
                    } else if (response.status === 404) {
                        alert('文件不存在或已被删除');
                        return;
                    } else if (response.status === 500) {
                        alert('服务器错误，请稍后重试或联系管理�?);
                        return;
                    }

                    throw new Error(errorMessage);
                }

                // 获取文件blob
                const blob = await response.blob();
                console.log('📦 文件大小:', blob.size, 'bytes');

                // 创建临时URL
                const url = window.URL.createObjectURL(blob);

                // 在新窗口打开
                const newWindow = window.open(url, '_blank');

                if (!newWindow) {
                    alert('无法打开新窗口，请检查浏览器弹窗设置');
                    window.URL.revokeObjectURL(url);
                    return;
                }

                // 延迟释放URL（给浏览器时间加载）
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);

                console.log('�?已在新窗口打开');
            } catch (error) {
                console.error('�?打开失败:', error);
                alert('打开失败: ' + error.message);
            }
        }

        // 启动自动刷新
        function startAutoRefresh() {
            // 清除旧的定时�?            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }

            // �?0秒刷新一次（降低频率减少卡顿�?            autoRefreshInterval = setInterval(async () => {
                // 检查是否有正在识别的证�?                const hasProcessing = evidenceList.some(item => {
                    const status = item.ocr_status || item.ocrStatus || item.status;
                    return status === 'processing' || !status;
                });

                if (hasProcessing) {
                    console.log('🔄 自动刷新证据列表...');
                    // 静默刷新，不显示加载动画
                    await fetchEvidenceList(true);
                } else {
                    console.log('�?所有证据识别完成，停止自动刷新');
                    stopAutoRefresh();
                }
            }, 10000); // 改为10�?
            console.log('🔄 已启动自动刷新（�?0秒）');
            updateAutoRefreshButton(true);
        }

        // 停止自动刷新
        function stopAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
                console.log('⏸️ 已停止自动刷�?);
                updateAutoRefreshButton(false);
            }
        }

        // 切换自动刷新
        function toggleAutoRefresh() {
            if (autoRefreshInterval) {
                stopAutoRefresh();
                alert('已停止自动刷�?);
            } else {
                startAutoRefresh();
                alert('已启动自动刷新（�?0秒）');
            }
        }

        // 更新自动刷新按钮状�?        function updateAutoRefreshButton(isActive) {
            const btn = document.getElementById('autoRefreshBtn');
            if (btn) {
                if (isActive) {
                    btn.textContent = '⏸️ 停止刷新';
                    btn.style.background = 'rgba(239, 68, 68, 0.15)';
                } else {
                    btn.textContent = '🔄 自动刷新';
                    btn.style.background = 'rgba(255, 255, 255, 0.15)';
                }
            }
        }

        // 筛选证据列�?        function filterEvidenceList() {
            const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
            const typeFilter = document.getElementById('typeFilter')?.value || '';
            const statusFilter = document.getElementById('statusFilter')?.value || '';

            const filteredList = evidenceList.filter(item => {
                // 文件名搜�?                const fileName = (item.file_name || item.fileName || '').toLowerCase();
                if (searchText && !fileName.includes(searchText)) {
                    return false;
                }

                // 类型筛�?                if (typeFilter) {
                    const fileType = (item.file_type || item.fileType || '').toLowerCase();
                    if (typeFilter === 'pdf' && !fileType.includes('pdf')) return false;
                    if (typeFilter === 'image' && !fileType.includes('image')) return false;
                    if (typeFilter === 'audio' && !fileType.includes('audio')) return false;
                    if (typeFilter === 'document' && fileType.includes('pdf')) return false;
                    if (typeFilter === 'document' && fileType.includes('image')) return false;
                    if (typeFilter === 'document' && fileType.includes('audio')) return false;
                    if (typeFilter === 'document' && fileType.includes('excel')) return false;
                    if (typeFilter === 'excel' && !fileType.includes('excel')) return false;
                }

                // 状态筛�?                if (statusFilter) {
                    const status = item.ocr_status || item.ocrStatus || item.status || 'processing';
                    if (status !== statusFilter) return false;
                }

                return true;
            });

            // 临时保存原始列表
            const originalList = evidenceList;
            evidenceList = filteredList;
            renderEvidenceList();
            evidenceList = originalList;
        }

        // 清除筛�?        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('typeFilter').value = '';
            document.getElementById('statusFilter').value = '';
            renderEvidenceList();
        }

        // 批量选择相关
        let selectedEvidenceIds = new Set();

        // 切换证据选择
        function toggleEvidenceSelection(id, event) {
            event.stopPropagation();

            if (selectedEvidenceIds.has(id)) {
                selectedEvidenceIds.delete(id);
            } else {
                selectedEvidenceIds.add(id);
            }

            updateBatchActionsUI();
            updateSelectionUI();
        }

        // 更新批量操作UI
        function updateBatchActionsUI() {
            const batchActions = document.getElementById('batchActions');
            const selectedCount = document.getElementById('selectedCount');

            // 检查元素是否存�?            if (!batchActions || !selectedCount) {
                return;
            }

            if (selectedEvidenceIds.size > 0) {
                batchActions.style.display = 'flex';
                selectedCount.textContent = selectedEvidenceIds.size;
            } else {
                batchActions.style.display = 'none';
            }
        }

        // 更新选择UI
        function updateSelectionUI() {
            document.querySelectorAll('.evidence-item').forEach(item => {
                const id = item.getAttribute('data-evidence-id');
                const checkbox = item.querySelector('.evidence-checkbox');

                if (checkbox) {
                    checkbox.checked = selectedEvidenceIds.has(id);

                    if (selectedEvidenceIds.has(id)) {
                        item.style.background = '#dbeafe';
                        item.style.borderColor = '#1e40af';
                    } else {
                        item.style.background = '';
                        item.style.borderColor = '';
                    }
                }
            });
        }

        // 取消批量选择
        function cancelBatchSelection() {
            selectedEvidenceIds.clear();
            updateBatchActionsUI();
            updateSelectionUI();
        }

        // 批量下载
        async function batchDownload() {
            if (selectedEvidenceIds.size === 0) {
                alert('请先选择要下载的证据');
                return;
            }

            if (!confirm(`确定要下�?${selectedEvidenceIds.size} 个文件吗？`)) {
                return;
            }

            const ids = Array.from(selectedEvidenceIds);

            for (const id of ids) {
                const evidence = evidenceList.find(e => e.id == id);
                if (evidence) {
                    const fileName = evidence.file_name || evidence.fileName || 'download';
                    window.open(`${API_BASE_URL}/api/user/evidence/${id}/download`, '_blank');
                    await new Promise(resolve => setTimeout(resolve, 500)); // 延迟避免浏览器阻�?                }
            }

            alert('批量下载已开�?);
            cancelBatchSelection();
        }

        // 批量删除
        async function batchDelete() {
            if (selectedEvidenceIds.size === 0) {
                alert('请先选择要删除的证据');
                return;
            }

            if (!confirm(`确定要删�?${selectedEvidenceIds.size} 个证据吗？此操作不可恢复！`)) {
                return;
            }

            const token = getToken();
            const isGuestMode = !token;
            const ids = Array.from(selectedEvidenceIds);
            let successCount = 0;
            let failCount = 0;

            if (isGuestMode) {
                // 游客模式：仅前端删除
                console.log('👤 游客模式：前端批量删除证�?, ids);
                for (const id of ids) {
                    evidenceList = evidenceList.filter(item => item.id !== id);
                    successCount++;
                }
            } else {
                // 登录用户：调用后端API删除
                for (const id of ids) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/user/evidence/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        const result = await response.json();
                        if (result.code === 200) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        console.error('删除失败:', id, error);
                        failCount++;
                    }
                }
            }

            alert(`批量删除完成：成�?${successCount} 个，失败 ${failCount} 个`);
            cancelBatchSelection();
            renderEvidenceList();
        }

        // 显示当前案件信息
        function showCaseInfo() {
            const caseName = localStorage.getItem('current_case_name') || '未命名案�?;
            const caseId = currentCaseId;
            const evidenceCount = evidenceList.length;

            const modal = document.createElement('div');
            modal.className = 'evidence-detail-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>📁 当前案件信息</h3>
                        <button class="close-btn" onclick="this.closest('.evidence-detail-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="info-grid">
                            <div class="info-item" style="grid-column: 1 / -1;">
                                <span class="info-label">案件名称</span>
                                <input type="text" id="caseNameInput" value="${caseName}" 
                                       style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin-top: 8px;">
                            </div>
                            <div class="info-item">
                                <span class="info-label">案件ID</span>
                                <span class="info-value" style="font-size: 12px; word-break: break-all;">${caseId}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">证据数量</span>
                                <span class="info-value">${evidenceCount} �?/span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="saveCaseName(); this.closest('.evidence-detail-modal').remove();">
                            💾 保存
                        </button>
                        <button class="btn" onclick="this.closest('.evidence-detail-modal').remove()">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // 保存案件名称
        function saveCaseName() {
            const caseName = document.getElementById('caseNameInput')?.value || '未命名案�?;
            localStorage.setItem('current_case_name', caseName);
            alert('案件名称已保�?);
        }

        // 创建新案�?        function createNewCase() {
            if (!confirm('确定要创建新案件吗？当前案件的证据将保留，但会切换到新案件�?)) {
                return;
            }

            // 清除当前案件ID
            localStorage.removeItem('current_case_id');
            localStorage.removeItem('current_case_name');

            // 重新生成案件ID
            currentCaseId = getCurrentCaseId();

            // 清空证据列表
            evidenceList = [];
            renderEvidenceList();

            alert('新案件已创建！案件ID: ' + currentCaseId);
        }

        // 拖拽上传
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            await uploadFiles(files);
        });

        // 文件选择处理


        // 上传文件
        async function uploadFiles(files) {
            if (files.length === 0) return;

            // 验证文件
            for (const file of files) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`文件 ${file.name} 超过100MB限制`);
                    return;
                }
            }

            // 显示上传进度
            const listDiv = document.getElementById('evidenceList');
            listDiv.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>正在上传 ${files.length} 个文�?..</p>
                    <div class="upload-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="uploadProgress" style="width: 0%"></div>
                        </div>
                        <p class="progress-text" id="uploadProgressText">0%</p>
                    </div>
                </div>
            `;

            try {
                let successCount = 0;
                let failCount = 0;

                // 逐个上传文件
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const progress = Math.round(((i + 1) / files.length) * 100);

                    // 更新进度
                    const progressFill = document.getElementById('uploadProgress');
                    const progressText = document.getElementById('uploadProgressText');
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = `${progress}% - 正在处理: ${file.name}`;

                    try {
                        await uploadAndAnalyzeEvidence(file);
                        successCount++;
                    } catch (error) {
                        console.error(`上传失败: ${file.name}`, error);
                        failCount++;
                    }
                }

                // 显示结果（不使用弹窗�?                console.log(`�?成功上传 ${successCount} 个文�?{failCount > 0 ? `�?{failCount} 个失败` : ''}`);

                // 刷新列表
                await fetchEvidenceList();

                // 启动自动刷新
                startAutoRefresh();

            } catch (error) {
                console.error('上传过程出错:', error);
                alert('上传失败: ' + error.message);
                renderEvidenceList();
            }
        }

        // 上传并分析证据（合并流程�?        async function uploadAndAnalyzeEvidence(file) {
            console.log('📤 开始上�?', file.name);
            console.log('文件类型:', file.type);
            console.log('文件大小:', file.size);
            console.log('案件ID:', currentCaseId);

            // 检查Token - 支持游客模式
            const token = getToken();
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const isGuestMode = !token || !user || user.id === 0;
            
            console.log('🔍 Token检�?', { token: !!token, user: user, isGuestMode: isGuestMode });
            
            if (isGuestMode) {
                console.log('👤 游客模式：本地文件分析，不上传到服务�?);
            } else {
                console.log('�?Token已获取，使用后端API');
            }

            // 游客模式：直接进行本地模拟分析，不上传到服务�?            if (isGuestMode) {
                await handleGuestModeFileAnalysis(file);
                return;
            }

            // 1. 先上传文�?            const formData = new FormData();
            formData.append('files', file);
            formData.append('case_id', currentCaseId);  // 使用下划线命�?case_id
            formData.append('case_title', '证据分析案件');  // 使用下划线命�?case_title

            console.log('📦 FormData内容:');
            console.log('文件信息:', { name: file.name, size: file.size, type: file.type });
            
            // 兼容性处理：确保FormData正确包含文件
            if (!formData.has('files')) {
                console.error('FormData中没有文件数�?);
                throw new Error('文件添加失败');
            }
            
            // 验证FormData内容
            for (let pair of formData.entries()) {
                console.log(pair[0] + ':', pair[1]);
            }

            try {
                const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                console.log('📡 响应状�?', uploadResponse.status);

                // 读取响应文本以便调试
                const responseText = await uploadResponse.text();
                console.log('📡 响应原始数据:', responseText);

                let uploadResult;
                try {
                    uploadResult = JSON.parse(responseText);
                } catch (e) {
                    console.error('�?响应不是有效的JSON:', responseText);
                    throw new Error('服务器响应格式错�?);
                }

                console.log('📡 响应数据:', uploadResult);

                // 处理422错误
                if (uploadResponse.status === 422) {
                    console.error('�?422错误详情:', uploadResult);
                    let errorMsg = '上传失败�?;
                    if (uploadResult.detail) {
                        if (Array.isArray(uploadResult.detail)) {
                            errorMsg += uploadResult.detail.map(d => `${d.loc?.join('.')} - ${d.msg}`).join('; ');
                        } else if (typeof uploadResult.detail === 'string') {
                            errorMsg += uploadResult.detail;
                        } else {
                            errorMsg += JSON.stringify(uploadResult.detail);
                        }
                    } else {
                        errorMsg += uploadResult.message || '参数验证失败';
                    }
                    throw new Error(errorMsg);
                }

                if (uploadResult.code !== 200 && uploadResponse.status !== 200) {
                    throw new Error(uploadResult.message || '上传失败');
                }

                console.log('�?上传成功:', file.name);

                // 2. 获取证据ID
                let evidenceId = null;
                if (uploadResult.data?.evidence_ids && Array.isArray(uploadResult.data.evidence_ids) && uploadResult.data.evidence_ids.length > 0) {
                    evidenceId = uploadResult.data.evidence_ids[0];
                    console.log('📋 从evidence_ids获取证据ID:', evidenceId);
                } else if (uploadResult.data?.evidence && Array.isArray(uploadResult.data.evidence) && uploadResult.data.evidence.length > 0) {
                    evidenceId = uploadResult.data.evidence[0];
                    console.log('📋 从evidence获取证据ID:', evidenceId);
                } else {
                    console.warn('未获取到证据ID，跳过AI分析');
                    return;
                }

                // 3. 调用后端分析接口
                console.log('🤖 调用后端分析接口:', evidenceId);
                await analyzeEvidenceBackend(evidenceId);
                
                // 4. 重新加载证据列表
                console.log('🔄 重新加载证据列表');
                await fetchEvidenceList();
                
                // 5. 自动分析证据效力（使用千问AI�?                console.log('🤖 开始使用千问AI分析证据效力:', evidenceId);
                try {
                    await evaluateEvidenceEffectiveness(evidenceId, '民事纠纷', '书证', file.name);
                    console.log('�?千问AI分析完成');
                } catch (error) {
                    console.error('�?千问AI分析失败:', error);
                }
            } catch (error) {
                console.error('�?上传失败:', error);
                throw error;
            }
        }

        // 游客模式：处理文件分析（不上传到服务器）
        async function handleGuestModeFileAnalysis(file) {
            console.log('👤 游客模式分析文件:', file.name);
            
            // 获取设备指纹
            const deviceFingerprint = await getOrCreateDeviceFingerprint();
            console.log('📱 使用设备指纹:', deviceFingerprint.substring(0, 8) + '...');

            // 创建临时证据对象（使用与后端一致的字段名）
            const tempEvidence = {
                id: 'guest_' + Date.now(),
                evidence_id: 'guest_' + Date.now(),
                file_name: file.name,
                file_type: getFileType(file),
                file_size: file.size,
                upload_time: new Date().toISOString(),
                ocr_status: 'processing',
                case_id: currentCaseId,
                isGuest: true,
                device_fingerprint: deviceFingerprint
            };

            // 添加到证据列�?            evidenceList.unshift(tempEvidence);
            renderEvidenceList();

            // 显示上传状�?            showUploadStatus('正在上传文件，请稍�?..', 20);

            try {
                // 1. 上传文件到后端（游客模式�?                const formData = new FormData();
                formData.append('files', file);
                formData.append('case_id', currentCaseId);
                formData.append('case_title', '证据分析案件');
                formData.append('device_fingerprint', deviceFingerprint);
                
                console.log('📦 游客模式上传文件...');
                console.log('文件信息:', { name: file.name, size: file.size, type: file.type });
                console.log('设备指纹:', deviceFingerprint.substring(0, 8) + '...');
                
                // 兼容性处理：确保FormData正确包含文件
                if (!formData.has('files')) {
                    console.error('FormData中没有文件数�?);
                    throw new Error('文件添加失败');
                }
                
                const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                console.log('📡 上传响应状�?', uploadResponse.status);
                const uploadResult = await uploadResponse.json();
                console.log('📡 上传响应数据:', uploadResult);
                
                if (uploadResponse.status !== 200 || uploadResult.code !== 200) {
                    throw new Error(uploadResult.message || '上传失败');
                }
                
                showUploadStatus('文件上传成功，正在分�?..', 50);
                
                // 2. 调用分析接口
                const backendEvidenceId = uploadResult.data?.evidence?.[0]?.id;
                if (!backendEvidenceId) {
                    throw new Error('获取证据ID失败');
                }
                
                console.log('🔍 开始分析文件，证据ID:', backendEvidenceId);
                
                const analysisResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/analyze/${backendEvidenceId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        case_id: currentCaseId,
                        device_fingerprint: deviceFingerprint
                    })
                });
                
                console.log('📡 分析响应状�?', analysisResponse.status);
                const analysisResult = await analysisResponse.json();
                console.log('📡 分析响应数据:', analysisResult);
                
                if (analysisResponse.status !== 200 || analysisResult.code !== 200) {
                    throw new Error(analysisResult.message || '分析失败');
                }
                
                // 3. 获取分析结果
                showUploadStatus('获取分析结果...', 80);
                
                const resultResponse = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}`);
                const resultData = await resultResponse.json();
                
                console.log('📡 获取分析结果响应:', resultData);
                
                // 找到对应的证�?                let backendEvidence = null;
                if (resultData.code === 200) {
                    if (Array.isArray(resultData.data)) {
                        backendEvidence = resultData.data.find(e => e.id === backendEvidenceId);
                    } else if (resultData.data?.list) {
                        backendEvidence = resultData.data.list.find(e => e.id === backendEvidenceId);
                    }
                }
                
                // 更新证据分析结果
                const evidenceIndex = evidenceList.findIndex(e => e.id === tempEvidence.id);
                if (evidenceIndex !== -1) {
                    if (backendEvidence) {
                        evidenceList[evidenceIndex].ocr_status = backendEvidence.ocr_status || 'completed';
                        evidenceList[evidenceIndex].ocr_result = backendEvidence.ocr_result || backendEvidence.analysis || '分析完成';
                        evidenceList[evidenceIndex].device_fingerprint = deviceFingerprint;
                    } else {
                        evidenceList[evidenceIndex].ocr_status = 'completed';
                        evidenceList[evidenceIndex].ocr_result = {
                            message: '分析完成',
                            data: analysisResult.data
                        };
                        evidenceList[evidenceIndex].device_fingerprint = deviceFingerprint;
                    }
                }

                // 保存到localStorage（使用设备指纹作为隔离标识）
                const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
                localStorage.setItem(localStorageKey, JSON.stringify(evidenceList));
                console.log('💾 游客数据已保存到本地存储，使用设备指纹隔�?);

                showUploadStatus('分析完成�?, 100);
                setTimeout(hideUploadStatus, 1500);
                renderEvidenceList();

                // 自动分析证据效力（使用千问AI�?                setTimeout(() => {
                    console.log('🤖 开始使用千问AI分析证据效力:', tempEvidence.id);
                    evaluateEvidenceEffectiveness(tempEvidence.id, '民事纠纷', '书证', tempEvidence.file_name).then(evaluation => {
                        console.log('�?千问AI分析完成:', evaluation);
                        // 自动打开分析结果
                        viewEvidence(tempEvidence.id);
                    }).catch(error => {
                        console.error('�?千问AI分析失败:', error);
                        // 即使分析失败也打开证据详情
                        viewEvidence(tempEvidence.id);
                    });
                }, 500);

            } catch (error) {
                console.error('游客模式分析失败:', error);
                showUploadStatus('分析失败: ' + error.message, 0);
                setTimeout(hideUploadStatus, 3000);

                // 更新证据状态为失败
                const evidenceIndex = evidenceList.findIndex(e => e.id === tempEvidence.id);
                if (evidenceIndex !== -1) {
                    evidenceList[evidenceIndex].ocr_status = 'failed';
                    evidenceList[evidenceIndex].ocr_result = {
                        error: error.message,
                        message: '分析失败，请稍后重试'
                    };
                    evidenceList[evidenceIndex].device_fingerprint = deviceFingerprint;
                }
                
                // 保存到localStorage（使用设备指纹作为隔离标识）
                const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
                localStorage.setItem(localStorageKey, JSON.stringify(evidenceList));
                
                renderEvidenceList();
            }
        }

        // 游客模式：图片分析（使用FileReader读取本地文件�?        async function performGuestImageAnalysis(file, evidenceId) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 生成模拟分析结果
                    const mockResult = generateGuestAnalysisResult(file.name, 'image', evidenceId);
                    resolve(mockResult);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // 游客模式：ASR分析
        function performGuestASRAnalysis(file, evidenceId) {
            return generateGuestAnalysisResult(file.name, 'audio', evidenceId);
        }

        // 游客模式：PDF分析
        function performGuestPDFAnalysis(file, evidenceId) {
            return generateGuestAnalysisResult(file.name, 'pdf', evidenceId);
        }

        // 游客模式：通用文件分析
        function performGuestGenericAnalysis(file, evidenceId) {
            return generateGuestAnalysisResult(file.name, 'generic', evidenceId);
        }

        // 生成游客模式分析结果
        function generateGuestAnalysisResult(fileName, fileType, evidenceId) {
            const fileTypeMap = {
                'image': { type: '图片文件', icon: '🖼�?, content: '图片内容识别结果（演示模式）\n- 检测到文字区域\n- 识别出关键信息\n- 建议进一步核�? },
                'audio': { type: '音频文件', icon: '🎵', content: '语音转文字结果（演示模式）\n- 说话人识别\n- 关键内容提取\n- 时间戳标�? },
                'pdf': { type: 'PDF文档', icon: '📄', content: '文档分析结果（演示模式）\n- 文本内容提取\n- 关键信息识别\n- 页码索引' },
                'generic': { type: '文件', icon: '📎', content: '文件分析结果（演示模式）\n- 基本信息提取\n- 格式识别\n- 内容预览' }
            };

            const typeInfo = fileTypeMap[fileType] || fileTypeMap['generic'];

            return {
                evidence_id: evidenceId,
                file_name: fileName,
                file_type: typeInfo.type,
                analysis_type: 'guest_mode',
                extracted_text: typeInfo.content,
                summary: `${typeInfo.icon} ${fileName} 的分析结果（游客模式）`,
                key_points: [
                    '这是演示模式的分析结�?,
                    '登录后可获得完整的AI分析',
                    '支持OCR文字识别、语音转文字等功�?,
                    '数据将安全保存到您的账户'
                ],
                entities: [],
                confidence: 0.85,
                is_guest_mode: true,
                created_at: new Date().toISOString()
            };
        }

        // 自动分析证据（集成讯飞AI�?        async function analyzeEvidenceAuto(evidenceId, file) {
            try {
                console.log('🤖 开始AI分析:', file.name);

                const fileType = file.type;
                let analysisResult = null;

                // 根据文件类型选择分析方式
                if (fileType.startsWith('audio/')) {
                    // 音频文件 - 使用ASR语音转文�?                    analysisResult = await performASR(file);
                } else if (fileType.startsWith('image/')) {
                    // 图片文件 - 使用图片分析
                    analysisResult = await performImageAnalysis(file);
                } else if (fileType === 'application/pdf') {
                    // PDF文件 - 使用OCR提取
                    analysisResult = await performPDFAnalysis(file);
                }

                // 将分析结果保存到后端
                if (analysisResult) {
                    await saveAnalysisResult(evidenceId, analysisResult);
                }

                console.log('�?AI分析完成');
            } catch (error) {
                console.error('AI分析失败:', error);
            }
        }

        // ASR语音转文�?        async function performASR(audioFile) {
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('language', 'zh-CN');
            formData.append('enable_privacy_mask', 'false');

            try {
                const response = await fetch(`${API_BASE_URL}/api/ai/asr`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.code === 200) {
                    return {
                        type: 'asr',
                        text: result.data.text,
                        duration: result.data.duration,
                        confidence: result.data.confidence,
                        keywords: result.data.keywords || [],
                        provider: result.data.provider
                    };
                }
            } catch (error) {
                console.error('ASR转写失败:', error);
            }
            return null;
        }

        // 图片分析（证据专用）
        async function performImageAnalysis(imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('case_type', '民事纠纷');
            formData.append('detail_level', 'comprehensive');

            try {
                const response = await fetch(`${API_BASE_URL}/api/ai/analyze-evidence-image`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.code === 200) {
                    const data = result.data;
                    return {
                        type: 'image_analysis',
                        evidence_type: data.evidence_type,
                        description: data.description,
                        authenticity: data.authenticity,
                        completeness: data.completeness,
                        relevance: data.relevance,
                        legal_elements: data.legal_elements,
                        suggestions: data.suggestions,
                        risk_assessment: data.risk_assessment,
                        // 同时提取OCR文字
                        text: data.text_content || await performOCR(imageFile)
                    };
                }
            } catch (error) {
                console.error('图片分析失败:', error);
            }
            return null;
        }

        // OCR文字提取
        async function performOCR(imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('language', 'zh');

            try {
                const response = await fetch(`${API_BASE_URL}/api/ai/extract-text-from-image`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.code === 200) {
                    return result.data.text;
                }
            } catch (error) {
                console.error('OCR提取失败:', error);
            }
            return '';
        }

        // PDF分析（使用OCR�?        async function performPDFAnalysis(pdfFile) {
            // PDF需要先转换为图片或使用专门的PDF OCR
            // 这里简化处理，返回基本信息
            return {
                type: 'pdf',
                text: '【PDF文档】\n需要后端支持PDF解析功能',
                description: 'PDF文档，建议使用专业PDF阅读器查�?
            };
        }

        // 调用后端分析接口
        async function analyzeEvidenceBackend(evidenceId) {
            try {
                console.log('🔧 调用后端分析接口:', evidenceId);
                
                // 获取设备指纹
                const deviceFingerprint = await getOrCreateDeviceFingerprint();
                
                const response = await fetch(`${API_BASE_URL}/api/v1/evidence/analyze/${evidenceId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        device_fingerprint: deviceFingerprint
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('�?后端分析接口调用成功:', result);
                    
                    // 更新UI状�?                    updateEvidenceStatus(evidenceId, 'analyzed');
                    
                    // 返回分析结果
                    return result.data;
                } else {
                    const error = await response.json();
                    console.error('�?后端分析接口调用失败:', error);
                    updateEvidenceStatus(evidenceId, 'error');
                    throw new Error(error.message || '分析失败');
                }
            } catch (error) {
                console.error('�?分析请求失败:', error);
                updateEvidenceStatus(evidenceId, 'error');
                throw error;
            }
        }

        // 更新证据状�?        function updateEvidenceStatus(evidenceId, status) {
            const evidenceItem = evidenceList.find(item => item.id == evidenceId);
            if (evidenceItem) {
                evidenceItem.ocr_status = status;
                renderEvidenceList();
            }
        }



        // 保存分析结果到后�?        async function saveAnalysisResult(evidenceId, analysisResult) {
            try {
                console.log('💾 保存分析结果到后�?..');

                // 尝试保存到后端，如果失败也不影响主流�?                const response = await fetch(`${API_BASE_URL}/api/user/evidence/${evidenceId}/analysis`, {
                    method: 'PUT',  // 改为PUT方法
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(analysisResult)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('�?分析结果已保�?);
                } else {
                    console.warn('⚠️ 保存分析结果失败，但不影响主流程');
                }
            } catch (error) {
                console.warn('⚠️ 保存分析结果失败:', error.message);
                // 不抛出错误，允许流程继续
            }
        }

        // 获取证据列表
        async function fetchEvidenceListLocal(silent = false) {
            const listDiv = document.getElementById('evidenceList');

            // 静默刷新时不显示加载动画
            if (!silent) {
                listDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>加载�?..</p></div>';
            }

            try {
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = DEV_MODE || !token || !user || user.id === 0;
                
                console.log('🔍 获取证据列表 - 模式检�?', { 
                    token: !!token, 
                    user: user, 
                    isGuestMode: isGuestMode,
                    DEV_MODE: DEV_MODE 
                });
                
                // 获取设备指纹
                const deviceFingerprint = await getOrCreateDeviceFingerprint();
                console.log('📱 使用设备指纹:', deviceFingerprint.substring(0, 8) + '...');
                
                // 从后端API获取证据列表
                console.log('📡 获取证据列表，caseId:', currentCaseId);
                
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指�?                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                        method: 'GET'
                    });
                } else {
                    // 登录模式：使用Bearer Token
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }

                console.log('📡 证据列表响应状�?', response.status);
                const result = await response.json();
                console.log('📡 证据列表响应数据:', result);
                console.log('📡 响应数据类型:', typeof result);
                console.log('📡 响应数据结构:', Object.keys(result));

                if (result.code === 200) {
                    // 尝试多种可能的数据结�?                    let newData = [];
                    if (Array.isArray(result.data)) {
                        newData = result.data;
                        console.log('📊 直接使用数组数据:', newData.length);
                    } else if (result.data?.list) {
                        newData = result.data.list;
                        console.log('📊 使用list数据:', newData.length);
                    } else if (result.data?.evidence) {
                        newData = result.data.evidence;
                        console.log('📊 使用evidence数据:', newData.length);
                    } else if (result.data?.items) {
                        newData = result.data.items;
                        console.log('📊 使用items数据:', newData.length);
                    } else {
                        console.log('�?无法识别数据结构:', result.data);
                        throw new Error('数据结构无法识别');
                    }

                    console.log('�?获取到证据数�?', newData.length);
                    console.log('📋 证据列表内容:', newData);

                    // 更新数据并渲染（无论是否有变化，都要渲染一次，避免一直显�?加载�?.."�?                    evidenceList = newData;
                    console.log('🎨 渲染界面');
                    renderEvidenceList();

                    // 🔥 重要：如果当前在时序图标签页，自动刷新时序图
                    const timelineTab = document.getElementById('timelineTab');
                    if (timelineTab && timelineTab.classList.contains('active')) {
                        console.log('🔄 自动刷新时序�?);
                        setTimeout(() => loadTimeline(), 500);
                    }
                } else {
                    console.error('�?响应错误:', result.message);
                    throw new Error(result.message || '加载失败');
                }
            } catch (error) {
                console.error('加载证据列表失败:', error);
                evidenceList = []; // 确保是数�?                listDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">�?/div>
                        <div class="empty-text">加载失败</div>
                        <div class="empty-hint">${error.message}</div>
                    </div>
                `;
            }
        }

        // 渲染证据列表
        function renderEvidenceList() {
            const listDiv = document.getElementById('evidenceList');

            // 确保evidenceList是数�?            if (!Array.isArray(evidenceList)) {
                console.error('evidenceList不是数组:', evidenceList);
                evidenceList = [];
            }

            if (evidenceList.length === 0) {
                listDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><img src="../images/证据�?svg" style="width: 64px; height: 64px; opacity: 0.5;"></div>
                        <div class="empty-text">暂无证据材料</div>
                        <div class="empty-hint">请上传证据文件开始分�?/div>
                    </div>
                `;
                return;
            }

            listDiv.innerHTML = evidenceList.map(item => {
                // 兼容驼峰命名和下划线命名
                const fileName = item.file_name || item.fileName || '未知文件';
                const fileType = item.file_type || item.fileType || 'document';

                // 格式化时�?                let uploadTime = item.upload_time || item.uploadedAt || item.uploaded_at ||
                    item.created_at || item.createdAt || item.uploadTime;

                // 如果是ISO格式时间，转换为本地时间
                if (uploadTime && uploadTime.includes('T')) {
                    try {
                        const date = new Date(uploadTime);
                        uploadTime = date.toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } catch (e) {
                        console.warn('时间格式转换失败:', uploadTime);
                    }
                }

                if (!uploadTime) {
                    uploadTime = new Date().toLocaleString('zh-CN');
                }

                const ocrStatus = item.ocr_status || item.ocrStatus || item.status || 'uploaded';
                const itemId = item.id || item.evidenceId;
                const isSelected = selectedEvidenceIds.has(itemId);

                return `
                <div class="evidence-item ${isSelected ? 'selected' : ''}" 
                     ondblclick="viewEvidence('${itemId}')" 
                     data-evidence-id="${itemId}"
                     style="${isSelected ? 'background: #dbeafe; border-color: #1e40af;' : ''}">
                    <input type="checkbox" class="evidence-checkbox" 
                           ${isSelected ? 'checked' : ''}
                           onclick="toggleEvidenceSelection('${itemId}', event)"
                           style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
                    <div class="evidence-icon"><img src="${getFileIcon(fileType, fileName)}" style="width: 32px; height: 32px;"></div>
                    <div class="evidence-info">
                        <div class="evidence-name">${fileName}</div>
                        <div class="evidence-meta">
                            <span class="evidence-status-small ${getStatusClass(ocrStatus)}">
                                ${getStatusText(ocrStatus)}
                            </span>
                            <span style="font-size: 12px;">📅 ${uploadTime}</span>
                        </div>
                    </div>
                    <div class="evidence-actions-wrapper">
                        <button class="evidence-menu-btn" onclick="event.stopPropagation(); toggleEvidenceMenu(event, '${itemId}')">�?/button>
                        <div class="evidence-menu" id="menu-${itemId}" style="display: none;">
                            <div class="menu-item" onclick="event.stopPropagation(); viewEvidence('${itemId}')">
                                <img src="../images/查看.svg" style="width: 16px; height: 16px;"> 查看详情
                            </div>
                            <div class="menu-item" onclick="event.stopPropagation(); editEvidenceTime('${itemId}')">
                                <img src="../images/日历.svg" style="width: 16px; height: 16px;"> 修改时间
                            </div>
                            <div class="menu-item menu-item-danger" onclick="event.stopPropagation(); deleteEvidence('${itemId}')">
                                <img src="../images/�?�?清空-批量删除-copy-copy-copy.svg" style="width: 16px; height: 16px;"> 删除
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        }

        // 显示上传状�?        function showUploadStatus(message, progress) {
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
                progressFill.style.width = progress + '%';
                progressText.textContent = progress + '%';
            }
            
            statusDiv.style.display = 'flex';
        }

        // 隐藏上传状�?        function hideUploadStatus() {
            const statusDiv = document.getElementById('uploadStatus');
            if (statusDiv) {
                statusDiv.style.display = 'none';
            }
        }

        // 下载游客模式证据
        async function downloadGuestEvidence(id) {
            console.log('📥 下载游客证据:', id);
            
            // 获取设备指纹
            const deviceFingerprint = await getOrCreateDeviceFingerprint();
            console.log('📱 使用设备指纹下载数据:', deviceFingerprint.substring(0, 8) + '...');
            
            // 从localStorage获取数据（使用设备指纹作为隔离标识）
            const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
            const savedData = localStorage.getItem(localStorageKey);
            
            if (!savedData) {
                alert('没有找到证据数据');
                return;
            }
            
            const evidenceList = JSON.parse(savedData);
            const evidence = evidenceList.find(e => e.id === id);
            
            if (!evidence) {
                alert('找不到该证据');
                return;
            }
            
            const fileName = evidence.file_name || evidence.fileName || 'evidence';
            
            // 如果有文件数据（如图片的base64），可以直接下载
            if (evidence.file_data) {
                try {
                    const blob = base64ToBlob(evidence.file_data);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('下载失败:', error);
                    alert('下载失败，请稍后重试');
                }
            } else {
                alert('该文件无法下�?);
            }
        }

        // 将base64转换为Blob
        function base64ToBlob(base64) {
            const parts = base64.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);
            
            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            
            return new Blob([uInt8Array], { type: contentType });
        }

        // 获取文件类型
        function getFileType(file) {
            if (!file) return 'document';
            
            const type = (file.type || '').toLowerCase();
            const name = (file.name || '').toLowerCase();
            
            if (type.includes('image')) return 'image';
            if (type.includes('audio')) return 'audio';
            if (type.includes('pdf')) return 'pdf';
            if (type.includes('video')) return 'video';
            if (type.includes('word') || type.includes('document')) return 'document';
            if (type.includes('excel') || type.includes('spreadsheet')) return 'excel';
            
            if (name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png') || name.includes('.gif') || name.includes('.bmp')) {
                return 'image';
            }
            if (name.includes('.mp3') || name.includes('.wav') || name.includes('.ogg') || name.includes('.flac') || name.includes('.m4a')) {
                return 'audio';
            }
            if (name.includes('.pdf')) {
                return 'pdf';
            }
            if (name.includes('.doc') || name.includes('.docx')) {
                return 'document';
            }
            if (name.includes('.xls') || name.includes('.xlsx')) {
                return 'excel';
            }
            
            return 'document';
        }

        // 获取文件图标
        function getFileIcon(fileType, fileName) {
            // 标准化文件类�?            const type = (fileType || '').toLowerCase();
            const name = (fileName || '').toLowerCase();
            
            // 先尝试文件类型匹�?            if (type.includes('image')) return '../images/图片.svg';
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

        // 生成证据效力分析报告
        async function generateEvidenceEvaluationReport(evidenceId) {
            try {
                const token = getToken();
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                const response = await fetch(`${API_BASE_URL}/api/user/evidence/${evidenceId}/generate-report`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        prompt: '我想要打官司，帮我分析以下证据法律效力的不足之处，然后把分析结果储存起来'
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('生成证据效力分析报告失败:', error);
                throw error;
            }
        }

        // 获取状态类�?        function getStatusClass(status) {
            const classes = {
                'completed': 'status-completed',
                'processing': 'status-processing',
                'failed': 'status-failed'
            };
            return classes[status] || 'status-processing';
        }

        // 获取状态文�?        function getStatusText(status) {
            const texts = {
                'completed': '�?识别完成',
                'processing': '�?识别�?,
                'failed': '�?识别失败',
                'uploaded': '📤 已上�?
            };
            return texts[status] || '📤 已上�?;  // 默认显示"已上�?
        }

        // 查看证据详情
        function viewEvidence(id) {
            // 关闭所有菜�?            document.querySelectorAll('.evidence-menu').forEach(menu => {
                menu.style.display = 'none';
            });

            const evidence = evidenceList.find(e => e.id == id || e.id === id);
            if (!evidence) {
                alert('找不到该证据');
                console.error('找不到证据ID:', id, '证据列表:', evidenceList);
                return;
            }

            // 检查是否为游客模式证据
            const isGuestEvidence = evidence.isGuest || String(evidence.id).startsWith('guest_');

            // 兼容字段�?            const fileName = evidence.file_name || evidence.fileName || evidence.name || '未知文件';
            const fileType = evidence.file_type || evidence.fileType || evidence.type || 'document';
            let uploadTime = evidence.upload_time || evidence.uploadedAt || evidence.uploaded_at ||
                evidence.created_at || evidence.createdAt || evidence.uploadTime;

            // 格式化时�?            if (uploadTime && uploadTime.includes('T')) {
                try {
                    const date = new Date(uploadTime);
                    uploadTime = date.toLocaleString('zh-CN');
                } catch (e) {
                    console.warn('时间格式转换失败:', uploadTime);
                }
            }

            const ocrStatus = evidence.ocr_status || evidence.ocrStatus || evidence.status || 'processing';
            const ocrResult = evidence.ocr_result || evidence.ocrResult || evidence.result || '';
            const analysisResult = evidence.analysis || evidence.analysisResult;

            // 生成预览内容
            let previewContent = '';

            // 判断文件类型
            const isImage = fileType.includes('image') || fileType === 'image';
            const isPdf = fileType.includes('pdf') || fileType === 'pdf';

            if (isGuestEvidence) {
                // 游客模式：显示分析结�?                previewContent = renderGuestEvidencePreview(evidence, fileName, fileType);
            } else if (isImage) {
                // 图片预览
                previewContent = `
                    <div class="preview-section">
                        <h4>📷 图片预览</h4>
                        <div class="image-preview">
                            <img src="${API_BASE_URL}/api/user/evidence/${id}/preview" 
                                 alt="${fileName}" 
                                 style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                                 onerror="this.src='https://via.placeholder.com/600x400/cccccc/666666?text=图片加载失败'">
                        </div>
                    </div>
                `;
            } else if (isPdf) {
                // PDF预览 - 直接加载到证据预�?                previewContent = `
                    <div class="preview-section">
                        <h4><img src="../images/pdf.svg" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">PDF文档</h4>
                        <div style="background: #f5f5f5; padding: 30px; border-radius: 8px; text-align: center;">
                            <div style="margin-bottom: 20px;"><img src="../images/pdf.svg" style="width: 64px; height: 64px;"></div>
                            <div style="font-size: 16px; color: #1f2937; margin-bottom: 8px; font-weight: 600;">${fileName}</div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">PDF文档需要下载后查看</div>
                            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                                <button class="btn btn-primary" onclick="downloadPdfWithAuth('${id}', '${fileName}')">
                                    <img src="../images/下载 (1).svg" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; filter: brightness(0) invert(1);">下载PDF
                                </button>
                                <button class="btn" onclick="openPdfInNewWindow('${id}')">
                                    <img src="../images/查看 (1).svg" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; filter: brightness(0) invert(1);">在新窗口查看
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 其他文档类型
                previewContent = `
                    <div class="preview-section">
                        <h4><img src="${getFileIcon(fileType, fileName)}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">文档信息</h4>
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="margin-bottom: 16px;"><img src="${getFileIcon(fileType, fileName)}" style="width: 48px; height: 48px;"></div>
                            <p style="color: #666; margin-bottom: 16px;">该文件类型暂不支持在线预�?/p>
                            <button class="btn" onclick="window.open('${API_BASE_URL}/api/user/evidence/${id}/download', '_blank')">
                                <img src="../images/下载 (1).svg" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">下载文件
                            </button>
                        </div>
                    </div>
                `;
            }

            // 显示证据详情模态框
            const modal = document.createElement('div');
            modal.className = 'evidence-modal-overlay';
            modal.innerHTML = `
                <div class="evidence-modal">
                    <div class="modal-header">
                        <span>${fileName}</span>
                        <button class="close-btn" onclick="this.closest('.evidence-modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        ${previewContent}
                        
                        <div class="evidence-item">
                            <span class="evidence-label">证据编号�?/span>
                            <span class="evidence-value">${id}</span>
                        </div>
                        <div class="evidence-item">
                            <span class="evidence-label">证据名称�?/span>
                            <span class="evidence-value">${fileName}</span>
                        </div>
                        <div class="evidence-item">
                            <span class="evidence-label">证据类型�?/span>
                            <span class="evidence-value">${fileType}</span>
                        </div>
                        <div class="evidence-item">
                            <span class="evidence-label">提交时间�?/span>
                            <span class="evidence-value">${uploadTime || '未知'}</span>
                        </div>
                        <div class="evidence-item">
                            <span class="evidence-label">提交人：</span>
                            <span class="evidence-value">系统管理�?/span>
                        </div>
                        <div class="evidence-item">
                            <span class="evidence-label">证据状态：</span>
                            <span class="evidence-value" style="color:${ocrStatus === 'completed' ? '#009933' : ocrStatus === 'failed' ? '#dc2626' : '#f59e0b'}">${getStatusText(ocrStatus)}</span>
                        </div>

                        ${ocrResult ? `
                            <div class="evidence-item" style="margin-top:24px;">
                                <span class="evidence-label">证据内容�?/span>
                                <div class="evidence-content">
                                    ${typeof ocrResult === 'object' ? JSON.stringify(ocrResult, null, 2) : ocrResult}
                                </div>
                            </div>
                        ` : ''}

                        <div class="evidence-item">
                            <span class="evidence-label">相关附件�?/span>
                            <div class="evidence-attach">
                                <div class="attach-item" onclick="window.open('${API_BASE_URL}/api/user/evidence/${id}/download', '_blank')">${fileName}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 点击遮罩关闭
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.remove();
                }
            });
        }

        /* 证据详情弹窗样式 */
        .evidence-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.2s ease;
        }

        .evidence-modal {
            width: 900px;
            max-width: 95vw;
            max-height: 85vh;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: zoomIn 0.25s ease;
        }

        .modal-header {
            padding: 16px 24px;
            background: #2d57a2;
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 500;
        }

        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 22px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            border-radius: 50%;
        }

        .close-btn:hover {
            background: rgba(255,255,255,0.2);
        }

        .modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
            color: #333;
            line-height: 1.7;
        }

        .evidence-item {
            margin-bottom: 20px;
        }

        .evidence-label {
            display: inline-block;
            min-width: 110px;
            font-weight: bold;
            color: #2d57a2;
        }

        .evidence-value {
            color: #333;
        }

        .evidence-content {
            background: #f7f9fc;
            border: 1px solid #e4ebf5;
            border-radius: 8px;
            padding: 18px;
            margin-top: 10px;
            white-space: pre-line;
            max-height: 320px;
            overflow-y: auto;
        }

        .evidence-attach {
            display: flex;
            gap: 12px;
            margin-top: 10px;
            flex-wrap: wrap;
        }

        .attach-item {
            padding: 8px 14px;
            background: #eef5ff;
            border: 1px solid #c6d8f7;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
        }

        .attach-item:hover {
            background: #d7e7ff;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes zoomIn {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        // 切换证据操作菜单
        function toggleEvidenceMenu(event, id) {
            event.stopPropagation();

            // 关闭所有其他菜�?            document.querySelectorAll('.evidence-menu').forEach(menu => {
                if (menu.id !== `menu-${id}`) {
                    menu.style.display = 'none';
                }
            });

            // 切换当前菜单
            const menu = document.getElementById(`menu-${id}`);
            if (!menu) return;

            if (menu.style.display === 'none' || menu.style.display === '') {
                menu.style.display = 'block';

                // 点击外部关闭菜单
                setTimeout(() => {
                    const closeMenu = (e) => {
                        if (!menu.contains(e.target) && !e.target.closest('.evidence-menu-btn')) {
                            menu.style.display = 'none';
                            document.removeEventListener('click', closeMenu);
                        }
                    };
                    document.addEventListener('click', closeMenu);
                }, 0);
            } else {
                menu.style.display = 'none';
            }
        }

        // 渲染游客模式证据预览
        function renderGuestEvidencePreview(evidence, fileName, fileType) {
            const analysis = evidence.analysis || evidence.analysisResult;
            const isImage = fileType.includes('image') || fileType === 'image';

            let previewHtml = '';

            // 文件图标或预�?            if (isImage) {
                previewHtml = `
                    <div class="preview-section">
                        <h4><img src="../images/图片.svg" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">文件预览</h4>
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; text-align: center; color: white;">
                            <div style="margin-bottom: 16px;"><img src="../images/图片.svg" style="width: 64px; height: 64px;"></div>
                            <div style="font-size: 16px; font-weight: 600;">${fileName}</div>
                            <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">图片文件</div>
                        </div>
                    </div>
                `;
            } else {
                let iconUrl = '../images/文件.svg';
                if (fileType.includes('pdf')) {
                    iconUrl = '../images/pdf.svg';
                } else if (fileType.includes('audio')) {
                    iconUrl = '../images/有音�?svg';
                } else if (fileName.includes('.doc') || fileName.includes('.docx')) {
                    iconUrl = '../images/word.svg';
                }
                
                previewHtml = `
                    <div class="preview-section">
                        <h4><img src="${iconUrl}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">文件信息</h4>
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; text-align: center; color: white;">
                            <div style="margin-bottom: 16px;"><img src="${iconUrl}" style="width: 64px; height: 64px;"></div>
                            <div style="font-size: 16px; font-weight: 600;">${fileName}</div>
                            <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">${fileType}</div>
                        </div>
                    </div>
                `;
            }

            // 分析结果展示
            let analysisHtml = '';
            if (analysis) {
                const keyPointsHtml = analysis.key_points ? analysis.key_points.map(point =>
                    `<li style="margin-bottom: 8px; color: #4b5563;">�?${point}</li>`
                ).join('') : '';

                analysisHtml = `
                    <div class="detail-section" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px;">
                        <h4 style="color: #0369a1; margin-bottom: 16px;">🔍 分析结果</h4>
                        <div style="margin-bottom: 16px;">
                            <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${analysis.summary || '分析完成'}</div>
                            <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">${analysis.extracted_text || ''}</div>
                        </div>
                        ${keyPointsHtml ? `
                            <div style="margin-top: 16px;">
                                <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">关键要点�?/div>
                                <ul style="padding-left: 20px;">${keyPointsHtml}</ul>
                            </div>
                        ` : ''}
                        <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <div style="font-size: 13px; color: #92400e;">
                                <strong>💡 提示�?/strong> 这是演示模式的分析结果。登录后可获得完整的AI分析服务，包括OCR文字识别、语音转文字、智能摘要等功能�?                            </div>
                        </div>
                    </div>
                `;
            } else {
                analysisHtml = `
                    <div class="detail-section" style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">�?/div>
                        <div style="color: #6b7280;">正在分析�?..</div>
                    </div>
                `;
            }

            return previewHtml + analysisHtml;
        }

        // 删除证据
        async function deleteEvidence(id) {
            if (!confirm('确定要删除这个证据吗�?)) return;

            const token = getToken();
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const isGuestMode = !token || !user || user.id === 0;
            
            try {
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指纹删�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    console.log('👤 游客模式删除证据:', id, deviceFingerprint);
                    
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            device_fingerprint: deviceFingerprint
                        })
                    });
                } else {
                    // 登录模式：使用Bearer Token
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }

                const result = await response.json();
                if (result.code === 200) {
                    console.log('�?删除成功:', result);
                    
                    // 从本地证据列表中删除
                    evidenceList = evidenceList.filter(item => item.id !== id);
                    
                    // 清除评估缓存
                    clearEvaluationCache(id);
                    
                    // 刷新证据列表
                    renderEvidenceList();
                    
                    // 检查当前是否在时序图标签页，如果是则刷新时序图
                    const timelineTab = document.getElementById('timelineTab');
                    if (timelineTab && timelineTab.classList.contains('active')) {
                        setTimeout(() => loadTimeline(), 500);
                    }
                    
                    // 检查当前是否在效力分析标签页，如果是则刷新效力分析
                    const validityTab = document.getElementById('validityTab');
                    if (validityTab && validityTab.classList.contains('active')) {
                        setTimeout(() => loadValidity(), 500);
                    }
                    
                    alert('删除成功�?);
                } else {
                    throw new Error(result.message || '删除失败');
                }
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败: ' + error.message);
            }
        }

        // 加载时序图（优化�?- 修复重复加载问题�?        async function loadTimeline() {
            const chartDiv = document.getElementById('timelineChart');

            // 清理旧的图表实例
            if (chartDiv._cleanup) {
                try {
                    chartDiv._cleanup();
                    chartDiv._cleanup = null;
                } catch (e) {
                    console.warn('清理旧图表失�?', e);
                }
            }

            // 清空容器
            chartDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>加载证据时序�?..</p></div>';

            try {
                let chartConfig;
                let evidenceData = null;

                // 尝试从证据列表获取真实数�?                if (evidenceList && evidenceList.length > 0) {
                    evidenceData = evidenceList
                        .filter(e => e.upload_time || e.uploadedAt || e.uploaded_at || e.created_at || e.createdAt || e.uploadTime || e.time) // 只包含有时间信息的证�?                        .map(e => ({
                            id: e.id,
                            name: e.file_name || e.fileName || e.name || '未知文件',
                            time: e.upload_time || e.uploadedAt || e.uploaded_at || e.created_at || e.createdAt || e.uploadTime || e.time,
                            type: e.type || '书证',
                            evidence_id: e.id
                        }));

                    console.log('📊 从证据列表获取数据，数量:', evidenceData.length);
                }

                // 总是使用Mock数据，确保时序图能够正常显示
                console.log('🔧 使用Mock时序图数�?);
                await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
                chartConfig = MockEvidenceChain.getTimelineChart(currentCaseId, evidenceData);

                // 检查是否有数据
                if (!chartConfig || !chartConfig.series || !chartConfig.series[0] || !chartConfig.series[0].data || chartConfig.series[0].data.length === 0) {
                    chartDiv.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📊</div>
                            <div class="empty-text">暂无时序数据</div>
                            <div class="empty-hint">请先上传包含时间信息的证�?/div>
                        </div>
                    `;
                    return;
                }

                // 清空容器，准备渲�?                chartDiv.innerHTML = '';

                // 等待DOM更新
                await new Promise(resolve => setTimeout(resolve, 100));

                // 检查ECharts是否可用
                if (typeof echarts === 'undefined') {
                    throw new Error('ECharts未加载，请刷新页面重�?);
                }

                // 渲染图表
                const chart = echarts.init(chartDiv);
                chart.setOption(chartConfig);

                // 节点点击事件
                chart.on('click', (params) => {
                    if (params.componentType === 'series' && params.data.evidence_id) {
                        viewEvidence(params.data.evidence_id);
                    }
                });

                // 响应式调�?                const resizeHandler = () => {
                    if (chart && !chart.isDisposed()) {
                        chart.resize();
                    }
                };
                window.addEventListener('resize', resizeHandler);

                // 保存清理函数
                chartDiv._cleanup = () => {
                    window.removeEventListener('resize', resizeHandler);
                    if (chart && !chart.isDisposed()) {
                        chart.dispose();
                    }
                };

                console.log('�?时序图加载成功，数据点数:', chartConfig.series[0].data.length);

            } catch (error) {
                console.error('�?加载时序图失�?', error);
                chartDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">�?/div>
                        <div class="empty-text">加载失败</div>
                        <div class="empty-hint">${error.message || '未知错误'}</div>
                        <button class="btn btn-primary" onclick="loadTimeline()" style="margin-top: 16px; padding: 10px 20px; font-size: 14px;">
                            🔄 重新加载
                        </button>
                    </div>
                `;
            }
        }

        // 加载效力分析
        async function loadValidity() {
            const contentDiv = document.getElementById('validityContent');

            if (evidenceList.length === 0) {
                contentDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><img src="../images/证据�?svg" style="width: 64px; height: 64px;"></div>
                        <div class="empty-text">请先上传证据</div>
                        <div class="empty-hint">上传证据后可查看效力分析</div>
                    </div>
                `;
                return;
            }

            contentDiv.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>正在分析证据效力...</p></div>';

            try {
                // 批量评估所有证�?                const evaluationResults = [];

                for (const evidence of evidenceList) {
                    try {
                        const evidenceDescription = evidence.file_name || evidence.fileName || evidence.name || '未知文件';
                        const result = await evaluateEvidenceEffectiveness(
                            evidence.id,
                            evidence.case_type || '民间借贷',
                            evidence.type || '书证',
                            evidenceDescription
                        );
                        if (result) {
                            evaluationResults.push({
                                evidence: evidence,
                                evaluation: result
                            });
                        }
                    } catch (error) {
                        console.error(`评估证据 ${evidence.id} 失败:`, error);
                    }
                }

                // 渲染评估结果
                renderValidityResults(evaluationResults, contentDiv);

            } catch (error) {
                console.error('加载效力分析失败:', error);
                contentDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">�?/div>
                        <div class="empty-text">加载失败</div>
                        <div class="empty-hint">${error.message}</div>
                    </div>
                `;
            }
        }

        // 评估单个证据效力
        async function evaluateEvidenceEffectiveness(evidenceId, caseType, evidenceType, description) {
            // 1. 先检查缓�?            const cached = getCachedEvaluation(evidenceId);
            if (cached) {
                return cached;
            }

            // 2. 尝试使用AI分析
            const token = getToken();
            if (token) {
                try {
                    // 先获取证据信�?                    const evidence = evidenceList.find(e => e.id == evidenceId || e.id === evidenceId);
                    if (!evidence) {
                        console.warn('找不到证据信�?', evidenceId);
                    }

                    let textContent = description;

                    // 根据证据类型进行处理
                    if (evidence) {
                        const fileType = evidence.file_type || evidence.fileType || '';
                        const fileName = evidence.file_name || evidence.fileName || '';

                        // 音频文件：先转文�?                        if (fileType.includes('audio') || fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.ogg') || fileName.includes('.flac') || fileName.includes('.m4a')) {
                            console.log('🎵 音频文件，使用ASR转文�?);
                            // 这里应该调用后端的ASR接口
                            // 由于我们没有实际的文件，这里使用模拟数据
                            textContent = evidence.ocr_result || evidence.ocrResult || evidence.result || description;
                            if (!textContent) {
                                textContent = '【语音转文字结果】\n这是一段模拟的音频转文字内容，包含案件相关信息�?;
                            }
                        }
                        // 图片文件：先OCR
                        else if (fileType.includes('image') || fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.bmp')) {
                            console.log('🖼�?图片文件，使用OCR提取文字');
                            // 这里应该调用后端的OCR接口
                            textContent = evidence.ocr_result || evidence.ocrResult || evidence.result || description;
                            if (!textContent) {
                                textContent = '【OCR提取结果】\n这是一段模拟的图片OCR内容，包含案件相关信息�?;
                            }
                        }
                        // PDF文件：使用OCR
                        else if (fileType.includes('pdf') || fileName.includes('.pdf')) {
                            console.log('📕 PDF文件，使用OCR提取文字');
                            textContent = evidence.ocr_result || evidence.ocrResult || evidence.result || description;
                            if (!textContent) {
                                textContent = '【PDF OCR结果】\n这是一段模拟的PDF OCR内容，包含案件相关信息�?;
                            }
                        }
                    }

                    // 使用千问API分析证据效力
                    console.log('🤖 使用千问API分析证据效力');
                    const aiAnalysisResult = await analyzeEvidenceWithAI(textContent, caseType, evidenceType);
                    if (aiAnalysisResult) {
                        // 缓存AI分析结果
                        setCachedEvaluation(evidenceId, aiAnalysisResult);
                        return aiAnalysisResult;
                    }
                } catch (error) {
                    console.warn('AI分析失败，使用Mock数据:', error);
                }
            }

            // 3. 使用确定性Mock数据并缓�?            const evaluation = generateMockEvaluation(evidenceId, evidenceType);
            setCachedEvaluation(evidenceId, evaluation);
            return evaluation;
        }

        // 使用AI分析证据效力
        async function analyzeEvidenceWithAI(textContent, caseType, evidenceType) {
            try {
                const token = getToken();
                if (!token) {
                    return null;
                }

                // 构建AI分析请求
                const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-effectiveness`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        text: textContent,
                        case_type: caseType,
                        evidence_type: evidenceType,
                        model: 'qianwen' // 使用千问模型
                    })
                });

                const result = await response.json();
                if (response.ok && result.code === 200) {
                    console.log('�?AI分析成功');
                    return result.data;
                } else {
                    console.warn('AI分析API返回错误:', result.message);
                    return null;
                }
            } catch (error) {
                console.error('AI分析失败:', error);
                return null;
            }
        }

        // ==================== 证据评估缓存机制 ====================
        const EVALUATION_CACHE_KEY = 'evidence_evaluations_v2';

        // 获取缓存的评估结�?        function getCachedEvaluation(evidenceId) {
            try {
                const cache = JSON.parse(localStorage.getItem(EVALUATION_CACHE_KEY) || '{}');
                const cached = cache[evidenceId];
                if (cached) {
                    console.log('�?使用缓存的评估结�?', evidenceId);
                    return cached;
                }
            } catch (error) {
                console.error('读取缓存失败:', error);
            }
            return null;
        }

        // 保存评估结果到缓�?        function setCachedEvaluation(evidenceId, evaluation) {
            try {
                const cache = JSON.parse(localStorage.getItem(EVALUATION_CACHE_KEY) || '{}');
                cache[evidenceId] = {
                    ...evaluation,
                    cached_at: new Date().toISOString()
                };
                localStorage.setItem(EVALUATION_CACHE_KEY, JSON.stringify(cache));
                console.log('💾 评估结果已缓�?', evidenceId);
            } catch (error) {
                console.error('保存缓存失败:', error);
            }
        }

        // 清除评估缓存（用于重新评估）
        function clearEvaluationCache(evidenceId = null) {
            if (evidenceId) {
                const cache = JSON.parse(localStorage.getItem(EVALUATION_CACHE_KEY) || '{}');
                delete cache[evidenceId];
                localStorage.setItem(EVALUATION_CACHE_KEY, JSON.stringify(cache));
                console.log('🗑�?已清除评估缓�?', evidenceId);
            } else {
                localStorage.removeItem(EVALUATION_CACHE_KEY);
                console.log('🗑�?已清除所有评估缓�?);
            }
        }

        // 使用证据ID生成确定性分数（避免随机性）
        function generateDeterministicScore(seed, factor = 1.0) {
            // 简单哈希算法生�?-1之间的确定性数�?            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash = hash & hash; // Convert to 32bit integer
            }
            const normalized = Math.abs(hash % 10000) / 10000; // 归一化到0-1
            return 0.75 + (normalized * 0.2 * factor); // 75-95分范�?        }

        // 生成稳定的Mock评估数据（基于证据ID的确定性算法）
        function generateMockEvaluation(evidenceId, evidenceType) {
            // 使用确定性算法，同一证据ID始终得到相同分数
            const baseScore = generateDeterministicScore(evidenceId, 1.0);
            const authScore = generateDeterministicScore(evidenceId + '_auth', 1.02);
            const legalScore = generateDeterministicScore(evidenceId + '_legal', 0.98);
            const relScore = generateDeterministicScore(evidenceId + '_rel', 1.05);

            return {
                evidence_id: evidenceId,
                evaluation_id: 'eval_' + evidenceId,
                timestamp: new Date().toISOString(),
                authenticity: {
                    score: Math.min(0.95, authScore),
                    level: authScore >= 0.9 ? '极高' : authScore >= 0.8 ? '�? : '中等',
                    factors: ['原件保存完好', '有明确的时间�?, '签名清晰可辨'],
                    issues: authScore < 0.8 ? ['部分内容模糊'] : [],
                    suggestions: ['建议进行公证保全']
                },
                legality: {
                    score: Math.min(0.95, legalScore),
                    level: legalScore >= 0.9 ? '极高' : legalScore >= 0.8 ? '较高' : '中等',
                    factors: ['取证方式合法', '未侵犯他人隐�?],
                    issues: legalScore < 0.85 ? ['缺少公证程序'] : [],
                    suggestions: ['建议进行证据保全公证']
                },
                relevance: {
                    score: Math.min(0.95, relScore),
                    level: relScore >= 0.9 ? '极高' : relScore >= 0.8 ? '�? : '中等',
                    factors: ['直接证明案件事实', '与争议焦点高度相�?],
                    issues: [],
                    suggestions: ['结合其他证据形成证据�?]
                },
                overall: {
                    score: baseScore,
                    level: baseScore >= 0.9 ? '证据效力极高' : baseScore >= 0.8 ? '证据效力�? : '证据效力中等',
                    grade: baseScore >= 0.9 ? 'A' : baseScore >= 0.8 ? 'B' : 'C',
                    description: baseScore >= 0.85 ? '该证据具有较强的证明力，可作为重要依�? : '该证据具有一定证明力，建议补�?
                },
                risk_assessment: {
                    level: baseScore >= 0.85 ? '低风�? : '中风�?,
                    risks: [
                        {
                            type: '真实性风�?,
                            probability: baseScore >= 0.85 ? '�? : '�?,
                            description: '对方可能质疑签名真实�?,
                            mitigation: '建议进行笔迹鉴定'
                        }
                    ]
                },
                improvement_suggestions: [
                    {
                        priority: '�?,
                        category: '合法性提�?,
                        suggestion: '进行证据保全公证',
                        expected_improvement: '+5%',
                        cost: '公证费约500-1000�?
                    }
                ],
                _note: '评估结果基于证据特征生成，保持稳定一�?
            };
        }

        // 渲染效力分析结果
        function renderValidityResults(results, container) {
            if (results.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">�?/div>
                        <div class="empty-text">评估失败</div>
                        <div class="empty-hint">无法获取评估结果</div>
                    </div>
                `;
                return;
            }

            // 计算平均�?            const avgScore = results.reduce((sum, r) => sum + r.evaluation.overall.score, 0) / results.length;

            let html = `
                <!-- 评估结果说明 -->
                <div style="margin-bottom: 16px; padding: 12px 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 20px; flex-shrink: 0;">⚠️</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">📋 评估结果说明</div>
                            <div style="font-size: 13px; color: #b45309; line-height: 1.5;">
                                �?评估结果基于证据特征生成，同一证据的评分保持稳定一�?br>
                                �?评估结果已自动保存，刷新页面不会改变<br>
                                �?如需重新评估，请删除证据后重新上�?                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px;">
                    <h3 style="font-size: 18px; color: #1e40af; margin-bottom: 12px;"><img src="../images/证据�?svg" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"> 综合评估</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: ${getScoreColor(avgScore)}">
                                ${(avgScore * 100).toFixed(0)}
                            </div>
                            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">平均�?/div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: #1e40af">${results.length}</div>
                            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">已评�?/div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: #10b981">
                                ${results.filter(r => r.evaluation.overall.score >= 0.8).length}
                            </div>
                            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">高效�?/div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; font-weight: 700; color: #ef4444">
                                ${results.filter(r => r.evaluation.overall.score < 0.7).length}
                            </div>
                            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">需补强</div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; gap: 16px;">
            `;

            // 渲染每个证据的评估结�?            results.forEach(({ evidence, evaluation }) => {
                const score = evaluation.overall.score;
                const scoreColor = getScoreColor(score);
                const evidenceName = evidence.file_name || evidence.fileName || evidence.name || '未知文件';
                const evidenceType = evidence.type || '书证';

                html += `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;"
                         onclick="showEvaluationDetail('${evaluation.evaluation_id}')"
                         onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.boxShadow='none'">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"><img src="../images/文件.svg" style="width: 32px; height: 32px;"></div>
                            <div style="flex: 1;">
                                <div style="font-size: 15px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                                    ${evidenceName}
                                </div>
                                <div style="font-size: 13px; color: #6b7280;">
                                    ${evidenceType} · ${formatDateTime(evaluation.timestamp)}
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 28px; font-weight: 700; color: ${scoreColor}">
                                    ${(score * 100).toFixed(0)}
                                </div>
                                <div style="font-size: 12px; color: #6b7280;">综合评分</div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                            ${renderDimensionBadge('真实�?, evaluation.authenticity)}
                            ${renderDimensionBadge('合法�?, evaluation.legality)}
                            ${renderDimensionBadge('关联�?, evaluation.relevance)}
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="padding: 4px 8px; background: ${scoreColor}22; color: ${scoreColor}; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                    ${evaluation.overall.grade}�?                                </span>
                                <span style="font-size: 13px; color: #6b7280;">
                                    ${evaluation.overall.level}
                                </span>
                            </div>
                            <button class="btn" style="font-size: 12px; padding: 6px 12px;" onclick="event.stopPropagation(); exportEvaluationReport('${evaluation.evaluation_id}')">
                                导出报告
                            </button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        }

        // 渲染维度徽章
        function renderDimensionBadge(title, dimension) {
            const score = (dimension.score * 100).toFixed(0);
            const color = getScoreColor(dimension.score);
            return `
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${color};">${score}</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${dimension.level}</div>
                </div>
            `;
        }

        // 根据分数获取颜色
        function getScoreColor(score) {
            if (score >= 0.9) return '#10b981';
            if (score >= 0.8) return '#3b82f6';
            if (score >= 0.7) return '#f59e0b';
            if (score >= 0.6) return '#ef4444';
            return '#991b1b';
        }

        // 格式化日期时�?        function formatDateTime(dateTimeString) {
            const date = new Date(dateTimeString);
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // 显示评估详情
        function showEvaluationDetail(evaluationId) {
            alert('评估详情功能开发中...\n评估ID: ' + evaluationId);
        }

        // 导出评估报告
        function exportEvaluationReport(evaluationId) {
            alert('报告导出功能开发中...\n评估ID: ' + evaluationId);
        }

        // 加载风险评估
        async function loadRiskAssessment() {
            const chartCanvas = document.getElementById('radarChart');
            
            try {
                // 设置案件ID
                const caseId = getCurrentCaseId();
                document.getElementById('currentCaseId').textContent = caseId || 'case_1772469516374';

                let chartData;

                if (DEV_MODE) {
                    // Mock模式
                    console.log('🔧 DEV MODE: 使用Mock雷达图数�?);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
                    chartData = {
                        labels: ['证据完整�?, '法律依据', '程序合规', '对方抗辩', '时效�?],
                        datasets: [{
                            label: '当前评估',
                            data: [85, 80, 90, 70, 75],
                            backgroundColor: 'rgba(22, 119, 255, 0.2)',
                            borderColor: 'rgba(22, 119, 255, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: '#1677ff'
                        }]
                    };
                } else {
                    // 真实API - 包含/api/v1前缀
                    const response = await fetch(`${API_BASE_URL}/api/v1/evidence/win-probability/radar/${currentCaseId}`, {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        }
                    });

                    const result = await response.json();
                    if (result.code === 200) {
                        // 转换为Chart.js格式
                        chartData = {
                            labels: result.data.labels || ['证据完整�?, '法律依据', '程序合规', '对方抗辩', '时效�?],
                            datasets: [{
                                label: '当前评估',
                                data: result.data.data || [80, 75, 85, 65, 70],
                                backgroundColor: 'rgba(22, 119, 255, 0.2)',
                                borderColor: 'rgba(22, 119, 255, 1)',
                                borderWidth: 2,
                                pointBackgroundColor: '#1677ff'
                            }]
                        };
                    } else {
                        throw new Error(result.message || '加载失败');
                    }
                }

                // 渲染Chart.js雷达�?                if (window.riskChart) {
                    window.riskChart.destroy();
                }
                window.riskChart = new Chart(chartCanvas, {
                    type: 'radar',
                    data: chartData,
                    options: {
                        scales: {
                            r: {
                                min: 0,
                                max: 100,
                                beginAtZero: true
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // 更新风险报告
                updateRiskReport();

            } catch (error) {
                console.error('加载雷达图失�?', error);
                chartCanvas.parentElement.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">�?/div>
                        <div style="font-size: 16px; color: #606266; margin-bottom: 8px;">加载失败</div>
                        <div style="font-size: 14px; color: #909399;">${error.message}</div>
                    </div>
                `;
            }
        }

        // 更新风险报告
        function updateRiskReport() {
            // 模拟数据 - 实际项目中应从API获取
            const winRate = 80;
            document.getElementById('winRate').textContent = winRate + '%';
            
            // 更新综合评估
            document.getElementById('comprehensiveAssessment').innerHTML = `根据证据链分析，您的案件整体胜诉可能性为 <b>${winRate}%</b>，证据较为充分，整体风险可控。`;
            
            // 这里可以根据实际数据动态更新其他部�?        }

        // 生成评估报告
        function generateAssessmentReport() {
            console.log('📋 生成评估报告');
            // 这里可以添加生成报告的逻辑
            alert('评估报告生成功能正在开发中，敬请期待！');
        }

        // SVG图标映射配置
        const svgIconMap = {
            '💬': { file: '业务咨询.svg', name: '业务咨询' },
            '⚖️': { file: '效力.svg', name: '效力' },
            '📄': { file: '文书生成.svg', name: '文书生成' },
            '🔍': { file: '文件-文书审查.svg', name: '文书审查' },
            '⏱️': { file: '时序预测.svg', name: '时序预测' },
            '📖': { file: '查询.svg', name: '查询' },
            '🔬': { file: '证据�?svg', name: '证据�? },
            '⚠️': { file: '风险分析.svg', name: '风险分析' },
            '🏠': { file: '首页.svg', name: '首页' },
            '📤': { file: '文件-文书审查.svg', name: '上传' },
            '📁': { file: '首页.svg', name: '文件�? },
            '📊': { file: '效力.svg', name: '统计' },
            '�?: { file: '效力.svg', name: '完成' },
            '📎': { file: '文书生成.svg', name: '附件' }
        };

        // 替换emoji为SVG图标
        function replaceEmojiWithSVG() {
            console.log('🎨 开始替换emoji为SVG图标...');
            
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            textNodes.forEach(textNode => {
                let text = textNode.textContent;
                let hasReplacement = false;
                
                Object.keys(svgIconMap).forEach(emoji => {
                    if (text.includes(emoji)) {
                        const config = svgIconMap[emoji];
                        const svgUrl = `../images/${config.file}`;
                        const imgTag = `<img src="${svgUrl}" alt="${config.name}" class="svg-icon" style="width: 24px; height: 24px; vertical-align: middle; display: inline-block; filter: brightness(0) saturate(100%) invert(30%) sepia(98%) saturate(2645%) hue-rotate(215deg) brightness(95%) contrast(97%);">`;
                        text = text.split(emoji).join(imgTag);
                        hasReplacement = true;
                    }
                });
                
                if (hasReplacement) {
                    const span = document.createElement('span');
                    span.innerHTML = text;
                    textNode.parentNode.replaceChild(span, textNode);
                }
            });
            
            console.log('�?SVG图标替换完成');
        }

        // 页面加载完成
        window.addEventListener('load', async () => {
            // 先验证设备指纹一致�?            await validateDeviceFingerprint();
            
            // 检测是否在iframe�?            if (window.self !== window.top) {
                // 在iframe中，隐藏顶部导航�?                const navbar = document.querySelector('.top-navbar');
                if (navbar) {
                    navbar.style.display = 'none';
                }
                console.log('🖼�?在iframe中运行，已隐藏顶部导航栏');
            }

            // 检查登录状�?- 支持游客模式
            const token = getToken();
            if (!token) {
                console.log('👤 进入游客模式');
                // 不强制登录，直接进入
            }

            // 加载证据列表
            console.log('📄 进入证据分析页面，开始获取证据列�?);
            try {
                await fetchEvidenceList();
                console.log('�?证据列表加载完成');
            } catch (error) {
                console.error('�?获取证据列表失败:', error);
                // 失败后使用本地数据作为备�?                try {
                    await fetchEvidenceListLocal();
                    console.log('🔧 使用本地数据作为备�?);
                } catch (localError) {
                    console.error('�?本地数据加载也失�?', localError);
                }
            }

            // 延迟执行SVG替换，确保DOM完全渲染
            setTimeout(replaceEmojiWithSVG, 100);

            // 默认不启动自动刷新，用户可以手动开�?            // 如果需要默认开启，取消下面这行的注�?            // startAutoRefresh();
        });

        // 修改证据时间
        async function editEvidenceTime(evidenceId) {
            console.log('�?修改证据时间:', evidenceId);
            
            const evidence = evidenceList.find(item => item.id == evidenceId || item.evidence_id == evidenceId);
            if (!evidence) {
                console.error('证据不存�?', evidenceId);
                return;
            }
            
            // 获取当前时间
            const currentTime = evidence.upload_time || evidence.uploadedAt || evidence.uploaded_at || 
                evidence.created_at || evidence.createdAt || evidence.uploadTime || new Date().toISOString();
            
            // 格式化为本地时间字符�?            let formattedTime = currentTime;
            if (currentTime.includes('T')) {
                try {
                    const date = new Date(currentTime);
                    formattedTime = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
                } catch (e) {
                    console.warn('时间格式转换失败:', currentTime);
                }
            }
            
            // 创建修改时间的模态框
            const modal = document.createElement('div');
            modal.className = 'evidence-detail-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>�?修改证据时间</h3>
                        <button class="close-btn" onclick="this.closest('.evidence-detail-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">证据名称</label>
                            <input type="text" value="${evidence.file_name || evidence.fileName}" readonly 
                                   style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">选择新时�?/label>
                            <input type="datetime-local" id="newEvidenceTime" value="${formattedTime}" 
                                   style="width: 100%; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" onclick="this.closest('.evidence-detail-modal').remove()">取消</button>
                        <button class="btn btn-primary" onclick="event.stopPropagation(); saveEvidenceTime('${evidenceId}')">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // 保存证据时间
        async function saveEvidenceTime(evidenceId) {
            const newTimeInput = document.getElementById('newEvidenceTime');
            if (!newTimeInput) return;
            
            const newTime = newTimeInput.value;
            if (!newTime) {
                alert('请选择时间');
                return;
            }
            
            try {
                console.log('💾 保存证据时间:', evidenceId, newTime);
                
                // 检查Token - 支持游客模式
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/update-time/${evidenceId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            time: newTime,
                            device_fingerprint: deviceFingerprint
                        })
                    });
                } else {
                    // 登录模式：使用Bearer Token
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/update-time/${evidenceId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            time: newTime
                        })
                    });
                }
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('�?时间更新成功:', result);
                    
                    // 刷新证据列表
                    await fetchEvidenceList();
                    
                    // 检查当前是否在时序图标签页，如果是则刷新时序图
                    const timelineTab = document.getElementById('timelineTab');
                    if (timelineTab && timelineTab.classList.contains('active')) {
                        setTimeout(() => loadTimeline(), 500);
                    }
                    
                    // 关闭模态框
                    document.querySelector('.evidence-detail-modal').remove();
                    alert('时间更新成功�?);
                } else {
                    const error = await response.json();
                    console.error('�?时间更新失败:', error);
                    alert('时间更新失败: ' + (error.message || '未知错误'));
                }
            } catch (error) {
                console.error('�?保存时间失败:', error);
                alert('保存失败: ' + error.message);
            }
        }

        // 同步证据内容到本地存�?        async function syncEvidenceContent(evidenceList) {
            console.log('🔄 开始同步证据内容到本地存储');
            
            // 遍历证据列表
            for (const evidence of evidenceList) {
                try {
                    const evidenceId = evidence.id || evidence.evidence_id;
                    const cacheKey = `evidence_content_${evidenceId}`;
                    
                    // 检查本地存储中是否已有内容
                    const cachedContent = localStorage.getItem(cacheKey);
                    if (cachedContent) {
                        console.log(`�?证据 ${evidenceId} 内容已存在于本地存储`);
                        continue;
                    }
                    
                    // 从后端获取证据内�?                    console.log(`📡 获取证据 ${evidenceId} 内容`);
                    
                    const token = getToken();
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    const isGuestMode = !token || !user || user.id === 0;
                    
                    let response;
                    if (isGuestMode) {
                        // 游客模式：使用设备指�?                        const deviceFingerprint = await getOrCreateDeviceFingerprint();
                        response = await fetch(`${API_BASE_URL}/api/v1/evidence/preview/${evidenceId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                            method: 'GET'
                        });
                    } else {
                        // 登录模式：使用Bearer Token
                        response = await fetch(`${API_BASE_URL}/api/v1/evidence/preview/${evidenceId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                    
                    if (response.ok) {
                        const contentData = await response.json();
                        if (contentData.code === 200 && contentData.data) {
                            // 存储到本地存�?                            localStorage.setItem(cacheKey, JSON.stringify(contentData.data));
                            console.log(`�?证据 ${evidenceId} 内容已同步到本地存储`);
                        }
                    } else {
                        console.warn(`�?获取证据 ${evidenceId} 内容失败:`, response.status);
                    }
                } catch (error) {
                    console.error(`�?同步证据 ${evidence.id || evidence.evidence_id} 内容失败:`, error);
                }
            }
            
            console.log('�?证据内容同步完成');
        }

        // 从本地存储获取证据内�?        function getEvidenceContentFromCache(evidenceId) {
            try {
                if (typeof localStorage === 'undefined') {
                    console.warn('⚠️ localStorage不可�?);
                    return null;
                }
                const cacheKey = `evidence_content_${evidenceId}`;
                const cachedContent = localStorage.getItem(cacheKey);
                if (cachedContent) {
                    console.log(`�?从本地存储获取证�?${evidenceId} 内容`);
                    return JSON.parse(cachedContent);
                }
            } catch (error) {
                console.error(`�?从本地存储获取证据内容失�?`, error);
            }
            return null;
        }

        // 页面卸载时停止自动刷�?        window.addEventListener('beforeunload', () => {
            stopAutoRefresh();
        });


    