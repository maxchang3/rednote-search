type FeatureSettingsStorageValue = Partial<Record<string, unknown>>
type FeatureSettingMap = Record<string, boolean>

export type FeatureSettings = Record<FeatureId, FeatureSettingMap>

const FEATURE_STORAGE_KEY = 'local:feature-settings'

const defaultFeatureSettings = Object.fromEntries(
  featureDefinitions.map((feature) => [
    feature.id,
    Object.fromEntries(feature.settings.map((setting) => [setting.id, setting.defaultValue])),
  ])
) as FeatureSettings

const getBool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const isFeatureSettingsStorageValue = (value: unknown): value is FeatureSettingsStorageValue =>
  value !== null && typeof value === 'object'

const normalizeFeatureSettingMap = (
  normalizedValue: FeatureSettingsStorageValue | undefined,
  feature: (typeof featureDefinitions)[number]
) =>
  Object.fromEntries(
    feature.settings.map((setting) => {
      const rawFeatureValue = normalizedValue?.[feature.id]
      const rawSettingValue =
        rawFeatureValue !== null && typeof rawFeatureValue === 'object'
          ? (rawFeatureValue as Record<string, unknown>)[setting.id]
          : undefined
      const fallbackValue = defaultFeatureSettings[feature.id][setting.id]

      return [setting.id, getBool(rawSettingValue, fallbackValue)]
    })
  ) as FeatureSettingMap

export const normalizeFeatureSettings = (value: unknown): FeatureSettings => {
  const normalizedValue = isFeatureSettingsStorageValue(value) ? value : undefined
  return Object.fromEntries(
    featureDefinitions.map((feature) => [feature.id, normalizeFeatureSettingMap(normalizedValue, feature)])
  ) as FeatureSettings
}

const featureSettingsStorage = storage.defineItem<FeatureSettingsStorageValue>(FEATURE_STORAGE_KEY, {
  fallback: defaultFeatureSettings,
})

export const loadFeatureSettings = async (): Promise<FeatureSettings> => {
  return normalizeFeatureSettings(await featureSettingsStorage.getValue())
}

const saveFeatureSettings = async (settings: FeatureSettings) => {
  await featureSettingsStorage.setValue(settings)
}

export const getDefaultFeatureSettings = (): FeatureSettings => {
  return normalizeFeatureSettings(defaultFeatureSettings)
}

export const setFeatureSetting = async (featureId: FeatureId, settingId: string, enabled: boolean) => {
  const settings = await loadFeatureSettings()
  settings[featureId] = {
    ...settings[featureId],
    [settingId]: enabled,
  }
  await saveFeatureSettings(settings)
}

export const resetFeatureSettings = async () => {
  await saveFeatureSettings(getDefaultFeatureSettings())
}

export const watchFeatureSettings = (callback: (settings: FeatureSettings) => void): (() => void) => {
  return featureSettingsStorage.watch((newSettings) => {
    callback(normalizeFeatureSettings(newSettings))
  })
}
