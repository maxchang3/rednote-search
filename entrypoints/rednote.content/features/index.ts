import type { ContentScriptContext } from 'wxt/utils/content-script-context'
import { setupHideFeed, setupHideSidebarNav, setupSlashFocus } from './impl'
import { getCurrentPath, initRouter, onRouteChange } from './router'
import type { FeatureContext, FeatureSetup } from './types'

type FeatureRuntimeMap = {
  [K in FeatureId]: FeatureSetup<K>
}

export const initFeatures = async (ctx: ContentScriptContext) => {
  initRouter(ctx)

  let settings = await loadFeatureSettings()
  const createFeatureContext = <TFeatureId extends FeatureId>(featureId: TFeatureId): FeatureContext<TFeatureId> => ({
    getCurrentPath,
    getSetting: (settingId) => settings[featureId][settingId],
    onRouteChange,
  })

  const runtimeFeatures = {
    hideFeed: setupHideFeed,
    hideSidebarNav: setupHideSidebarNav,
    slashFocus: setupSlashFocus,
  } satisfies FeatureRuntimeMap

  const getFeatureSetup = <TFeatureId extends FeatureId>(featureId: TFeatureId): FeatureSetup<TFeatureId> => {
    return runtimeFeatures[featureId] as unknown as FeatureSetup<TFeatureId>
  }

  const createRuntime = <TFeatureId extends FeatureId>(featureId: TFeatureId) => {
    return getFeatureSetup(featureId)(createFeatureContext(featureId))
  }

  const runtimes = featureDefinitions.map((feature) => createRuntime(feature.id))

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
