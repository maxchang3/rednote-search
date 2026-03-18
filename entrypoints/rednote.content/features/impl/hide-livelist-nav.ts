import { defineFeatureRuntime } from '../utils'

const toggleHideLivelistNav = (force?: boolean) => {
  document.documentElement.classList.toggle('RS_hide-livelist-nav', force)
}

export const setupHideLivelistNav = defineFeatureRuntime(({ isEnabled }) => {
  const apply = () => {
    toggleHideLivelistNav(isEnabled())
  }

  return {
    refresh: apply,
    dispose: () => {
      toggleHideLivelistNav(false)
    },
  }
})
