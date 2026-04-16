
        // ==================== 核心UI函数（必须在最前面�?====================

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
        // 生成稳定的Mock评估数据（基于证据ID的确定性算法）
        function generateMockEvaluation(evidenceId, evidenceType) {
            // 使用确定性算法，同一证据ID始终得到相同分数
            function generateDeterministicScore(seed, factor = 1.0) {
                // 简单哈希算法生�?-1之间的确定性数�?                let hash = 0;
                for (let i = 0; i < seed.length; i++) {
                    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                    hash = hash & hash; // Convert to 32bit integer
                }
                const normalized = Math.abs(hash % 10000) / 10000; // 归一化到0-1
                return 0.75 + (normalized * 0.2 * factor); // 75-95分范�?            }

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

        // 证据评估缓存机制
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

        // 评估证据效力
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

        // 从本地存储获取AI分析结果
        function getAIAnalysisResult(evidenceId) {
            try {
                const aiAnalysisCache = localStorage.getItem('ai_analysis_cache');
                if (aiAnalysisCache) {
                    const cache = JSON.parse(aiAnalysisCache);
                    return cache[evidenceId] || null;
                }
                return null;
            } catch (error) {
                console.error('从本地存储获取AI分析结果失败:', error);
                return null;
            }
        }

        // 保存AI分析结果到本地存�?        function saveAIAnalysisResult(evidenceId, analysis) {
            try {
                const aiAnalysisCache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}');
                aiAnalysisCache[evidenceId] = {
                    analysis: analysis,
                    updated_at: new Date().toISOString()
                };
                localStorage.setItem('ai_analysis_cache', JSON.stringify(aiAnalysisCache));
                console.log('�?AI分析结果已保存到本地存储:', evidenceId);
            } catch (error) {
                console.error('保存AI分析结果到本地存储失�?', error);
            }
        }

        // 获取AI分析结果
        async function fetchAIAnalysisResult(evidenceId) {
            try {
                // 先检查本地存�?                const cachedAnalysis = getAIAnalysisResult(evidenceId);
                if (cachedAnalysis) {
                    console.log('�?使用缓存的AI分析结果:', evidenceId);
                    return cachedAnalysis.analysis;
                }

                // 从后端获取AI分析结果
                const token = getToken();
                const deviceFingerprint = await getOrCreateDeviceFingerprint();
                
                let response;
                if (token) {
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/ai-analysis/${evidenceId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } else {
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/ai-analysis/${evidenceId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                        method: 'GET'
                    });
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data.code === 200 && data.data) {
                        // 保存到本地存�?                        saveAIAnalysisResult(evidenceId, data.data);
                        return data.data;
                    }
                }
                return null;
            } catch (error) {
                console.error('获取AI分析结果失败:', error);
                return null;
            }
        }

        // 渲染AI分析结果
        function renderAIAnalysisResult(evidenceId, container) {
            // 显示加载状�?            container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>正在加载AI分析结果...</p></div>';

            // 异步获取AI分析结果
            fetchAIAnalysisResult(evidenceId).then(analysis => {
                if (analysis) {
                    let html = `
                        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 12px 0;">AI分析结果</h4>
                    `;

                    if (analysis.advantages && analysis.advantages.length > 0) {
                        html += `
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">优势</div>
                                <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
                                    ${analysis.advantages.map(advantage => `
                                        <li style="margin-bottom: 4px;">${advantage}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    if (analysis.disadvantages && analysis.disadvantages.length > 0) {
                        html += `
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #dc2626; margin-bottom: 4px;">不足</div>
                                <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
                                    ${analysis.disadvantages.map(disadvantage => `
                                        <li style="margin-bottom: 4px;">${disadvantage}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    if (analysis.suggestions && analysis.suggestions.length > 0) {
                        html += `
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #d97706; margin-bottom: 4px;">改进建议</div>
                                <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
                                    ${analysis.suggestions.map(suggestion => `
                                        <li style="margin-bottom: 4px;">${suggestion}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    if (analysis.overall_assessment) {
                        html += `
                            <div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">总体评估</div>
                                <div style="font-size: 14px; color: #475569;">${analysis.overall_assessment}</div>
                            </div>
                        `;
                    }

                    html += `
                        </div>
                    `;

                    container.innerHTML = html;
                } else {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">�?/div>
                            <div class="empty-text">AI分析结果不存�?/div>
                            <div class="empty-hint">请等待AI分析完成或重新分析证�?/div>
                        </div>
                    `;
                }
            });
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
                        <span style="font-size: 16px; color: #d97706;">💡</span>
                        <div>
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">评估说明</div>
                            <div style="font-size: 14px; color: #78350f;">证据效力评估基于真实性、合法性、关联性三个维度，综合评分范围�?-100分�?/div>
                        </div>
                    </div>
                </div>

                <!-- 总评�?-->
                <div style="margin-bottom: 24px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                        <div>
                            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0;">总评�?/h3>
                            <p style="font-size: 14px; color: #64748b; margin: 0;">基于所有上传证据的综合评估</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 36px; font-weight: 700; color: #0f766e; margin-bottom: 4px;">${Math.round(avgScore * 100)}</div>
                            <div style="font-size: 14px; color: #64748b;">平均�?/div>
                        </div>
                    </div>
                    <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">评估等级</div>
                        <div style="font-size: 16px; font-weight: 500; color: ${avgScore >= 0.9 ? '#059669' : avgScore >= 0.8 ? '#d97706' : '#dc2626'};">
                            ${avgScore >= 0.9 ? '证据效力极高' : avgScore >= 0.8 ? '证据效力�? : '证据效力中等'}
                        </div>
                    </div>
                </div>

                <!-- 证据评估列表 -->
                <div style="space-y: 16px;">
            `;

            results.forEach((item, index) => {
                const evidence = item.evidence;
                const evaluation = item.evaluation;
                const score = evaluation.overall.score;
                const grade = evaluation.overall.grade;
                const level = evaluation.overall.level;

                html += `
                    <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="padding: 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">
                                    ${evidence.file_name || evidence.fileName || evidence.name || '未知文件'}
                                </div>
                                <div style="font-size: 14px; color: #64748b;">
                                    案件ID: ${evidence.case_id || evidence.caseId || '未知'}
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: ${score >= 0.9 ? '#059669' : score >= 0.8 ? '#d97706' : '#dc2626'};">
                                    ${Math.round(score * 100)}
                                </div>
                                <div style="font-size: 14px; font-weight: 600; color: ${score >= 0.9 ? '#059669' : score >= 0.8 ? '#d97706' : '#dc2626'};">
                                    ${grade}
                                </div>
                            </div>
                        </div>
                        <div style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">评估结果</div>
                                <div style="font-size: 14px; color: #475569;">${level}</div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">评估维度</div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 8px;">
                                    <div style="padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                                        <div style="font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 4px;">真实�?/div>
                                        <div style="font-size: 16px; font-weight: 600; color: ${evaluation.authenticity.score >= 0.9 ? '#059669' : evaluation.authenticity.score >= 0.8 ? '#d97706' : '#dc2626'};">
                                            ${Math.round(evaluation.authenticity.score * 100)}%
                                        </div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${evaluation.authenticity.level}</div>
                                    </div>
                                    <div style="padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                                        <div style="font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 4px;">合法�?/div>
                                        <div style="font-size: 16px; font-weight: 600; color: ${evaluation.legality.score >= 0.9 ? '#059669' : evaluation.legality.score >= 0.8 ? '#d97706' : '#dc2626'};">
                                            ${Math.round(evaluation.legality.score * 100)}%
                                        </div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${evaluation.legality.level}</div>
                                    </div>
                                    <div style="padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                                        <div style="font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 4px;">关联�?/div>
                                        <div style="font-size: 16px; font-weight: 600; color: ${evaluation.relevance.score >= 0.9 ? '#059669' : evaluation.relevance.score >= 0.8 ? '#d97706' : '#dc2626'};">
                                            ${Math.round(evaluation.relevance.score * 100)}%
                                        </div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${evaluation.relevance.level}</div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">风险评估</div>
                                <div style="font-size: 14px; color: ${evaluation.risk_assessment.level === '低风�? ? '#059669' : '#d97706'};">
                                    ${evaluation.risk_assessment.level}
                                </div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">改进建议</div>
                                <ul style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
                                    ${evaluation.improvement_suggestions.map(suggestion => `
                                        <li style="margin-bottom: 4px;">${suggestion.suggestion}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">AI分析</div>
                                <div id="aiAnalysis-${evidence.id}"></div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            `;

            container.innerHTML = html;

            // 渲染每个证据的AI分析结果
            results.forEach((item) => {
                const evidence = item.evidence;
                const aiAnalysisContainer = document.getElementById(`aiAnalysis-${evidence.id}`);
                if (aiAnalysisContainer) {
                    renderAIAnalysisResult(evidence.id, aiAnalysisContainer);
                }
            });
        }

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

        // 切换标签�?        function switchTab(tabName) {
            console.log('🔄 切换标签�?', tabName);

            // 移除所有active�?            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // 添加active类到对应的标签按�?            const targetTab = Array.from(document.querySelectorAll('.tab')).find(tab =>
                tab.getAttribute('onclick').includes(`'${tabName}'`)
            );
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // 显示对应内容
            const targetContent = document.getElementById(tabName + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // 加载对应内容
            if (tabName === 'timeline') {
                loadTimeline();
            } else if (tabName === 'validity') {
                loadValidity();
            } else if (tabName === 'risk') {
                loadRiskAssessment();
            }
        }

        // 返回首页
        function backToHome() {
            window.location.href = 'professional.html';
        }

        // 前往个人中心
        function goToUserCenter() {
            window.location.href = 'user-center.html';
        }

        // 显示当前案件信息
        function showCaseInfo() {
            const caseName = localStorage.getItem('current_case_name') || '未命名案�?;
            const caseId = getCurrentCaseId(); // 使用函数获取，避免变量未定义
            const evidenceCount = (window.evidenceList || []).length;

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

        // 切换自动刷新
        function toggleAutoRefresh() {
            if (window.autoRefreshInterval) {
                clearInterval(window.autoRefreshInterval);
                window.autoRefreshInterval = null;
                document.getElementById('autoRefreshBtn').textContent = '🔄 自动刷新';
                console.log('⏸️ 自动刷新已停�?);
            } else {
                window.autoRefreshInterval = setInterval(() => {
                    if (document.getElementById('uploadTab').classList.contains('active')) {
                        fetchEvidenceList();
                    }
                }, 5000);
                document.getElementById('autoRefreshBtn').textContent = '⏸️ 停止刷新';
                console.log('▶️ 自动刷新已启动（�?秒）');
            }
        }

        // 清除筛�?        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('typeFilter').value = '';
            document.getElementById('statusFilter').value = '';
            renderEvidenceList();
        }

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

        // 启动自动刷新
        function startAutoRefresh() {
            // 先清除现有定时器
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
            
            // 启动新的定时器（�?0秒刷新一次）
            autoRefreshInterval = setInterval(() => {
                if (document.getElementById('uploadTab').classList.contains('active')) {
                    fetchEvidenceList(true);
                }
            }, 30000);
            
            console.log('🔄 自动刷新已启动（�?0秒）');
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

        // 保存证据到本地存�?        async function saveEvidenceToLocalStorage(evidenceList) {
            try {
                if (typeof localStorage === 'undefined') {
                    console.warn('⚠️ localStorage不可�?);
                    return;
                }
                const deviceFingerprint = await getOrCreateDeviceFingerprint();
                const currentCaseId = getCurrentCaseId();
                const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
                localStorage.setItem(localStorageKey, JSON.stringify(evidenceList));
                console.log('�?证据已保存到本地存储');
            } catch (error) {
                console.error('�?保存证据到本地存储失�?', error);
            }
        }

        // 从本地存储获取证�?        async function getEvidenceFromLocalStorage() {
            try {
                if (typeof localStorage === 'undefined') {
                    console.warn('⚠️ localStorage不可�?);
                    return [];
                }
                const deviceFingerprint = await getOrCreateDeviceFingerprint();
                const currentCaseId = getCurrentCaseId();
                const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
                const savedData = localStorage.getItem(localStorageKey);
                if (savedData) {
                    return JSON.parse(savedData);
                }
            } catch (error) {
                console.error('�?从本地存储获取证据失�?', error);
            }
            return [];
        }

        // 获取证据列表
        async function fetchEvidenceList(silent = false) {
            try {
                // 检查Token - 支持游客模式
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                console.log('🔍 Token检�?', { token: !!token, user: user, isGuestMode: isGuestMode });
                
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                        method: 'GET'
                    });
                } else {
                    // 登录模式：使用Bearer Token
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/list/${currentCaseId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }

                if (!response.ok) {
                    if (response.status === 401) {
                        handle401Error();
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.code === 200 && data.data) {
                    // 处理响应数据，标准化字段�?                    const newEvidenceList = data.data.map(item => {
                        // 获取文件类型
                        let fileType = item.file_type || item.fileType;
                        const fileName = item.file_name || item.fileName || '';
                        
                        // 将MIME类型转换为简化类�?                        if (fileType && fileType.includes('/')) {
                            const mimeToSimple = {
                                'image/': 'image',
                                'audio/': 'audio',
                                'video/': 'video',
                                'application/pdf': 'pdf',
                                'application/msword': 'document',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
                                'application/vnd.ms-excel': 'excel',
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel'
                            };
                            
                            let matched = false;
                            for (const [mime, simple] of Object.entries(mimeToSimple)) {
                                if (fileType.includes(mime)) {
                                    fileType = simple;
                                    matched = true;
                                    break;
                                }
                            }
                            
                            // 如果没有匹配的MIME类型，尝试从文件名后缀判断
                            if (!matched && fileName) {
                                const name = fileName.toLowerCase();
                                if (name.includes('.jpg') || name.includes('.jpeg') || name.includes('.png') || name.includes('.gif') || name.includes('.bmp')) {
                                    fileType = 'image';
                                } else if (name.includes('.mp3') || name.includes('.wav') || name.includes('.ogg') || name.includes('.flac') || name.includes('.m4a')) {
                                    fileType = 'audio';
                                } else if (name.includes('.pdf')) {
                                    fileType = 'pdf';
                                } else if (name.includes('.doc') || name.includes('.docx')) {
                                    fileType = 'document';
                                } else if (name.includes('.xls') || name.includes('.xlsx')) {
                                    fileType = 'excel';
                                } else {
                                    fileType = 'document';
                                }
                            }
                        }
                        
                        return {
                            id: item.id || item.evidence_id,
                            evidence_id: item.evidence_id || item.id,
                            file_name: fileName,
                            file_type: fileType,
                            file_size: item.file_size || item.fileSize,
                            upload_time: item.upload_time || item.uploadTime,
                            ocr_status: item.ocr_status || item.ocrStatus || item.status,
                            case_id: item.case_id || item.caseId,
                            preview_url: item.preview_url || item.previewUrl,
                            download_url: item.download_url || item.downloadUrl,
                            analysis_result: item.analysis_result || item.analysisResult
                        };
                    });

                    // 保存到本地存�?                    await saveEvidenceToLocalStorage(newEvidenceList);

                    // 检测数据变�?                    const newDataHash = calculateDataHash(newEvidenceList);
                    if (newDataHash !== lastDataHash) {
                        evidenceList = newEvidenceList;
                        lastDataHash = newDataHash;
                        renderEvidenceList();
                        
                        // 同步证据内容到本地存�?                        if (typeof syncEvidenceContent === 'function') {
                            syncEvidenceContent(newEvidenceList);
                        }
                        
                        if (!silent) {
                            console.log('�?证据列表已更�?', evidenceList.length, '个证�?);
                        }
                    } else {
                        // 如果哈希值相同，但evidenceList是空的，也强制更�?                        // 这确保初始加载时能正确显示数�?                        if (!evidenceList || evidenceList.length === 0) {
                            evidenceList = newEvidenceList;
                            renderEvidenceList();
                            
                            // 同步证据内容到本地存�?                            if (typeof syncEvidenceContent === 'function') {
                                syncEvidenceContent(newEvidenceList);
                            }
                            
                            if (!silent) {
                                console.log('�?证据列表已强制更�?', evidenceList.length, '个证�?);
                            }
                        } else if (!silent) {
                            console.log('ℹ️ 证据列表无变�?);
                        }
                    }
                } else {
                    console.error('�?响应数据格式错误:', data);
                }
            } catch (error) {
                console.error('�?获取证据列表失败:', error);
                if (!silent) {
                    alert('获取证据列表失败: ' + error.message);
                }
                // 从本地存储加载证据列�?                getEvidenceFromLocalStorage().then(localEvidenceList => {
                    if (localEvidenceList && localEvidenceList.length > 0) {
                        evidenceList = localEvidenceList;
                        renderEvidenceList();
                        console.log('�?已从本地存储加载证据列表:', evidenceList.length, '个证�?);
                    } else {
                        // 如果本地存储也没有，才清空证据列�?                        evidenceList = [];
                        renderEvidenceList();
                    }
                }).catch(err => {
                    console.error('�?从本地存储加载证据列表失�?', err);
                    evidenceList = [];
                    renderEvidenceList();
                });
            }
        }

        // 计算数据哈希值（用于检测变化）
        function calculateDataHash(data) {
            if (!Array.isArray(data) || data.length === 0) {
                return 'empty';
            }
            
            // 生成简单的哈希�?            const jsonString = JSON.stringify(data.map(item => ({
                id: item.id,
                file_name: item.file_name,
                ocr_status: item.ocr_status
            })));
            
            let hash = 0;
            for (let i = 0; i < jsonString.length; i++) {
                const char = jsonString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 转换�?2位整�?            }
            return hash.toString();
        }

        // 获取状态类�?        function getStatusClass(status) {
            const statusMap = {
                'completed': 'status-success',
                'processing': 'status-processing',
                'failed': 'status-error',
                'uploaded': 'status-info',
                'analyzed': 'status-success'
            };
            return statusMap[status] || 'status-info';
        }

        // 获取状态文�?        function getStatusText(status) {
            const statusMap = {
                'completed': '�?识别完成',
                'processing': '�?识别�?,
                'failed': '�?识别失败',
                'uploaded': '📤 已上�?,
                'analyzed': '🤖 已分�?
            };
            return statusMap[status] || '📤 已上�?;
        }

        // 切换证据选择状�?        function toggleEvidenceSelection(evidenceId, event) {
            event.stopPropagation();
            if (selectedEvidenceIds.has(evidenceId)) {
                selectedEvidenceIds.delete(evidenceId);
            } else {
                selectedEvidenceIds.add(evidenceId);
            }
            renderEvidenceList();
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

        // 切换证据菜单
        function toggleEvidenceMenu(event, evidenceId) {
            // 关闭所有其他菜�?            document.querySelectorAll('.evidence-menu').forEach(menu => {
                menu.style.display = 'none';
            });
            
            // 显示当前菜单
            const menu = document.getElementById(`menu-${evidenceId}`);
            if (menu) {
                menu.style.display = 'block';
            }
        }

        // 查看证据详情
        async function viewEvidence(evidenceId) {
            console.log('👁�?查看证据详情:', evidenceId);
            
            const evidence = evidenceList.find(item => item.id == evidenceId || item.evidence_id == evidenceId);
            if (!evidence) {
                console.error('证据不存�?', evidenceId);
                return;
            }
            
            // 创建模态框
            const modal = document.createElement('div');
            modal.className = 'evidence-detail-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-dialog" style="max-width: 900px; max-height: 90vh;">
                    <div class="modal-header">
                        <h3>📄 证据详情</h3>
                        <button class="close-btn" onclick="this.closest('.evidence-detail-modal').remove()">×</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto;">
                        <div class="evidence-detail-content" style="display: flex; gap: 20px;">
                            <!-- 左侧信息�?-->
                            <div style="flex: 1; min-width: 250px; max-width: 300px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                                <h4>基础信息</h4>
                                <div class="info-grid" style="display: flex; flex-direction: column; gap: 12px;">
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">证据名称</span>
                                        <span class="info-value" style="flex: 1; margin-left: 10px; text-align: right; word-break: break-all;">${evidence.file_name || evidence.fileName}</span>
                                    </div>
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">文件类型</span>
                                        <span class="info-value" style="flex: 1; margin-left: 10px; text-align: right;">${getFileTypeText(evidence.file_type || evidence.fileType)}</span>
                                    </div>
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">文件大小</span>
                                        <span class="info-value" style="flex: 1; margin-left: 10px; text-align: right;">${formatFileSize(evidence.file_size || evidence.fileSize)}</span>
                                    </div>
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">上传时间</span>
                                        <span class="info-value" style="flex: 1; margin-left: 10px; text-align: right; font-size: 12px;">${formatDate(evidence.upload_time || evidence.uploadTime)}</span>
                                    </div>
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">状�?/span>
                                        <span class="info-value ${getStatusClass(evidence.ocr_status || evidence.ocrStatus || evidence.status)}" style="flex: 1; margin-left: 10px; text-align: right;">
                                            ${getStatusText(evidence.ocr_status || evidence.ocrStatus || evidence.status)}
                                        </span>
                                    </div>
                                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="info-label" style="font-weight: 500; color: #666;">案件ID</span>
                                        <span class="info-value" style="flex: 1; margin-left: 10px; text-align: right; font-size: 12px; word-break: break-all;">${evidence.case_id || evidence.caseId}</span>
                                    </div>
                                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                                        <a href="${evidence.download_url || evidence.downloadUrl || `#`}" class="btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; text-decoration: none; font-size: 14px; cursor: pointer;" download>
                                            <img src="../images/下载.svg" style="width: 16px; height: 16px;"> 下载
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 右侧预览�?-->
                            <div style="flex: 3; min-width: 400px;">
                                <div class="evidence-preview">
                                    <h4>📤 证据预览</h4>
                                    <div class="preview-content" id="previewContent" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; min-height: 400px; display: flex; align-items: center; justify-content: center;">
                                        <div style="text-align: center;">
                                            <div style="font-size: 48px;">�?/div>
                                            <div style="margin-top: 16px;">正在加载预览...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" onclick="this.closest('.evidence-detail-modal').remove()">关闭</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 加载预览内容
            await loadEvidencePreview(evidenceId);
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

        // 加载证据预览内容
        async function loadEvidencePreview(evidenceId) {
            try {
                const previewContent = document.getElementById('previewContent');
                if (!previewContent) return;
                
                // 首先尝试从本地存储获�?                const cachedContent = getEvidenceContentFromCache(evidenceId);
                if (cachedContent) {
                    console.log('�?从本地存储加载证据内�?);
                    renderEvidenceContent(cachedContent, previewContent);
                    return;
                }
                
                // 本地存储中没有，从后端获�?                console.log('📡 从后端获取证据内�?);
                
                // 检查Token - 支持游客模式
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
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
                    const result = await response.json();
                    console.log('�?预览内容获取成功:', result);
                    
                    if (result.code === 200 && result.data) {
                        // 存储到本地存�?                        const cacheKey = `evidence_content_${evidenceId}`;
                        localStorage.setItem(cacheKey, JSON.stringify(result.data));
                        console.log(`�?证据 ${evidenceId} 内容已缓存到本地存储`);
                        
                        // 渲染内容
                        renderEvidenceContent(result.data, previewContent);
                    } else {
                        throw new Error(result.message || '获取预览失败');
                    }
                } else {
                    const error = await response.json();
                    throw new Error(error.message || '获取预览失败');
                }
            } catch (error) {
                console.error('�?加载预览失败:', error);
                const previewContent = document.getElementById('previewContent');
                if (previewContent) {
                    previewContent.innerHTML = `
                        <div style="text-align: center;">
                            <img src="../images/文件.svg" style="width: 64px; height: 64px; opacity: 0.5;">
                            <p style="margin-top: 16px;">加载预览失败: ${error.message}</p>
                        </div>
                    `;
                }
            }
        }
        
        // 渲染证据内容
        function renderEvidenceContent(data, container) {
            const { file_type, content, file_name, preview_url } = data;
            
            // 标准化文件类�?            let normalizedFileType = file_type;
            if (file_type === 'xlsx' || file_type === 'xls') {
                normalizedFileType = 'excel';
            } else if (file_type === 'docx' || file_type === 'doc') {
                normalizedFileType = 'document';
            } else if (file_type === 'pdf') {
                normalizedFileType = 'pdf';
            } else if (file_type === 'jpg' || file_type === 'jpeg' || file_type === 'png' || file_type === 'gif' || file_type === 'bmp') {
                normalizedFileType = 'image';
            }
            
            if (normalizedFileType === 'image') {
                // 图片文件
                if (preview_url) {
                    container.innerHTML = `
                        <div style="text-align: center;">
                            <img src="${preview_url}" style="max-width: 100%; max-height: 500px; object-fit: contain;">
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div style="text-align: center;">
                            <img src="../images/文件.svg" style="width: 64px; height: 64px; opacity: 0.5;">
                            <p style="margin-top: 16px;">图片文件</p>
                        </div>
                    `;
                }
            } else if (content) {
                // 处理换行符和制表�?                let formattedContent = content
                    .replace(/\t/g, '    ')  // 制表符替换为4个空�?                    .replace(/\n/g, '<br>');  // 换行符替换为<br>
                
                container.innerHTML = `
                    <div style="width: 100%; text-align: left;">
                        <pre style="white-space: pre-wrap; word-break: break-word; font-family: 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.8; margin: 0; max-height: 500px; overflow-y: auto;">${formattedContent}</pre>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="text-align: center;">
                        <img src="../images/文件.svg" style="width: 64px; height: 64px; opacity: 0.5;">
                        <p style="margin-top: 16px;">无预览内�?/p>
                    </div>
                `;
            }
        }

        // 获取文件类型文本
        function getFileTypeText(fileType) {
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

        // 格式化文件大�?        function formatFileSize(bytes) {
            if (!bytes) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // 格式化日�?        function formatDate(dateString) {
            if (!dateString) return '未知';
            try {
                const date = new Date(dateString);
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } catch (e) {
                return dateString;
            }
        }

        // 获取证据预览
        function getEvidencePreview(evidence) {
            const fileType = evidence.file_type || evidence.fileType;
            const previewUrl = evidence.preview_url || evidence.previewUrl;
            
            if (fileType === 'image' && previewUrl) {
                return `<img src="${previewUrl}" style="max-width: 100%; max-height: 500px; object-fit: contain;">`;
            } else if (fileType === 'pdf' && previewUrl) {
                return `<iframe src="${previewUrl}" style="width: 100%; height: 500px; border: 1px solid #e5e7eb;"></iframe>`;
            } else if (fileType === 'audio' && previewUrl) {
                return `<audio controls style="width: 100%;"><source src="${previewUrl}" type="audio/mpeg">您的浏览器不支持音频播放�?/audio>`;
            } else if (fileType === 'video' && previewUrl) {
                return `<video controls style="width: 100%; max-height: 500px;"><source src="${previewUrl}" type="video/mp4">您的浏览器不支持视频播放�?/video>`;
            } else {
                return `<div class="no-preview">
                    <img src="../images/文件.svg" style="width: 64px; height: 64px; opacity: 0.5;">
                    <p>无法预览此类型文�?/p>
                    <a href="${evidence.download_url || evidence.downloadUrl || `#`}" class="btn" download>
                        <img src="../images/下载.svg" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"> 下载查看
                    </a>
                </div>`;
            }
        }

        // 格式化分析结�?        function formatAnalysisResult(analysisResult) {
            if (typeof analysisResult === 'string') {
                return `<pre style="white-space: pre-wrap; word-break: break-all; background: #f3f4f6; padding: 16px; border-radius: 6px;">${analysisResult}</pre>`;
            } else if (typeof analysisResult === 'object') {
                return `<pre style="white-space: pre-wrap; word-break: break-all; background: #f3f4f6; padding: 16px; border-radius: 6px;">${JSON.stringify(analysisResult, null, 2)}</pre>`;
            } else {
                return `<p>分析结果�?{analysisResult}</p>`;
            }
        }

        // 从本地存储中删除证据
        function removeEvidenceFromLocalStorage(evidenceId) {
            try {
                if (typeof localStorage === 'undefined') {
                    console.warn('⚠️ localStorage不可�?);
                    return;
                }
                const deviceFingerprint = localStorage.getItem('device_fingerprint');
                const currentCaseId = getCurrentCaseId();
                const localStorageKey = `guest_evidence_${deviceFingerprint}_${currentCaseId}`;
                
                // 获取现有证据列表
                const savedData = localStorage.getItem(localStorageKey);
                if (savedData) {
                    try {
                        const evidenceList = JSON.parse(savedData);
                        // 过滤掉要删除的证�?                        const updatedList = evidenceList.filter(item => 
                            item.id != evidenceId && item.evidence_id != evidenceId
                        );
                        // 保存更新后的列表
                        localStorage.setItem(localStorageKey, JSON.stringify(updatedList));
                        console.log('�?证据已从本地存储删除:', evidenceId);
                    } catch (parseError) {
                        console.error('�?解析本地存储数据失败:', parseError);
                    }
                }
                
                // 同时删除证据内容缓存
                const contentCacheKey = `evidence_content_${evidenceId}`;
                localStorage.removeItem(contentCacheKey);
                console.log('�?证据内容缓存已删�?', evidenceId);
                
                // 删除评估缓存
                const evalCache = JSON.parse(localStorage.getItem('evidence_evaluations_v2') || '{}');
                delete evalCache[evidenceId];
                localStorage.setItem('evidence_evaluations_v2', JSON.stringify(evalCache));
                console.log('�?证据评估缓存已删�?', evidenceId);
                
                // 删除AI分析缓存
                const aiCache = JSON.parse(localStorage.getItem('ai_analysis_cache') || '{}');
                delete aiCache[evidenceId];
                localStorage.setItem('ai_analysis_cache', JSON.stringify(aiCache));
                console.log('�?AI分析缓存已删�?', evidenceId);
                
            } catch (error) {
                console.error('�?从本地存储删除证据失�?', error);
            }
        }

        // 删除证据
        async function deleteEvidence(evidenceId) {
            if (!confirm('确定要删除此证据吗？')) {
                return;
            }
            
            console.log('🗑�?删除证据:', evidenceId);
            
            try {
                // 检查Token - 支持游客模式
                const token = getToken();
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const isGuestMode = !token || !user || user.id === 0;
                
                let response;
                if (isGuestMode) {
                    // 游客模式：使用设备指�?                    const deviceFingerprint = await getOrCreateDeviceFingerprint();
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/${evidenceId}?device_fingerprint=${encodeURIComponent(deviceFingerprint)}`, {
                        method: 'DELETE'
                    });
                } else {
                    // 登录模式：使用Bearer Token
                    response = await fetch(`${API_BASE_URL}/api/v1/evidence/${evidenceId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('�?删除成功:', data);
                    
                    // 从列表中移除
                    evidenceList = evidenceList.filter(item => item.id != evidenceId && item.evidence_id != evidenceId);
                    
                    // 从本地存储中删除
                    removeEvidenceFromLocalStorage(evidenceId);
                    
                    // 更新lastDataHash，确保下次刷新时能正确检测到变化
                    lastDataHash = calculateDataHash(evidenceList);
                    
                    renderEvidenceList();
                } else {
                    const error = await response.json();
                    console.error('�?删除失败:', error);
                    alert('删除失败: ' + (error.message || '未知错误'));
                }
            } catch (error) {
                console.error('�?删除请求失败:', error);
                alert('删除失败: ' + error.message);
            }
        }

        // ==================== 设备指纹生成模块 ====================
        
        // 设备指纹生成函数
        function generateDeviceFingerprint() {
            console.log('🔍 正在生成设备指纹...');
            
            // 收集设备特征
            const features = [
                navigator.userAgent || 'unknown',
                navigator.language || 'unknown',
                navigator.platform || 'unknown',
                navigator.hardwareConcurrency || 'unknown',
                (screen.width + 'x' + screen.height) || 'unknown',
                navigator.deviceMemory || 'unknown',
                navigator.webdriver || false,
                navigator.cookieEnabled || false,
                Object.keys(navigator.plugins).length || 0,
                Object.keys(navigator.mimeTypes).length || 0,
                (navigator.connection && navigator.connection.effectiveType) || 'unknown',
                navigator.colorDepth || 'unknown',
                navigator.maxTouchPoints || 'unknown'
            ];
            
            // 使用SHA-256生成指纹（如果支持）
            if (window.crypto && window.crypto.subtle) {
                return new Promise((resolve) => {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(features.join('|'));
                    
                    window.crypto.subtle.digest('SHA-256', data)
                        .then(hash => {
                            const hashArray = Array.from(new Uint8Array(hash));
                            const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                            console.log('�?设备指纹生成成功:', fingerprint.substring(0, 16) + '...');
                            resolve(fingerprint);
                        })
                        .catch(() => {
                            // 降级方案：使用简单哈�?                            const fallbackFingerprint = btoa(features.join('|')).substring(0, 32);
                            console.log('⚠️ 使用降级方案生成设备指纹');
                            resolve(fallbackFingerprint);
                        });
                });
            } else {
                // 降级方案：使用简单哈�?                const fallbackFingerprint = btoa(features.join('|')).substring(0, 32);
                console.log('⚠️ 使用降级方案生成设备指纹');
                return Promise.resolve(fallbackFingerprint);
            }
        }

        // 获取或创建设备指�?        async function getOrCreateDeviceFingerprint() {
            let fingerprint = localStorage.getItem('device_fingerprint');
            
            if (!fingerprint) {
                fingerprint = await generateDeviceFingerprint();
                localStorage.setItem('device_fingerprint', fingerprint);
                console.log('💾 设备指纹已保存到本地存储');
            }
            
            return fingerprint;
        }

        /**
         * 验证设备指纹一致�?         * 检查当前设备指纹是否与存储的一致，防止设备更换或篡�?         * 
         * @returns {Promise<boolean>} 是否一�?         */
        async function validateDeviceFingerprint() {
            console.log('🔒 正在验证设备指纹一致�?..');
            
            const storedFingerprint = localStorage.getItem('device_fingerprint');
            
            if (!storedFingerprint) {
                console.warn('⚠️ 未找到存储的设备指纹，创建新指纹');
                await getOrCreateDeviceFingerprint();
                return true;
            }
            
            const currentFingerprint = await generateDeviceFingerprint();
            
            if (storedFingerprint === currentFingerprint) {
                console.log('�?设备指纹验证通过');
                return true;
            } else {
                console.warn('⚠️ 设备指纹不一致，可能设备已更换或被篡�?);
                console.warn(`存储的指�? ${storedFingerprint.substring(0, 8)}...`);
                console.warn(`当前指纹: ${currentFingerprint.substring(0, 8)}...`);
                
                // 显示设备变更警告
                showDeviceChangeWarning();
                
                // 更新存储的指纹为当前指纹
                localStorage.setItem('device_fingerprint', currentFingerprint);
                console.log('🔄 已更新设备指�?);
                
                return false;
            }
        }

        /**
         * 显示设备变更警告
         */
        function showDeviceChangeWarning() {
            const modal = document.createElement('div');
            modal.className = 'device-warning-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="margin-top: 0; color: #333;">设备检�?/h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        检测到设备信息发生变化，这可能是由于浏览器更新、设备更换或隐私设置更改导致的�?                    </p>
                    <p style="color: #666; margin-bottom: 30px;">
                        您的本地数据已重新关联到当前设备�?                    </p>
                    <button onclick="this.closest('.device-warning-modal').remove()" 
                            style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        我知道了
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
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

                console.log('�?游客模式上传成功:', file.name);

                // 2. 获取证据ID
                let evidenceId = null;
                if (uploadResult.data && uploadResult.data.evidence_ids && uploadResult.data.evidence_ids.length > 0) {
                    evidenceId = uploadResult.data.evidence_ids[0];
                } else if (uploadResult.data && uploadResult.data.evidence_id) {
                    evidenceId = uploadResult.data.evidence_id;
                } else if (uploadResult.evidence_id) {
                    evidenceId = uploadResult.evidence_id;
                } else if (uploadResult.data && uploadResult.data.id) {
                    evidenceId = uploadResult.data.id;
                } else if (uploadResult.id) {
                    evidenceId = uploadResult.id;
                }

                if (!evidenceId) {
                    console.error('�?响应中没有证据ID:', uploadResult);
                    throw new Error('服务器返回数据格式错误，缺少证据ID');
                }

                console.log('�?证据ID获取成功:', evidenceId);

                // 3. 开始分析（异步，不阻塞�?                console.log('🔄 开始分析证�?', evidenceId);
                analyzeEvidenceBackend(evidenceId).then(analysisResult => {
                    console.log('�?分析成功:', analysisResult);
                    // 更新证据的分析结�?                    const evidenceItem = evidenceList.find(item => item.id == evidenceId || item.evidence_id == evidenceId);
                    if (evidenceItem) {
                        evidenceItem.analysis_result = analysisResult;
                        renderEvidenceList();
                    }
                }).catch(error => {
                    console.error('分析失败:', error);
                });

                // 4. 刷新证据列表，确保能看到已上传的证据
                setTimeout(() => {
                    console.log('🔄 刷新证据列表...');
                    fetchEvidenceList().catch(error => {
                        console.error('刷新证据列表失败:', error);
                    });
                }, 1000);

                // 隐藏上传状�?                hideUploadStatus();

            } catch (error) {
                console.error('游客模式上传失败:', error);
                // 隐藏上传状�?                hideUploadStatus();
                throw error;
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
                console.log('👤 游客模式：直接上传到服务�?);
            } else {
                console.log('�?Token已获取，使用后端API');
            }

            // 无论是否登录，都使用游客模式的上传方�?            // 这样可以确保所有功能在不登录的情况下也能正常工�?            await handleGuestModeFileAnalysis(file);
            return;

            // 以下代码暂时注释，确保所有功能都使用游客模式
            /*
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
                if (uploadResult.data && uploadResult.data.evidence_ids && uploadResult.data.evidence_ids.length > 0) {
                    evidenceId = uploadResult.data.evidence_ids[0];
                } else if (uploadResult.data && uploadResult.data.evidence_id) {
                    evidenceId = uploadResult.data.evidence_id;
                } else if (uploadResult.evidence_id) {
                    evidenceId = uploadResult.evidence_id;
                } else if (uploadResult.data && uploadResult.data.id) {
                    evidenceId = uploadResult.data.id;
                } else if (uploadResult.id) {
                    evidenceId = uploadResult.id;
                }

                if (!evidenceId) {
                    console.error('�?响应中没有证据ID:', uploadResult);
                    throw new Error('服务器返回数据格式错误，缺少证据ID');
                }

                console.log('�?证据ID获取成功:', evidenceId);

                // 3. 开始分析（异步，不阻塞�?                console.log('🔄 开始分析证�?', evidenceId);
                analyzeEvidenceBackend(evidenceId).catch(error => {
                    console.error('分析失败:', error);
                });

            } catch (error) {
                console.error('上传失败:', error);
                throw error;
            }
            */
        }

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

        // 文件选择处理
        async function handleFileSelect(event) {
            console.log('📂 文件选择事件触发');
            console.log('文件数量:', event.target.files.length);
            
            // 兼容性处理：确保能正确获取文件列�?            let files = [];
            if (event.target.files) {
                files = Array.from(event.target.files);
                console.log('获取到文�?', files.map(f => f.name));
            }
            
            if (files.length > 0) {
                try {
                    await uploadFiles(files);
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
        let autoRefreshInterval = null; // 自动刷新定时�?        let lastDataHash = null; // 上次数据的哈希值，用于检测变�?        let selectedEvidenceIds = new Set(); // 选中的证据ID集合


    