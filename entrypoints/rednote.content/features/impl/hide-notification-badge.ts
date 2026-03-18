import { defineFeatureRuntime } from '../utils'

const toggleHideNotificationBadge = (force?: boolean) => {
  document.documentElement.classList.toggle('RS_hide-notification-badge', force)
}

export const setupHideNotificationBadge = defineFeatureRuntime<'hideNotificationBadge'>(({ getSetting }) => {
  const apply = () => {
    toggleHideNotificationBadge(getSetting('hideNotificationBadgeCount'))
  }

  return {
    refresh: apply,
    dispose: () => {
      toggleHideNotificationBadge(false)
    },
  }
})
