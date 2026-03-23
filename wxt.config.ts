import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'zh_CN',
    permissions: ['storage'],
    host_permissions: ['https://www.xiaohongshu.com/*'],
    browser_specific_settings: {
      gecko: {
        id: 'rednote-search@maxchang.me',
        // @ts-expect-error - WXT doesn't support this field yet
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  modules: ['@wxt-dev/i18n/module', '@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  imports: {
    dirs: ['./shared/*'],
  },
  vite: () => ({
    plugins: [vue()],
  }),
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
})
