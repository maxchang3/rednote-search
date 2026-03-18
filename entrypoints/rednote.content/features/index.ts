import type { ContentScriptContext } from 'wxt/utils/content-script-context'
import { setupHideFeedFeature, setupSlashFocusFeature } from './impl'
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
    isEnabled: () => settings[featureId],
    onRouteChange,
  })

  const runtimeFeatures = {
    hideFeed: setupHideFeedFeature,
    slashFocus: setupSlashFocusFeature,
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
