import { createApp } from 'vue'
import App from './App.vue'
import i18n, { initI18n } from './i18n'
import './style.css'

const app = createApp(App)
app.use(i18n)

initI18n().then(() => {
  app.mount('#app')
})
