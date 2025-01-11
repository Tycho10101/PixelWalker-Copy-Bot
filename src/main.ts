import App from '@/App.vue'
import { createVuetify } from '@/plugins/vuetify.ts'
import { createPinia } from 'pinia'
import { createRouter } from '@/router/router'
import { createApp } from 'vue'

const vuetify = createVuetify()
const pinia = createPinia()
const router = createRouter() // Relies on pinia being initialised
const app = createApp(App)

app.use(vuetify)
app.use(pinia)
app.use(router)
app.mount('#app')
