export type FeatureRuntime = {
  refresh: () => void
  dispose: () => void
}

type BaseFeatureContext = {
  getCurrentPath: () => string
  onRouteChange: (cb: (path: string) => void) => () => void
}

export type FeatureContext = BaseFeatureContext & {
  getSetting: (settingId: string) => boolean
}

export type FeatureSetup = (ctx: FeatureContext) => FeatureRuntime
