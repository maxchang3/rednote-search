export type FeatureRuntime = {
  refresh: () => void
  dispose: () => void
}

type BaseFeatureContext = {
  getCurrentPath: () => string
  onRouteChange: (cb: (path: string) => void) => () => void
}

export type FeatureContext = BaseFeatureContext & {
  isEnabled: () => boolean
}

export type FeatureSetup = (ctx: FeatureContext) => FeatureRuntime
