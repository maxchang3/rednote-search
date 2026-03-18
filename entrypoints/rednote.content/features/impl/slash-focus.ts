import { defineFeatureRuntime } from '../utils'

export const setupSlashFocus = defineFeatureRuntime<'slashFocus'>(({ getSetting }) => {
  let isListening = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== '/') return

    const input = document.querySelector<HTMLInputElement>('#search-input')
    if (!input) return

    event.preventDefault()
    input.focus()
  }

  const syncListener = () => {
    const shouldListen = getSetting('focusSearchOnSlash')
    if (shouldListen === isListening) return

    if (shouldListen) {
      document.addEventListener('keydown', onKeyDown)
    } else {
      document.removeEventListener('keydown', onKeyDown)
    }

    isListening = shouldListen
  }

  return {
    refresh: syncListener,
    dispose: () => {
      if (!isListening) return

      document.removeEventListener('keydown', onKeyDown)
      isListening = false
    },
  }
})
