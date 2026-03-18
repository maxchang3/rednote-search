const getFeatureSettings = (feature: FeatureDefinition) => {
  return 'setting' in feature ? [feature.setting] : feature.settings
}

export const isFeatureId = (value: string): value is FeatureId => {
  return featureDefinitions.some((feature) => feature.id === value)
}

export const isFeatureSettingId = <TFeatureId extends FeatureId>(
  featureId: TFeatureId,
  value: string
): value is FeatureSettingId<TFeatureId> => {
  const feature = featureDefinitions.find(
    (feature): feature is FeatureDefinitionById<TFeatureId> => feature.id === featureId
  )

  return feature ? getFeatureSettings(feature).some((setting) => setting.id === value) : false
}
