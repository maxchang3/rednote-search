export type FeatureSettings = Record<FeatureId, boolean>
type FeatureSettingsStorageValue = Partial<Record<FeatureId, unknown>>

const FEATURE_STORAGE_KEY = 'local:feature-settings'

const fromFeatureEntries = <TValue>(
  mapValue: (feature: (typeof featureDefinitions)[number]) => TValue
): Record<FeatureId, TValue> =>
  Object.fromEntries(featureDefinitions.map((feature) => [feature.id, mapValue(feature)])) as Record<FeatureId, TValue>

const defaultFeatureSettings = fromFeatureEntries((feature) => feature.defaultValue)

const getBool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const isFeatureSettingsStorageValue = (value: unknown): value is FeatureSettingsStorageValue =>
  value !== null && typeof value === 'object'

export function normalizeFeatureSettings(value: unknown): FeatureSettings {
  const normalizedValue = isFeatureSettingsStorageValue(value) ? value : undefined
  return fromFeatureEntries((feature) => getBool(normalizedValue?.[feature.id], defaultFeatureSettings[feature.id]))
}

const featureSettingsStorage = storage.defineItem<FeatureSettingsStorageValue>(FEATURE_STORAGE_KEY, {
  fallback: defaultFeatureSettings,
})

export async function loadFeatureSettings(): Promise<FeatureSettings> {
  return normalizeFeatureSettings(await featureSettingsStorage.getValue())
}

async function saveFeatureSettings(settings: FeatureSettings) {
  await featureSettingsStorage.setValue(settings)
}

export async function setFeatureEnabled(featureId: FeatureId, enabled: boolean) {
  const settings = await loadFeatureSettings()
  settings[featureId] = enabled
  await saveFeatureSettings(settings)
}

export function watchFeatureSettings(callback: (settings: FeatureSettings) => void): () => void {
  return featureSettingsStorage.watch((newSettings) => {
    callback(normalizeFeatureSettings(newSettings))
  })
}
