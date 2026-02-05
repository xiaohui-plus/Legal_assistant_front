<template>
	<view class="login-page">
		<view class="login-container">
			<!-- 顶部装饰 -->
			<view class="login-header">
				<view class="logo-container">
					<view class="logo-icon">⚖️</view>
					<view class="logo-text">法义AI助手</view>
				</view>
				<view class="header-subtitle">专业的法律AI咨询平台</view>
			</view>
			
			<!-- 登录表单 -->
			<view class="login-form" v-if="currentForm === 'login'">
				<view class="form-title">登录</view>
				
				<!-- 测试账号提示 -->
				<view class="test-hint">
					<view class="hint-title">🧪 测试账号</view>
					<view class="hint-content">
						手机号：<text class="hint-value">13800138000</text>
						密码：<text class="hint-value">123456</text>
					</view>
					<button class="quick-login-btn" @click="quickLogin">一键登录</button>
				</view>
				
				<form @submit.prevent="handleLogin">
					<view class="form-group">
						<input 
							class="form-input"
							type="text"
							placeholder="请输入手机号"
							v-model="loginForm.phone"
							maxlength="11"
						/>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="password"
							placeholder="请输入密码"
							v-model="loginForm.password"
							maxlength="20"
						/>
					</view>
					
					<button 
						class="submit-btn"
						:class="{ 'loading': loginLoading }"
						:disabled="loginLoading"
						@click="handleLogin"
					>
						<text v-if="!loginLoading">登录</text>
						<text v-else>登录中...</text>
					</button>
				</form>
				
				<view class="form-footer">
					<text class="footer-text">还没有账号？</text>
					<text class="footer-link" @click="switchForm('register')">立即注册</text>
				</view>
				
				<view class="forgot-link">
					<text @click="switchForm('forgot')">忘记密码？</text>
				</view>
			</view>
			
			<!-- 注册表单 -->
			<view class="login-form" v-else-if="currentForm === 'register'">
				<view class="form-title">注册</view>
				
				<!-- 测试提示 -->
				<view class="test-hint">
					<view class="hint-title">🧪 测试模式</view>
					<view class="hint-content">
						验证码：<text class="hint-value">123456</text>
						<text class="hint-desc">点击发送验证码后，请输入 123456</text>
					</view>
				</view>
				
				<form @submit.prevent="handleRegister">
					<view class="form-group">
						<input 
							class="form-input"
							type="text"
							placeholder="请输入手机号"
							v-model="registerForm.phone"
							maxlength="11"
						/>
					</view>
					
					<view class="form-group code-group">
						<input 
							class="form-input code-input"
							type="text"
							placeholder="请输入验证码"
							v-model="registerForm.code"
							maxlength="6"
						/>
						<button 
							class="code-btn"
							:disabled="codeCountdown > 0 || codeSending"
							@click="sendCode"
						>
							<text v-if="codeCountdown > 0">{{ codeCountdown }}s</text>
							<text v-else-if="codeSending">发送中...</text>
							<text v-else>发送验证码</text>
						</button>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="password"
							placeholder="请设置密码"
							v-model="registerForm.password"
							maxlength="20"
						/>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="password"
							placeholder="请确认密码"
							v-model="registerForm.confirmPassword"
							maxlength="20"
						/>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="text"
							placeholder="请输入昵称（可选）"
							v-model="registerForm.nickname"
							maxlength="20"
						/>
					</view>
					
					<button 
						class="submit-btn"
						:class="{ 'loading': registerLoading }"
						:disabled="registerLoading"
						@click="handleRegister"
					>
						<text v-if="!registerLoading">注册</text>
						<text v-else>注册中...</text>
					</button>
				</form>
				
				<view class="form-footer">
					<text class="footer-text">已有账号？</text>
					<text class="footer-link" @click="switchForm('login')">立即登录</text>
				</view>
			</view>
			
			<!-- 忘记密码表单 -->
			<view class="login-form" v-else-if="currentForm === 'forgot'">
				<view class="form-title">重置密码</view>
				
				<!-- 测试提示 -->
				<view class="test-hint">
					<view class="hint-title">🧪 测试模式</view>
					<view class="hint-content">
						验证码：<text class="hint-value">123456</text>
						<text class="hint-desc">点击发送验证码后，请输入 123456</text>
					</view>
				</view>
				
				<form @submit.prevent="handleForgot">
					<view class="form-group">
						<input 
							class="form-input"
							type="text"
							placeholder="请输入手机号"
							v-model="forgotForm.phone"
							maxlength="11"
						/>
					</view>
					
					<view class="form-group code-group">
						<input 
							class="form-input code-input"
							type="text"
							placeholder="请输入验证码"
							v-model="forgotForm.code"
							maxlength="6"
						/>
						<button 
							class="code-btn"
							:disabled="codeCountdown > 0 || codeSending"
							@click="sendResetCode"
						>
							<text v-if="codeCountdown > 0">{{ codeCountdown }}s</text>
							<text v-else-if="codeSending">发送中...</text>
							<text v-else>发送验证码</text>
						</button>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="password"
							placeholder="请输入新密码"
							v-model="forgotForm.newPassword"
							maxlength="20"
						/>
					</view>
					
					<view class="form-group">
						<input 
							class="form-input"
							type="password"
							placeholder="请确认新密码"
							v-model="forgotForm.confirmPassword"
							maxlength="20"
						/>
					</view>
					
					<button 
						class="submit-btn"
						:class="{ 'loading': forgotLoading }"
						:disabled="forgotLoading"
						@click="handleForgot"
					>
						<text v-if="!forgotLoading">重置密码</text>
						<text v-else>重置中...</text>
					</button>
				</form>
				
				<view class="form-footer">
					<text class="footer-link" @click="switchForm('login')">返回登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validatePhone, validatePassword } from '@/utils/common'

export default {
	name: 'LoginPage',
	data() {
		return {
			currentForm: 'login',
			
			// 登录表单
			loginForm: {
				phone: '',
				password: ''
			},
			loginLoading: false,
			
			// 注册表单
			registerForm: {
				phone: '',
				code: '',
				password: '',
				confirmPassword: '',
				nickname: ''
			},
			registerLoading: false,
			
			// 忘记密码表单
			forgotForm: {
				phone: '',
				code: '',
				newPassword: '',
				confirmPassword: ''
			},
			forgotLoading: false,
			
			// 验证码相关
			codeSending: false,
			codeCountdown: 0
		}
	},
	computed: {
		...mapState('user', ['isLoggedIn'])
	},
	onLoad() {
		// 如果已登录，直接跳转到首页
		if (this.isLoggedIn) {
			this.goToHome()
		}
	},
	methods: {
		...mapActions('user', [
			'login', 
			'register', 
			'resetPassword', 
			'sendRegisterCode', 
			'sendResetCode',
			'quickLogin'
		]),
		
		switchForm(formType) {
			this.currentForm = formType
			this.clearForms()
		},
		
		clearForms() {
			this.loginForm = { phone: '', password: '' }
			this.registerForm = { phone: '', code: '', password: '', confirmPassword: '', nickname: '' }
			this.forgotForm = { phone: '', code: '', newPassword: '', confirmPassword: '' }
		},
		
		async handleLogin() {
			try {
				// 表单验证
				if (!this.validateLoginForm()) return
				
				this.loginLoading = true
				
				await this.login(this.loginForm)
				
				// 登录成功，跳转到首页
				this.goToHome()
			} catch (error) {
				console.error('登录失败:', error)
			} finally {
				this.loginLoading = false
			}
		},
		
		async handleRegister() {
			try {
				// 表单验证
				if (!this.validateRegisterForm()) return
				
				this.registerLoading = true
				
				const { confirmPassword, ...registerData } = this.registerForm
				await this.register(registerData)
				
				// 注册成功，跳转到首页
				this.goToHome()
			} catch (error) {
				console.error('注册失败:', error)
			} finally {
				this.registerLoading = false
			}
		},
		
		async handleForgot() {
			try {
				// 表单验证
				if (!this.validateForgotForm()) return
				
				this.forgotLoading = true
				
				const { confirmPassword, ...resetData } = this.forgotForm
				await this.resetPassword({
					...resetData,
					new_password: resetData.newPassword
				})
				
				// 重置成功，切换到登录表单
				this.switchForm('login')
			} catch (error) {
				console.error('重置密码失败:', error)
			} finally {
				this.forgotLoading = false
			}
		},
		
		async sendCode() {
			try {
				if (!validatePhone(this.registerForm.phone)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				
				// 模拟发送验证码
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				})
				this.startCountdown()
			} catch (error) {
				console.error('发送验证码失败:', error)
			}
		},
		
		async sendResetCode() {
			try {
				if (!validatePhone(this.forgotForm.phone)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				
				// 模拟发送验证码
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				})
				this.startCountdown()
			} catch (error) {
				console.error('发送验证码失败:', error)
			}
		},
		
		async quickLogin() {
			try {
				await this.quickLogin()
				this.goToHome()
			} catch (error) {
				console.error('快速登录失败:', error)
			}
		},
		
		validateLoginForm() {
			if (!this.loginForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return false
			}
			
			if (!validatePhone(this.loginForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return false
			}
			
			if (!this.loginForm.password) {
				uni.showToast({ title: '请输入密码', icon: 'none' })
				return false
			}
			
			return true
		},
		
		validateRegisterForm() {
			if (!this.registerForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return false
			}
			
			if (!validatePhone(this.registerForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return false
			}
			
			if (!this.registerForm.code) {
				uni.showToast({ title: '请输入验证码', icon: 'none' })
				return false
			}
			
			if (!this.registerForm.password) {
				uni.showToast({ title: '请输入密码', icon: 'none' })
				return false
			}
			
			const passwordValidation = validatePassword(this.registerForm.password)
			if (!passwordValidation.valid) {
				uni.showToast({ title: passwordValidation.message, icon: 'none' })
				return false
			}
			
			if (this.registerForm.password !== this.registerForm.confirmPassword) {
				uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
				return false
			}
			
			return true
		},
		
		validateForgotForm() {
			if (!this.forgotForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return false
			}
			
			if (!validatePhone(this.forgotForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return false
			}
			
			if (!this.forgotForm.code) {
				uni.showToast({ title: '请输入验证码', icon: 'none' })
				return false
			}
			
			if (!this.forgotForm.newPassword) {
				uni.showToast({ title: '请输入新密码', icon: 'none' })
				return false
			}
			
			const passwordValidation = validatePassword(this.forgotForm.newPassword)
			if (!passwordValidation.valid) {
				uni.showToast({ title: passwordValidation.message, icon: 'none' })
				return false
			}
			
			if (this.forgotForm.newPassword !== this.forgotForm.confirmPassword) {
				uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
				return false
			}
			
			return true
		},
		
		startCountdown() {
			this.codeCountdown = 60
			const timer = setInterval(() => {
				this.codeCountdown--
				if (this.codeCountdown <= 0) {
					clearInterval(timer)
				}
			}, 1000)
		},
		
		goToHome() {
			uni.reLaunch({
				url: '/pages/index/index'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.login-page {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.login-container {
	width: 100%;
	max-width: 640rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 32rpx;
	padding: 64rpx 48rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
	animation: slideUp 0.6s ease-out;
}

.login-header {
	text-align: center;
	margin-bottom: 64rpx;
}

.logo-container {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.logo-icon {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
}

.logo-text {
	font-size: 48rpx;
	font-weight: 700;
	color: var(--text-color);
}

.header-subtitle {
	font-size: 28rpx;
	color: var(--text-light);
}

.login-form {
	animation: fadeIn 0.4s ease-out;
}

.form-title {
	font-size: 56rpx;
	font-weight: 700;
	color: var(--text-color);
	text-align: center;
	margin-bottom: 48rpx;
}

.test-hint {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	border: 2rpx solid #0ea5e9;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 32rpx;
}

.hint-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #0c4a6e;
	margin-bottom: 12rpx;
}

.hint-content {
	font-size: 26rpx;
	color: #0369a1;
	line-height: 1.5;
	margin-bottom: 16rpx;
}

.hint-value {
	font-family: 'Courier New', monospace;
	background: rgba(14, 165, 233, 0.1);
	padding: 2rpx 8rpx;
	border-radius: 6rpx;
	font-weight: 600;
}

.hint-desc {
	display: block;
	font-size: 24rpx;
	margin-top: 8rpx;
}

.quick-login-btn {
	width: 100%;
	padding: 16rpx;
	background: #0ea5e9;
	color: white;
	border: none;
	border-radius: 8rpx;
	font-size: 26rpx;
	
	&:active {
		background: #0284c7;
	}
}

.form-group {
	margin-bottom: 32rpx;
	
	&.code-group {
		display: flex;
		gap: 16rpx;
	}
}

.form-input {
	width: 100%;
	padding: 32rpx;
	border: none;
	border-bottom: 4rpx solid #e5e7eb;
	background: transparent;
	font-size: 32rpx;
	color: var(--text-color);
	transition: all 0.3s;
	
	&:focus {
		border-bottom-color: var(--primary-color);
	}
	
	&::placeholder {
		color: #9ca3af;
	}
}

.code-input {
	flex: 1;
}

.code-btn {
	padding: 16rpx 24rpx;
	background: var(--primary-color);
	color: white;
	border: none;
	border-radius: 12rpx;
	font-size: 24rpx;
	white-space: nowrap;
	
	&:disabled {
		background: #d1d5db;
		color: #9ca3af;
	}
}

.submit-btn {
	width: 100%;
	padding: 32rpx;
	background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
	color: white;
	border: none;
	border-radius: 24rpx;
	font-size: 36rpx;
	font-weight: 600;
	margin: 32rpx 0;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;
	
	&:active:not(:disabled) {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}
	
	&:disabled {
		opacity: 0.7;
		transform: none;
		box-shadow: none;
	}
	
	&.loading {
		opacity: 0.8;
	}
}

.form-footer {
	text-align: center;
	margin-top: 32rpx;
}

.footer-text {
	font-size: 28rpx;
	color: var(--text-light);
}

.footer-link {
	font-size: 28rpx;
	color: var(--primary-color);
	font-weight: 600;
	margin-left: 8rpx;
}

.forgot-link {
	text-align: center;
	margin-top: 24rpx;
	
	text {
		font-size: 28rpx;
		color: var(--text-light);
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(60rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateX(40rpx);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}
</style>