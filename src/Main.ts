import App from '@/App.vue'
import { createVuetify } from '@/plugins/Vuetify.ts'
import { createPinia } from 'pinia'
import { createRouter } from '@/router/Router.ts'
import { createApp } from 'vue'
import { handleException } from '@/utils/Exception.ts'
import { resetStorePlugin } from '@/plugins/ResetStore.ts'

const vuetify = createVuetify()
const pinia = createPinia()
pinia.use(resetStorePlugin)
const router = createRouter() // Relies on pinia being initialised
const app = createApp(App)

app.config.errorHandler = handleException

app.use(vuetify)
app.use(pinia)
app.use(router)
app.mount('#app')
