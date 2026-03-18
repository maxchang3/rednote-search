export type FeatureRuntime = {
  refresh: () => void
  dispose: () => void
}

export type FeatureContext<TFeatureId extends FeatureId = FeatureId> = {
  getCurrentPath: () => string
  onRouteChange: (cb: (path: string) => void) => () => void
  getSetting: (settingId: FeatureSettingId<TFeatureId>) => boolean
}

export type FeatureSetup<TFeatureId extends FeatureId = FeatureId> = (ctx: FeatureContext<TFeatureId>) => FeatureRuntime
