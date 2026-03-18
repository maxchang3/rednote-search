import type { ContentScriptContext } from 'wxt/utils/content-script-context'
import { setupHideFeed, setupHideSidebarNav, setupSlashFocus } from './impl'
import { getCurrentPath, initRouter, onRouteChange } from './router'
import type { FeatureContext, FeatureSetup } from './types'

type FeatureRuntimeMap = {
  [K in FeatureId]: FeatureSetup
}

export const initFeatures = async (ctx: ContentScriptContext) => {
  initRouter(ctx)

  let settings = await loadFeatureSettings()
  const createFeatureContext = (featureId: FeatureId): FeatureContext => ({
    getCurrentPath,
    getSetting: (settingId) => Boolean((settings[featureId] as Record<string, boolean>)[settingId]),
    onRouteChange,
  })

  const runtimeFeatures = {
    hideFeed: setupHideFeed,
    hideSidebarNav: setupHideSidebarNav,
    slashFocus: setupSlashFocus,
  } satisfies FeatureRuntimeMap

  const runtimes = featureDefinitions.map((feature) => runtimeFeatures[feature.id](createFeatureContext(feature.id)))

  const refreshFeatures = () => {
    runtimes.forEach((runtime) => {
      runtime.refresh()
    })
  }

  const unwatchSettings = watchFeatureSettings((nextSettings) => {
    settings = nextSettings
    refreshFeatures()
  })

  ctx.onInvalidated(() => {
    unwatchSettings()
    runtimes.forEach((runtime) => {
      runtime.dispose()
    })
  })

  refreshFeatures()
}
