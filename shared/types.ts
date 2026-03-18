type FeatureSettingDefinition = {
  id: string
  title: string
  description: string
  defaultValue: boolean
}

type SingleFeatureSettingDefinition = {
  id: string
  defaultValue: boolean
}

type FeatureDefinitionBase = {
  id: string
  title: string
  description: string
}

type SingleFeatureDefinition = FeatureDefinitionBase & {
  setting: SingleFeatureSettingDefinition
}

type FeatureGroupDefinition = FeatureDefinitionBase & {
  settings: readonly FeatureSettingDefinition[]
}

export type FeatureDefinition = SingleFeatureDefinition | FeatureGroupDefinition

export type FeatureDefinitionById<TFeatureId extends FeatureId = FeatureId> = Extract<
  FeatureDefinitionItem,
  { id: TFeatureId }
>

type FeatureSettingIdByDefinition<TFeatureDefinition extends FeatureDefinition> = TFeatureDefinition extends {
  setting: infer TSetting extends { id: string }
}
  ? TSetting['id']
  : TFeatureDefinition extends { settings: infer TSettings extends readonly { id: string }[] }
    ? TSettings[number]['id']
    : never

export type FeatureSettingId<TFeatureId extends FeatureId = FeatureId> = FeatureSettingIdByDefinition<
  FeatureDefinitionById<TFeatureId>
>
