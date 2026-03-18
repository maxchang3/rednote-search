import { defineFeatureRuntime } from '../utils'

const toggleHideFeed = (force?: boolean) => {
  document.documentElement.classList.toggle('RS_hide-feed', force)
}

export const setupHideFeed = defineFeatureRuntime(({ getCurrentPath, isEnabled, onRouteChange }) => {
  let currentPath = getCurrentPath()

  const apply = () => {
    toggleHideFeed(isEnabled() && currentPath === '/explore')
  }

  const stopListening = onRouteChange((path) => {
    currentPath = path
    apply()
  })

  return {
    refresh: apply,
    dispose: () => {
      stopListening()
      toggleHideFeed(false)
    },
  }
})
