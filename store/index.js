import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import chat from './modules/chat'
import document from './modules/document'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		user,
		chat,
		document
	}
})

export default store