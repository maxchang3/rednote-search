import type { FeatureSettingId } from '@/shared/features'
import { defineFeatureRuntime } from '../utils'

type SidebarNavSettingId = FeatureSettingId<'hideSidebarNav'>

const sidebarNavClassMap = {
  livelist: 'RS_hide-sidebar-nav-livelist',
  publish: 'RS_hide-sidebar-nav-publish',
  notification: 'RS_hide-sidebar-nav-notification',
} as const satisfies Record<SidebarNavSettingId, string>

const toggleSidebarNavSetting = (settingId: SidebarNavSettingId, force?: boolean) => {
  document.documentElement.classList.toggle(sidebarNavClassMap[settingId], force)
}

export const setupHideSidebarNav = defineFeatureRuntime(({ getSetting }) => {
  const apply = () => {
    toggleSidebarNavSetting('livelist', getSetting('livelist'))
    toggleSidebarNavSetting('publish', getSetting('publish'))
    toggleSidebarNavSetting('notification', getSetting('notification'))
  }

  return {
    refresh: apply,
    dispose: () => {
      toggleSidebarNavSetting('livelist', false)
      toggleSidebarNavSetting('publish', false)
      toggleSidebarNavSetting('notification', false)
    },
  }
})
