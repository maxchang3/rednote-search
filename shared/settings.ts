type FeatureSettingsStorageValue = Partial<Record<string, unknown>>

type FeatureSettingMap<TFeatureId extends FeatureId = FeatureId> = Record<FeatureSettingId<TFeatureId>, boolean>

export type FeatureSettings = {
  [K in FeatureId]: FeatureSettingMap<K>
}

const getFeatureStorageKey = (featureId: FeatureId) => `local:feature-settings:${featureId}` as const

const defaultFeatureSettings = Object.fromEntries(
  featureDefinitions.map((feature) => [
    feature.id,
    Object.fromEntries(
      ('setting' in feature ? [feature.setting] : feature.settings).map((setting) => [setting.id, setting.defaultValue])
    ),
  ])
) as FeatureSettings

const featureSettingsStorage = Object.fromEntries(
  featureDefinitions.map((feature) => [
    feature.id,
    storage.defineItem<FeatureSettingsStorageValue>(getFeatureStorageKey(feature.id), {
      fallback: defaultFeatureSettings[feature.id],
    }),
  ])
) as {
  [K in FeatureId]: WxtStorageItem<FeatureSettingsStorageValue, Record<string, unknown>>
}

const getBool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const getFeatureDefinitionById = <TFeatureId extends FeatureId>(
  featureId: TFeatureId
): FeatureDefinitionById<TFeatureId> => {
  const feature = featureDefinitions.find(
    (candidate): candidate is FeatureDefinitionById<TFeatureId> => candidate.id === featureId
  )
  if (!feature) throw new Error(`Unknown feature: ${featureId}`)
  return feature
}

const normalizeFeatureSettingMap = <TFeatureId extends FeatureId>(
  value: unknown,
  feature: FeatureDefinitionById<TFeatureId>
) => {
  const normalizedValue = value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
  const defaultSettings = defaultFeatureSettings[feature.id] as Record<string, boolean>
  const featureSettings = 'setting' in feature ? [feature.setting] : feature.settings

  return Object.fromEntries(
    featureSettings.map((setting) => [setting.id, getBool(normalizedValue?.[setting.id], defaultSettings[setting.id])])
  ) as FeatureSettingMap<TFeatureId>
}

export const loadFeatureSettings = async (): Promise<FeatureSettings> => {
  const entries = await Promise.all(
    featureDefinitions.map(async (feature) => {
      const value = await featureSettingsStorage[feature.id].getValue()
      return [feature.id, normalizeFeatureSettingMap(value, feature)] as const
    })
  )

  return Object.fromEntries(entries) as FeatureSettings
}

export const setFeatureSetting = async <TFeatureId extends FeatureId>(
  featureId: TFeatureId,
  settingId: FeatureSettingId<TFeatureId>,
  enabled: boolean
) => {
  const storageItem = featureSettingsStorage[featureId]
  const featureSettings = normalizeFeatureSettingMap(await storageItem.getValue(), getFeatureDefinitionById(featureId))
  if (featureSettings[settingId] === enabled) return

  await storageItem.setValue({
    ...featureSettings,
    [settingId]: enabled as boolean,
  } satisfies FeatureSettingMap<TFeatureId>)
}

export const resetFeatureSettings = async () => {
  await storage.setItems(
    featureDefinitions.map((feature) => ({
      item: featureSettingsStorage[feature.id],
      value: defaultFeatureSettings[feature.id],
    }))
  )
}

export const watchFeatureSettings = (callback: (settings: FeatureSettings) => void): (() => void) => {
  const stopWatching = featureDefinitions.map((feature) =>
    featureSettingsStorage[feature.id].watch(async () => {
      callback(await loadFeatureSettings())
    })
  )

  return () => {
    stopWatching.forEach((stop) => {
      stop()
    })
  }
}
