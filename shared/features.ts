type FeatureSettingDefinition = {
  id: string
  title: string
  description: string
  defaultValue: boolean
}

type FeatureDefinition = {
  id: string
  title: string
  description: string
  settings: readonly FeatureSettingDefinition[]
}

export const featureDefinitions = [
  {
    id: 'hideFeed',
    title: '隐藏首页信息流',
    description: '隐藏主页信息流，搜索框页面居中。',
    settings: [
      {
        id: 'hideExploreFeed',
        title: '隐藏信息流',
        description: '隐藏主页信息流，搜索框页面居中。',
        defaultValue: true,
      },
    ],
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
    id: 'slashFocus',
    title: '斜杠聚焦搜索',
    description: '按下 / 时，自动聚焦到搜索框。',
    settings: [
      {
        id: 'focusSearchOnSlash',
        title: '按 / 聚焦搜索',
        description: '按下 / 时，自动聚焦到搜索框。',
        defaultValue: true,
      },
    ],
  },
] as const satisfies readonly FeatureDefinition[]

export type FeatureId = (typeof featureDefinitions)[number]['id']
export type FeatureSettingId<TFeatureId extends FeatureId = FeatureId> = Extract<
  (typeof featureDefinitions)[number],
  { id: TFeatureId }
>['settings'][number]['id']

export const isFeatureId = (value: string): value is FeatureId => {
  return featureDefinitions.some((feature) => feature.id === value)
}

export const getFeatureDefinition = <TFeatureId extends FeatureId>(featureId: TFeatureId) => {
  return featureDefinitions.find((feature) => feature.id === featureId) as Extract<
    (typeof featureDefinitions)[number],
    { id: TFeatureId }
  >
}

export const isFeatureSettingId = <TFeatureId extends FeatureId>(
  featureId: TFeatureId,
  value: string
): value is FeatureSettingId<TFeatureId> => {
  return getFeatureDefinition(featureId).settings.some((setting) => setting.id === value)
}
