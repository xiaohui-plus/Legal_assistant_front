// 法律工具箱计算器 - 重新实现版本
// 直接操作模态框中的结果面板

function calculateLitigationFee() {
    console.log('诉讼费计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const caseType = modal.querySelector('#caseType');
    const amountInput = modal.querySelector('#amount');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!caseType || !amountInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效的诉讼标的额');
        return;
    }

    let fee = 0;
    let caseTypeName = '财产案件';
    
    switch(caseType.value) {
        case 'property':
            if (amount <= 10000) fee = 50;
            else if (amount <= 100000) fee = 50 + (amount - 10000) * 0.025;
            else if (amount <= 200000) fee = 2300 + (amount - 100000) * 0.02;
            else if (amount <= 500000) fee = 4300 + (amount - 200000) * 0.015;
            else if (amount <= 1000000) fee = 8800 + (amount - 500000) * 0.01;
            else if (amount <= 2000000) fee = 13800 + (amount - 1000000) * 0.009;
            else if (amount <= 5000000) fee = 22800 + (amount - 2000000) * 0.008;
            else if (amount <= 10000000) fee = 46800 + (amount - 5000000) * 0.007;
            else if (amount <= 20000000) fee = 81800 + (amount - 10000000) * 0.006;
            else fee = 141800 + (amount - 20000000) * 0.005;
            break;
        case 'non-property':
            fee = 100;
            caseTypeName = '非财产案件';
            break;
        case 'divorce':
            fee = 300;
            caseTypeName = '离婚案件';
            break;
        case 'labor':
            fee = 10;
            caseTypeName = '劳动争议案件';
            break;
    }

    // 生成计算逻辑说明
    let calculationLogic = '';
    if (caseType.value === 'property') {
        if (amount <= 10000) {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 在 10,000元以下<br>
2. 按照固定金额收取：<strong>¥50.00</strong>`;
        } else if (amount <= 100000) {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 在 10,000-100,000元区间<br>
2. 计算公式：50 + (标的额 - 10,000) × 2.5%<br>
3. 计算过程：50 + (${amount.toLocaleString()} - 10,000) × 0.025<br>
4. 结果：<strong>¥${fee.toFixed(2)}</strong>`;
        } else if (amount <= 200000) {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 在 100,000-200,000元区间<br>
2. 计算公式：2,300 + (标的额 - 100,000) × 2%<br>
3. 计算过程：2,300 + (${amount.toLocaleString()} - 100,000) × 0.02<br>
4. 结果：<strong>¥${fee.toFixed(2)}</strong>`;
        } else if (amount <= 500000) {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 在 200,000-500,000元区间<br>
2. 计算公式：4,300 + (标的额 - 200,000) × 1.5%<br>
3. 计算过程：4,300 + (${amount.toLocaleString()} - 200,000) × 0.015<br>
4. 结果：<strong>¥${fee.toFixed(2)}</strong>`;
        } else if (amount <= 1000000) {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 在 500,000-1,000,000元区间<br>
2. 计算公式：8,800 + (标的额 - 500,000) × 1%<br>
3. 计算过程：8,800 + (${amount.toLocaleString()} - 500,000) × 0.01<br>
4. 结果：<strong>¥${fee.toFixed(2)}</strong>`;
        } else {
            calculationLogic = `1. 诉讼标的额 ¥${amount.toLocaleString()} 超过 1,000,000元<br>
2. 适用分段累进计算方式<br>
3. 最终结果：<strong>¥${fee.toFixed(2)}</strong>`;
        }
    } else {
        calculationLogic = `1. 案件类型：${caseTypeName}<br>
2. 按照固定金额收取<br>
3. 费用标准：<strong>¥${fee.toFixed(2)}</strong>`;
    }

    // 渲染结果到右侧面板
    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">📊 诉讼费计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">案件类型：</span>
                    <span style="color:#1e293b;">${caseTypeName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">诉讼标的额：</span>
                    <span style="color:#1e293b;">¥${amount.toLocaleString()}</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#374151;font-size:14px;">应缴诉讼费：</span>
                        <span style="color:#166534;font-size:20px;font-weight:700;">¥${fee.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算逻辑</h5>
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.8;">${calculationLogic}</p>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-top:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">📖 法律依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">根据《诉讼费用交纳办法》计算，实际费用以法院收取为准</p>
            </div>
        </div>
    `;
}

function calculateInterest() {
    console.log('利息计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const principalInput = modal.querySelector('#principal');
    const rateInput = modal.querySelector('#rate');
    const daysInput = modal.querySelector('#days');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!principalInput || !rateInput || !daysInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const principal = parseFloat(principalInput.value);
    const rate = parseFloat(rateInput.value);
    const days = parseInt(daysInput.value);
    
    if (isNaN(principal) || principal <= 0) {
        alert('请输入有效的本金金额');
        return;
    }
    if (isNaN(rate) || rate <= 0) {
        alert('请输入有效的年利率');
        return;
    }
    if (isNaN(days) || days <= 0) {
        alert('请输入有效的借款天数');
        return;
    }

    const interest = principal * (rate / 100) * (days / 365);
    const total = principal + interest;

    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">💰 利息计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">本金：</span>
                    <span style="color:#1e293b;">¥${principal.toLocaleString()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">年利率：</span>
                    <span style="color:#1e293b;">${rate}%</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">借款天数：</span>
                    <span style="color:#1e293b;">${days}天</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#374151;font-size:14px;">利息：</span>
                        <span style="color:#166534;font-size:16px;font-weight:600;">¥${interest.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#374151;font-size:14px;">本息合计：</span>
                        <span style="color:#1e40af;font-size:16px;font-weight:600;">¥${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">利息 = 本金 × 年利率(%) ÷ 100 × (借款天数 ÷ 365)</p>
            </div>
        </div>
    `;
}

function calculateWorkInjury() {
    console.log('工伤赔偿计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const levelInput = modal.querySelector('#disabilityLevel');
    const salaryInput = modal.querySelector('#salary');
    const avgSalaryInput = modal.querySelector('#avgSalary');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!levelInput || !salaryInput || !avgSalaryInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const level = parseInt(levelInput.value);
    const salary = parseFloat(salaryInput.value);
    const avgSalary = parseFloat(avgSalaryInput.value);
    
    if (isNaN(level) || level < 1 || level > 10) {
        alert('请选择有效的伤残等级');
        return;
    }
    if (isNaN(salary) || salary <= 0) {
        alert('请输入有效的本人工资');
        return;
    }
    if (isNaN(avgSalary) || avgSalary <= 0) {
        alert('请输入有效的平均工资');
        return;
    }

    const subsidyMonths = { 1: 27, 2: 25, 3: 23, 4: 21, 5: 18, 6: 16, 7: 13, 8: 11, 9: 9, 10: 7 };
    const subsidy = salary * subsidyMonths[level];
    
    let medicalSubsidy = 0;
    let employmentSubsidy = 0;
    
    if (level >= 5 && level <= 10) {
        const medicalMonths = { 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
        const employmentMonths = { 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
        medicalSubsidy = avgSalary * medicalMonths[level];
        employmentSubsidy = avgSalary * employmentMonths[level];
    }
    
    const total = subsidy + medicalSubsidy + employmentSubsidy;

    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">⚕️ 工伤赔偿计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">伤残等级：</span>
                    <span style="color:#1e293b;">${level}级</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">本人工资：</span>
                    <span style="color:#1e293b;">¥${salary.toLocaleString()}/月</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#374151;font-size:14px;">一次性伤残补助金：</span>
                        <span style="color:#166534;font-size:16px;font-weight:600;">¥${subsidy.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#374151;font-size:14px;">一次性医疗补助金：</span>
                        <span style="color:#166534;font-size:16px;font-weight:600;">¥${medicalSubsidy.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#374151;font-size:14px;">一次性就业补助金：</span>
                        <span style="color:#166534;font-size:16px;font-weight:600;">¥${employmentSubsidy.toFixed(2)}</span>
                    </div>
                    <div style="border-top:1px dashed #86efac;padding-top:8px;margin-top:8px;">
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:#374151;font-size:14px;font-weight:600;">合计：</span>
                            <span style="color:#1e40af;font-size:18px;font-weight:700;">¥${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">根据《工伤保险条例》及地方规定计算</p>
            </div>
        </div>
    `;
}

function calculateTrafficAccident() {
    console.log('交通事故赔偿计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const medicalInput = modal.querySelector('#medicalFee');
    const daysInput = modal.querySelector('#lostWorkDays');
    const wageInput = modal.querySelector('#dailyWage');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!medicalInput || !daysInput || !wageInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const medical = parseFloat(medicalInput.value) || 0;
    const days = parseFloat(daysInput.value) || 0;
    const wage = parseFloat(wageInput.value) || 0;

    const lossOfWork = days * wage;
    const care = days * 100; // 护理费按每天100元估算
    const total = medical + lossOfWork + care;

    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">🚗 交通事故赔偿计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">医疗费：</span>
                    <span style="color:#1e293b;">¥${medical.toLocaleString()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">误工费：</span>
                    <span style="color:#1e293b;">¥${lossOfWork.toLocaleString()} (${days}天 × ¥${wage}/天)</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">护理费（估算）：</span>
                    <span style="color:#1e293b;">¥${care.toLocaleString()}</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#374151;font-size:14px;font-weight:600;">合计赔偿：</span>
                        <span style="color:#1e40af;font-size:18px;font-weight:700;">¥${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">根据《民法典》侵权责任编及相关司法解释</p>
            </div>
        </div>
    `;
}

function calculateLaborCompensation() {
    console.log('劳动补偿金计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const yearsInput = modal.querySelector('#workYears');
    const salaryInput = modal.querySelector('#monthlySalary');
    const compensationTypeInput = modal.querySelector('#compensationType');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!yearsInput || !salaryInput || !compensationTypeInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const years = parseFloat(yearsInput.value);
    const salary = parseFloat(salaryInput.value);
    const compensationType = compensationTypeInput.value;
    
    if (isNaN(salary) || salary <= 0) {
        alert('请输入有效的月工资');
        return;
    }
    if (isNaN(years) || years <= 0) {
        alert('请输入有效的工作年限');
        return;
    }

    const isDouble = compensationType === 'double';
    const multiplier = isDouble ? 2 : 1;
    const compensation = salary * years * multiplier;
    const compensationTypeName = isDouble ? '违法解除赔偿金（2N）' : '经济补偿金（N）';

    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">💼 劳动补偿金计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">月工资：</span>
                    <span style="color:#1e293b;">¥${salary.toLocaleString()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">工作年限：</span>
                    <span style="color:#1e293b;">${years}年</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">补偿类型：</span>
                    <span style="color:#1e293b;">${compensationTypeName}</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#374151;font-size:14px;font-weight:600;">应得补偿：</span>
                        <span style="color:#1e40af;font-size:18px;font-weight:700;">¥${compensation.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">根据《劳动合同法》第47条，经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资</p>
            </div>
        </div>
    `;
}

function calculatePenalty() {
    console.log('违约金计算器 - 开始计算');
    
    const modal = document.querySelector('.tool-modal');
    if (!modal) {
        alert('未找到计算器模态框');
        return;
    }
    
    const contractAmountInput = modal.querySelector('#contractAmount');
    const penaltyRateInput = modal.querySelector('#penaltyRate');
    const actualLossInput = modal.querySelector('#actualLoss');
    const resultPanel = modal.querySelector('.tool-right-panel');
    
    if (!contractAmountInput || !penaltyRateInput || !resultPanel) {
        alert('表单元素加载失败');
        return;
    }
    
    const contractAmount = parseFloat(contractAmountInput.value);
    const penaltyRate = parseFloat(penaltyRateInput.value) || 30;
    const actualLoss = parseFloat(actualLossInput.value) || 0;
    
    if (isNaN(contractAmount) || contractAmount <= 0) {
        alert('请输入有效的合同金额');
        return;
    }

    const penalty = contractAmount * (penaltyRate / 100);
    const maxPenalty = actualLoss > 0 ? actualLoss * 1.3 : contractAmount * 0.3;
    const finalPenalty = Math.min(penalty, maxPenalty);

    resultPanel.classList.remove('empty');
    resultPanel.innerHTML = `
        <div style="padding:20px;">
            <h4 style="margin:0 0 16px 0;color:#166534;font-size:16px;font-weight:600;">⚖️ 违约金计算结果</h4>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">合同金额：</span>
                    <span style="color:#1e293b;">¥${contractAmount.toLocaleString()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;">
                    <span style="color:#64748b;">违约金比例：</span>
                    <span style="color:#1e293b;">${penaltyRate}%</span>
                </div>
                <div style="border-top:2px solid #86efac;padding-top:8px;margin-top:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#374151;font-size:14px;">计算违约金：</span>
                        <span style="color:#166534;font-size:16px;font-weight:600;">¥${penalty.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="color:#374151;font-size:14px;">应付违约金：</span>
                        <span style="color:#1e40af;font-size:16px;font-weight:600;">¥${finalPenalty.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <h5 style="margin:0 0 8px 0;color:#374151;font-size:13px;font-weight:600;">💡 计算依据</h5>
                <p style="margin:0;font-size:12px;color:#64748b;">根据《民法典》规定，约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少（通常不超过实际损失的130%）</p>
            </div>
        </div>
    `;
}

// 绑定到window对象
function bindCalculators() {
    window.calculateLitigationFee = calculateLitigationFee;
    window.calculateInterest = calculateInterest;
    window.calculateWorkInjury = calculateWorkInjury;
    window.calculateTrafficAccident = calculateTrafficAccident;
    window.calculateLaborCompensation = calculateLaborCompensation;
    window.calculatePenalty = calculatePenalty;
    console.log('法律工具箱计算器已加载并覆盖');
}

// 立即绑定
bindCalculators();

// 页面加载完成后多次绑定，确保覆盖HTML内嵌版本
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(bindCalculators, 50);
    setTimeout(bindCalculators, 100);
    setTimeout(bindCalculators, 200);
});

// 监听模态框打开事件
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tool-btn') || e.target.closest('.tool-btn')) {
        setTimeout(bindCalculators, 100);
    }
});
