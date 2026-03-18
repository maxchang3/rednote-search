import { defineFeatureRuntime } from '../utils'

const toggleHideFeed = (force?: boolean) => {
  document.documentElement.classList.toggle('raase', force)
}

export const setupHideFeedFeature = defineFeatureRuntime(({ getCurrentPath, isEnabled, onRouteChange }) => {
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
