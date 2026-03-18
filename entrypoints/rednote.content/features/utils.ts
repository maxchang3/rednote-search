import type { FeatureContext, FeatureRuntime, FeatureSetup } from './types'

export const defineFeatureRuntime = (setup: (ctx: FeatureContext) => FeatureRuntime): FeatureSetup => setup
