import en from '../locales/en.json'
import zhCN from '../locales/zh-CN.json'
import zhTW from '../locales/zh-TW.json'

export type SupportedLocale = 'zh-CN' | 'en' | 'zh-TW'

export const localeLabels: Record<SupportedLocale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  'zh-TW': '繁體中文',
}

const messages: Record<SupportedLocale, typeof zhCN> = {
  'zh-CN': zhCN,
  en: en,
  'zh-TW': zhTW,
}

const localeStorage = storage.defineItem<SupportedLocale>('local:locale', {
  fallback: 'zh-CN',
})

const getBrowserLocale = (): SupportedLocale => {
  const browserLang = navigator.language
  if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-Hans')) return 'zh-CN'
  if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant')) return 'zh-TW'
  return 'en'
}

export const getEffectiveLocale = async (): Promise<SupportedLocale> => {
  const stored = await localeStorage.getValue()
  if (stored) return stored
  return getBrowserLocale()
}

export const loadLocale = async (): Promise<SupportedLocale> => {
  return getEffectiveLocale()
}

export const setLocale = async (locale: SupportedLocale): Promise<void> => {
  await localeStorage.setValue(locale)
}

export const watchLocale = (callback: (locale: SupportedLocale) => void): (() => void) => {
  return localeStorage.watch((value) => {
    callback(value ?? 'zh-CN')
  })
}

export const createTranslator = (locale: SupportedLocale) => {
  const msg = messages[locale]
  return (key: string): string => {
    const keys = key.split('.')
    let result: unknown = msg
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    return typeof result === 'string' ? result : key
  }
}

export const t = (key: string): string => {
  // This is a sync version that defaults to zh-CN
  // For Vue components, use the i18n instance instead
  const translator = createTranslator('zh-CN')
  return translator(key)
}

export const getMessages = () => messages
