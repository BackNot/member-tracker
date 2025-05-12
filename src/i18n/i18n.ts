import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import bg from './locales/bg.json'

const i18n = createI18n({
  locale: 'bg',
  fallbackLocale: 'bg',
  messages: {
    en,
    bg,
  },
  legacy: false,
  globalInjection: true // Makes $t available globally
})

export default i18n
