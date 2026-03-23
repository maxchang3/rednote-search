import { createI18n } from 'vue-i18n'
import type { SupportedLocale } from '../../shared/locale'
import { getEffectiveLocale, getMessages } from '../../shared/locale'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: getMessages(),
})

export const initI18n = async () => {
  const locale = await getEffectiveLocale()
  i18n.global.locale.value = locale as SupportedLocale
}

export default i18n
