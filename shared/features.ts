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

type FeatureDefinition = SingleFeatureDefinition | FeatureGroupDefinition

const getFeatureSettings = (feature: FeatureDefinition) => {
  return 'setting' in feature ? [feature.setting] : feature.settings
}

export const featureDefinitions = [
  {
    id: 'hideFeed',
    title: '隐藏首页信息流',
    description: '隐藏主页信息流，搜索框页面居中。',
    setting: {
      id: 'hideExploreFeed',
      defaultValue: true,
    },
  },
  {
    id: 'hideSidebarNav',
    title: '隐藏侧边导航按钮',
    description: '隐藏侧边导航栏中的直播、发布和通知按钮。',
    settings: [
      {
        id: 'livelist',
        title: '直播',
        description: '隐藏导航栏中的直播按钮。',
        defaultValue: true,
      },
      {
        id: 'publish',
        title: '发布',
        description: '隐藏导航栏中的发布按钮。',
        defaultValue: false,
      },
      {
        id: 'notification',
        title: '通知',
        description: '隐藏导航栏中的通知按钮。',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'hideSearchSuggestions',
    title: '隐藏「猜你想搜」',
    description: '隐藏搜索框下方的「猜你想搜」提示。',
    setting: {
      id: 'hideSearchSuggestionsBox',
      defaultValue: true,
    },
  },
  {
    id: 'slashFocus',
    title: '斜杠聚焦搜索',
    description: '按下 / 时，自动聚焦到搜索框。',
    setting: {
      id: 'focusSearchOnSlash',
      defaultValue: true,
    },
  },
] as const satisfies readonly FeatureDefinition[]

type FeatureDefinitionItem = (typeof featureDefinitions)[number]

export type FeatureId = FeatureDefinitionItem['id']
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
