/**
 * 文书状态管理
 */
import { defineStore } from 'pinia'
import { get, post } from '@/utils/request'
import { generateId } from '@/utils/common'

export const useDocumentStore = defineStore('document', {
	state: () => ({
		// 文书模板列表
		templates: [],
		// 用户文书列表
		documents: [],
		// 当前选中的模板
		selectedTemplate: null,
		// 表单数据
		formData: {},
		// 生成的文书内容
		generatedDocument: null,
		// 加载状态
		loading: false,
		// 生成状态
		generating: false
	}),
	
	getters: {
		// 是否有模板
		hasTemplates: (state) => state.templates.length > 0,
		
		// 是否有文书
		hasDocuments: (state) => state.documents.length > 0,
		
		// 模板数量
		templateCount: (state) => state.templates.length,
		
		// 文书数量
		documentCount: (state) => state.documents.length
	},
	
	actions: {
		/**
		 * 获取文书模板
		 */
		async getTemplates() {
			try {
				this.loading = true
				
				// 先使用默认模板
				this.templates = this.getDefaultTemplates()
				
				// 尝试从后端获取
				try {
					const response = await get('/api/documents/templates', {}, {
						loading: false
					})
					
					if (response.templates && response.templates.length > 0) {
						this.templates = response.templates
					}
				} catch (error) {
					console.log('使用默认模板:', error.message)
				}
				
				return this.templates
			} catch (error) {
				console.error('获取模板失败:', error)
				throw error
			} finally {
				this.loading = false
			}
		},
		
		/**
		 * 获取默认模板
		 */
		getDefaultTemplates() {
			return [
				{
					id: 1,
					name: "个人借款合同",
					type: "contract",
					icon: "📝",
					description: "符合《民法典》要求的完善个人借款合同",
					form_config: [
						{name: "lender_name", label: "出借人姓名", type: "text", required: true},
						{name: "lender_id", label: "出借人身份证号", type: "text", required: true},
						{name: "lender_phone", label: "出借人联系电话", type: "text", required: true},
						{name: "borrower_name", label: "借款人姓名", type: "text", required: true},
						{name: "borrower_id", label: "借款人身份证号", type: "text", required: true},
						{name: "borrower_phone", label: "借款人联系电话", type: "text", required: true},
						{name: "amount", label: "借款金额（元）", type: "number", required: true},
						{name: "amount_chinese", label: "借款金额（大写）", type: "text", required: true},
						{name: "loan_purpose", label: "借款用途", type: "text", required: true},
						{name: "term", label: "借款期限（月）", type: "number", required: true},
						{name: "rate", label: "年利率（%）", type: "number", required: true},
						{name: "signing_date", label: "签署日期", type: "date", required: true}
					]
				},
				{
					id: 2,
					name: "离婚协议书",
					type: "agreement",
					icon: "💔",
					description: "符合《民法典》要求的标准离婚协议书",
					form_config: [
						{name: "husband_name", label: "男方姓名", type: "text", required: true},
						{name: "husband_id", label: "男方身份证号", type: "text", required: true},
						{name: "husband_phone", label: "男方联系电话", type: "text", required: true},
						{name: "wife_name", label: "女方姓名", type: "text", required: true},
						{name: "wife_id", label: "女方身份证号", type: "text", required: true},
						{name: "wife_phone", label: "女方联系电话", type: "text", required: true},
						{name: "marriage_date", label: "结婚登记日期", type: "date", required: true},
						{name: "has_children", label: "是否有子女", type: "select", options: ["是", "否"], required: true},
						{name: "child_custody", label: "子女抚养权", type: "select", options: ["男方", "女方", "共同抚养"], required: false},
						{name: "has_property", label: "是否有房产", type: "select", options: ["是", "否"], required: true},
						{name: "property_ownership", label: "房产归属", type: "select", options: ["男方", "女方", "出售分割"], required: false}
					]
				},
				{
					id: 3,
					name: "劳动合同",
					type: "contract",
					icon: "👔",
					description: "符合《劳动合同法》的标准劳动合同模板",
					form_config: [
						{name: "company_name", label: "用人单位名称", type: "text", required: true},
						{name: "legal_representative", label: "法定代表人", type: "text", required: true},
						{name: "employee_name", label: "员工姓名", type: "text", required: true},
						{name: "employee_id", label: "身份证号", type: "text", required: true},
						{name: "position", label: "工作岗位", type: "text", required: true},
						{name: "work_location", label: "工作地点", type: "text", required: true},
						{name: "contract_term", label: "合同期限（年）", type: "number", required: true},
						{name: "start_date", label: "合同开始日期", type: "date", required: true},
						{name: "probation_period", label: "试用期（月）", type: "select", options: ["无试用期", "1", "2", "3", "6"], required: true},
						{name: "basic_salary", label: "基本工资（元）", type: "number", required: true}
					]
				},
				{
					id: 4,
					name: "房屋租赁合同",
					type: "contract",
					icon: "🏠",
					description: "标准房屋租赁合同，符合相关法律法规要求",
					form_config: [
						{name: "lessor_name", label: "出租方姓名", type: "text", required: true},
						{name: "lessor_id", label: "出租方身份证号", type: "text", required: true},
						{name: "lessee_name", label: "承租方姓名", type: "text", required: true},
						{name: "lessee_id", label: "承租方身份证号", type: "text", required: true},
						{name: "property_address", label: "房屋地址", type: "text", required: true},
						{name: "property_area", label: "房屋面积（平方米）", type: "number", required: true},
						{name: "lease_term", label: "租赁期限（月）", type: "number", required: true},
						{name: "monthly_rent", label: "月租金（元）", type: "number", required: true},
						{name: "deposit", label: "押金（元）", type: "number", required: true},
						{name: "start_date", label: "租赁开始日期", type: "date", required: true}
					]
				},
				{
					id: 5,
					name: "借条",
					type: "receipt",
					icon: "📋",
					description: "简单实用的借条模板，适用于个人间小额借款",
					form_config: [
						{name: "borrower_name", label: "借款人姓名", type: "text", required: true},
						{name: "lender_name", label: "出借人姓名", type: "text", required: true},
						{name: "amount", label: "借款金额（元）", type: "number", required: true},
						{name: "amount_chinese", label: "借款金额（大写）", type: "text", required: true},
						{name: "loan_purpose", label: "借款用途", type: "text", required: true},
						{name: "loan_date", label: "借款日期", type: "date", required: true},
						{name: "return_date", label: "约定还款日期", type: "date", required: true},
						{name: "interest_rate", label: "月利率（%）", type: "number", required: false}
					]
				}
			]
		},
		
		/**
		 * 选择模板
		 */
		selectTemplate(template) {
			this.selectedTemplate = template
			this.formData = {}
		},
		
		/**
		 * 更新表单数据
		 */
		updateFormData(fieldName, value) {
			this.formData[fieldName] = value
		},
		
		/**
		 * 批量更新表单数据
		 */
		setFormData(data) {
			this.formData = { ...this.formData, ...data }
		},
		
		/**
		 * 验证表单数据
		 */
		validateForm() {
			if (!this.selectedTemplate) {
				throw new Error('请选择文书模板')
			}
			
			const errors = []
			
			this.selectedTemplate.form_config.forEach(field => {
				if (field.required && !this.formData[field.name]) {
					errors.push(`${field.label}不能为空`)
				}
			})
			
			if (errors.length > 0) {
				throw new Error(errors[0])
			}
			
			return true
		},
		
		/**
		 * 生成文书
		 */
		async generateDocument() {
			try {
				this.generating = true
				
				// 验证表单
				this.validateForm()
				
				// 尝试调用后端接口
				try {
					const response = await post('/v1/documents/generate', {
						template_id: this.selectedTemplate.id,
						form_data: this.formData
					}, {
						loadingText: '生成文书中...'
					})
					
					this.generatedDocument = response
					
					// 添加到用户文书列表
					this.documents.unshift({
						...response,
						create_time: new Date().toISOString(),
						template_name: this.selectedTemplate.name
					})
					
					return response
				} catch (error) {
					// 后端失败时使用本地生成
					console.log('后端生成失败，使用本地生成:', error.message)
					return this.generateDocumentLocally()
				}
			} catch (error) {
				uni.showToast({
					title: error.message || '生成文书失败',
					icon: 'none'
				})
				throw error
			} finally {
				this.generating = false
			}
		},
		
		/**
		 * 本地生成文书
		 */
		generateDocumentLocally() {
			const template = this.selectedTemplate
			const data = this.formData
			
			let content = ''
			
			switch (template.id) {
				case 1: // 个人借款合同
					content = this.generateLoanContract(data)
					break
				case 2: // 离婚协议书
					content = this.generateDivorceAgreement(data)
					break
				case 3: // 劳动合同
					content = this.generateLaborContract(data)
					break
				case 4: // 房屋租赁合同
					content = this.generateRentalContract(data)
					break
				case 5: // 借条
					content = this.generateIOU(data)
					break
				default:
					content = this.generateGenericDocument(template, data)
			}
			
			const document = {
				id: generateId(),
				name: template.name,
				content,
				template_id: template.id,
				template_name: template.name,
				create_time: new Date().toISOString()
			}
			
			this.generatedDocument = document
			this.documents.unshift(document)
			
			uni.showToast({
				title: '文书生成成功',
				icon: 'success'
			})
			
			return document
		},
		
		/**
		 * 生成借款合同
		 */
		generateLoanContract(data) {
			return `个人借款合同

甲方（出借人）：${data.lender_name}
身份证号：${data.lender_id}
联系电话：${data.lender_phone}

乙方（借款人）：${data.borrower_name}
身份证号：${data.borrower_id}
联系电话：${data.borrower_phone}

根据《中华人民共和国民法典》等相关法律法规，甲乙双方在平等、自愿、协商一致的基础上，就借款事宜达成如下协议：

第一条 借款金额
乙方向甲方借款人民币${data.amount}元（大写：${data.amount_chinese}）。

第二条 借款用途
借款用途为：${data.loan_purpose}。乙方保证不将借款用于违法活动。

第三条 借款期限
借款期限为${data.term}个月，自${data.signing_date}起至${this.calculateEndDate(data.signing_date, data.term)}止。

第四条 利率
年利率为${data.rate}%，在法律允许范围内。

第五条 还款方式
乙方应于借款到期日一次性归还本金及利息。

第六条 违约责任
如乙方逾期还款，应按日支付逾期利息，逾期利率为年利率的1.5倍。

第七条 争议解决
因本合同发生争议，双方应协商解决；协商不成的，可向甲方所在地人民法院起诉。

第八条 合同生效
本合同自双方签字之日起生效。

甲方（出借人）：_________________ 日期：${data.signing_date}

乙方（借款人）：_________________ 日期：${data.signing_date}`
		},
		
		/**
		 * 生成离婚协议书
		 */
		generateDivorceAgreement(data) {
			return `离婚协议书

男方：${data.husband_name}
身份证号：${data.husband_id}
联系电话：${data.husband_phone}

女方：${data.wife_name}
身份证号：${data.wife_id}
联系电话：${data.wife_phone}

男女双方于${data.marriage_date}在民政部门登记结婚，现因感情不和，自愿离婚，经双方协商一致，对有关事项达成如下协议：

一、双方自愿解除婚姻关系

二、子女抚养问题
${data.has_children === '是' ? 
  `子女抚养权归${data.child_custody}，另一方享有探视权。` : 
  '双方无子女。'}

三、财产分割
${data.has_property === '是' ? 
  `房产归${data.property_ownership}所有。` : 
  '双方无共同财产。'}

四、债务处理
双方确认无共同债务，各自债务由各自承担。

五、其他约定
双方保证以上协议内容真实有效，如有隐瞒或虚假，愿承担相应法律责任。

本协议一式三份，双方各执一份，民政部门存档一份，自双方签字并经民政部门办理离婚登记后生效。

男方签字：_________________ 日期：_________

女方签字：_________________ 日期：_________`
		},
		
		/**
		 * 生成劳动合同
		 */
		generateLaborContract(data) {
			return `劳动合同

甲方（用人单位）：${data.company_name}
法定代表人：${data.legal_representative}

乙方（劳动者）：${data.employee_name}
身份证号：${data.employee_id}

根据《中华人民共和国劳动合同法》等法律法规，甲乙双方在平等自愿、协商一致的基础上签订本合同：

第一条 合同期限
本合同为固定期限劳动合同，期限${data.contract_term}年，自${data.start_date}起执行。

第二条 工作内容和地点
乙方从事${data.position}工作，工作地点为${data.work_location}。

第三条 试用期
${data.probation_period === '无试用期' ? '本合同无试用期。' : `试用期为${data.probation_period}个月。`}

第四条 工作时间
实行标准工时制，每日工作8小时，每周工作40小时。

第五条 劳动报酬
乙方基本工资为每月人民币${data.basic_salary}元。

第六条 社会保险
甲方依法为乙方缴纳社会保险费。

第七条 合同终止
合同期满或双方约定的合同终止条件出现时，本合同终止。

第八条 争议解决
因履行本合同发生争议，双方应协商解决；协商不成的，可申请劳动仲裁。

甲方（盖章）：_________________ 日期：_________

乙方（签字）：_________________ 日期：_________`
		},
		
		/**
		 * 生成租赁合同
		 */
		generateRentalContract(data) {
			return `房屋租赁合同

出租方（甲方）：${data.lessor_name}
身份证号：${data.lessor_id}

承租方（乙方）：${data.lessee_name}
身份证号：${data.lessee_id}

根据相关法律法规，甲乙双方在平等、自愿的基础上，就房屋租赁事宜达成如下协议：

第一条 租赁房屋
甲方将位于${data.property_address}的房屋（面积${data.property_area}平方米）出租给乙方使用。

第二条 租赁期限
租赁期限为${data.lease_term}个月，自${data.start_date}起至${this.calculateEndDate(data.start_date, data.lease_term)}止。

第三条 租金及支付方式
月租金为人民币${data.monthly_rent}元，乙方应于每月1日前支付当月租金。

第四条 押金
乙方应支付押金人民币${data.deposit}元，合同终止时，甲方在扣除相关费用后退还剩余押金。

第五条 房屋使用
乙方应合理使用房屋，不得改变房屋结构，不得从事违法活动。

第六条 维修责任
房屋自然损坏由甲方负责维修，人为损坏由乙方承担维修费用。

第七条 合同终止
租赁期满或双方协商一致可终止合同。

甲方（出租方）：_________________ 日期：_________

乙方（承租方）：_________________ 日期：_________`
		},
		
		/**
		 * 生成借条
		 */
		generateIOU(data) {
			return `借条

今借到${data.lender_name}人民币${data.amount}元（大写：${data.amount_chinese}），用于${data.loan_purpose}。

借款日期：${data.loan_date}
约定还款日期：${data.return_date}
${data.interest_rate ? `月利率：${data.interest_rate}%` : ''}

此据。

借款人：${data.borrower_name}
日期：${data.loan_date}`
		},
		
		/**
		 * 生成通用文书
		 */
		generateGenericDocument(template, data) {
			let content = `${template.name}\n\n`
			
			template.form_config.forEach(field => {
				if (data[field.name]) {
					content += `${field.label}：${data[field.name]}\n`
				}
			})
			
			content += `\n生成时间：${new Date().toLocaleString()}`
			
			return content
		},
		
		/**
		 * 计算结束日期
		 */
		calculateEndDate(startDate, months) {
			const date = new Date(startDate)
			date.setMonth(date.getMonth() + parseInt(months))
			return date.toISOString().split('T')[0]
		},
		
		/**
		 * 获取用户文书列表
		 */
		async getUserDocuments() {
			try {
				this.loading = true
				
				const response = await get('/v1/documents', {}, {
					loading: false
				})
				
				this.documents = response.documents || []
				
				return response
			} catch (error) {
				console.error('获取文书列表失败:', error)
				// 如果后端失败，使用本地存储的文书
				const localDocuments = uni.getStorageSync('userDocuments') || []
				this.documents = localDocuments
			} finally {
				this.loading = false
			}
		},
		
		/**
		 * 保存文书到本地
		 */
		saveDocumentToLocal(document) {
			const localDocuments = uni.getStorageSync('userDocuments') || []
			localDocuments.unshift(document)
			uni.setStorageSync('userDocuments', localDocuments)
		},
		
		/**
		 * 删除文书
		 */
		deleteDocument(documentId) {
			const index = this.documents.findIndex(doc => doc.id === documentId)
			if (index !== -1) {
				this.documents.splice(index, 1)
				
				// 同时删除本地存储
				const localDocuments = uni.getStorageSync('userDocuments') || []
				const localIndex = localDocuments.findIndex(doc => doc.id === documentId)
				if (localIndex !== -1) {
					localDocuments.splice(localIndex, 1)
					uni.setStorageSync('userDocuments', localDocuments)
				}
				
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
			}
		},
		
		/**
		 * 清空表单数据
		 */
		clearFormData() {
			this.formData = {}
			this.selectedTemplate = null
			this.generatedDocument = null
		}
	}
})