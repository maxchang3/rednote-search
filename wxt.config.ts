import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'RedNote Search',
    description: 'Use Xiaohongshu as a search engine.',
    permissions: ['storage'],
    host_permissions: ['https://www.xiaohongshu.com/*'],
  },
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  imports: {
    dirs: ['./shared/*'],
  },
  webExt: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  },
})
