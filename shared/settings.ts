import type { FeatureDefinitionById, FeatureId, FeatureSettingId } from './features'

type FeatureSettingsStorageValue = Partial<Record<string, unknown>>

type FeatureSettingMap<TFeatureId extends FeatureId = FeatureId> = Record<FeatureSettingId<TFeatureId>, boolean>

type FeatureSettings = {
  [K in FeatureId]: FeatureSettingMap<K>
}

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

const normalizeFeatureSettingMap = <TFeatureId extends FeatureId>(
  normalizedValue: FeatureSettingsStorageValue | undefined,
  feature: FeatureDefinitionById<TFeatureId>
) => {
  const defaultSettings = defaultFeatureSettings[feature.id] as Record<string, boolean>

  return Object.fromEntries(
    feature.settings.map((setting) => {
      const rawFeatureValue = normalizedValue?.[feature.id]
      const rawSettingValue =
        rawFeatureValue !== null && typeof rawFeatureValue === 'object'
          ? (rawFeatureValue as Record<string, unknown>)[setting.id]
          : undefined
      const fallbackValue = defaultSettings[setting.id]

      return [setting.id, getBool(rawSettingValue, fallbackValue)]
    })
  ) as FeatureSettingMap<TFeatureId>
}

const normalizeFeatureSettings = (value: unknown): FeatureSettings => {
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

const getDefaultFeatureSettings = (): FeatureSettings => {
  return normalizeFeatureSettings(defaultFeatureSettings)
}

export const setFeatureSetting = async <TFeatureId extends FeatureId>(
  featureId: TFeatureId,
  settingId: FeatureSettingId<TFeatureId>,
  enabled: boolean
) => {
  const settings = await loadFeatureSettings()
  const nextFeatureSettings = {
    ...settings[featureId],
    [settingId]: enabled,
  } as FeatureSettings[TFeatureId]
  settings[featureId] = nextFeatureSettings
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
