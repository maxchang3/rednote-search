import { defineFeatureRuntime } from '../utils'

const toggleHideFeed = (force?: boolean) => {
  document.documentElement.classList.toggle('RS_hide-feed', force)
}

export const setupHideFeed = defineFeatureRuntime(({ getCurrentPath, getSetting, onRouteChange }) => {
  let currentPath = getCurrentPath()

  const apply = () => {
    toggleHideFeed(getSetting('hideExploreFeed') && currentPath === '/explore')
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
