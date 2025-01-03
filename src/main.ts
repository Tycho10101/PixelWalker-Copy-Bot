import { createApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router/router'
import vuetify from '@/plugins/vuetify.ts'

const router = createRouter()

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')

