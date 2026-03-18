import { defineFeatureRuntime } from '../utils'

export const setupSlashFocus = defineFeatureRuntime(({ isEnabled }) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled() || event.key !== '/') return

    const input = document.querySelector<HTMLInputElement>('#search-input')
    if (!input) return

    event.preventDefault()
    input.focus()
  }

  document.addEventListener('keydown', onKeyDown)

  return {
    refresh: () => {},
    dispose: () => {
      document.removeEventListener('keydown', onKeyDown)
    },
  }
})
