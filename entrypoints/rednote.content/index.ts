import './style.css'
import { initRouter } from './router'

import './features/hide-feed'
import './features/slash-focus'

export default defineContentScript({
  matches: ['https://www.xiaohongshu.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    initRouter()
  },
})
