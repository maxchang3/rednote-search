import { defineFeatureRuntime } from '../utils'

const toggleHideSearchSuggestions = (force?: boolean) => {
  document.documentElement.classList.toggle('RS_hide-search-suggestions', force)
}

export const setupHideSearchSuggestions = defineFeatureRuntime<'hideSearchSuggestions'>(({ getSetting }) => {
  const apply = () => {
    toggleHideSearchSuggestions(getSetting('hideSearchSuggestionsBox'))
  }

  return {
    refresh: apply,
    dispose: () => {
      toggleHideSearchSuggestions(false)
    },
  }
})
