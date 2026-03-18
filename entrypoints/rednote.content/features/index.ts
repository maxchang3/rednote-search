import type { ContentScriptContext } from 'wxt/utils/content-script-context'
import type { FeatureSettings } from '@/shared/settings'
import { setupHideFeed, setupHideSearchSuggestions, setupHideSidebarNav, setupSlashFocus } from './impl'
import { getCurrentPath, initRouter, onRouteChange } from './router'
import type { FeatureContext, FeatureRuntime, FeatureSetup } from './types'

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
    hideSearchSuggestions: setupHideSearchSuggestions,
    hideSidebarNav: setupHideSidebarNav,
    slashFocus: setupSlashFocus,
  } satisfies FeatureRuntimeMap

  const createRuntime = <TFeatureId extends FeatureId>(featureId: TFeatureId) => {
    const setup = runtimeFeatures[featureId] as unknown as FeatureSetup<TFeatureId>
    return setup(createFeatureContext(featureId))
  }

  const runtimes = Object.fromEntries(
    featureDefinitions.map((feature) => [feature.id, createRuntime(feature.id)])
  ) as Record<FeatureId, FeatureRuntime>

  const refreshFeature = (featureId: FeatureId) => {
    runtimes[featureId].refresh()
  }

  const refreshFeatures = () => {
    featureDefinitions.forEach((feature) => {
      refreshFeature(feature.id)
    })
  }

  const hasFeatureSettingsChanged = (
    prevSettings: FeatureSettings,
    nextSettings: FeatureSettings,
    featureId: FeatureId
  ) => {
    const prevFeatureSettings = prevSettings[featureId]
    const nextFeatureSettings = nextSettings[featureId]

    return Object.keys(nextFeatureSettings).some((settingId) => {
      const typedSettingId = settingId as keyof typeof nextFeatureSettings
      return prevFeatureSettings[typedSettingId] !== nextFeatureSettings[typedSettingId]
    })
  }

  const unwatchSettings = watchFeatureSettings((nextSettings) => {
    const prevSettings = settings
    settings = nextSettings

    featureDefinitions.forEach((feature) => {
      if (hasFeatureSettingsChanged(prevSettings, nextSettings, feature.id)) {
        refreshFeature(feature.id)
      }
    })
  })

  ctx.onInvalidated(() => {
    unwatchSettings()

    featureDefinitions.forEach((feature) => {
      runtimes[feature.id].dispose()
    })
  })

  refreshFeatures()
}
