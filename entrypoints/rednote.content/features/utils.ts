import type { FeatureId } from '@/shared/features'
import type { FeatureSetup } from './types'

export const defineFeatureRuntime = <TFeatureId extends FeatureId>(
  setup: FeatureSetup<TFeatureId>
): FeatureSetup<TFeatureId> => setup
