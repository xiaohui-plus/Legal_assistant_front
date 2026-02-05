import Vue from 'vue'
import App from './App'
import store from './store'

// 引入全局样式
import '@/static/css/common.scss'

Vue.config.productionTip = false

// 禁用uni-ai相关功能
Vue.prototype.$uniAI = null

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})

app.$mount()