type FeatureDefinition = {
  id: string
  title: string
  description: string
  defaultValue: boolean
}

export const featureDefinitions = [
  {
    id: 'hideFeed',
    title: '隐藏首页信息流',
    description: '隐藏主页信息流，搜索框页面居中。',
    defaultValue: true,
  },
  {
    id: 'slashFocus',
    title: '斜杠聚焦搜索',
    description: '按下 / 时，自动聚焦到搜索框。',
    defaultValue: true,
  },
  {
    id: 'hideLivelistNav',
    title: '隐藏直播入口',
    description: '隐藏导航栏中的直播按钮。',
    defaultValue: false,
  },
] as const satisfies readonly FeatureDefinition[]

export type FeatureId = (typeof featureDefinitions)[number]['id']

export const isFeatureId = (value: string): value is FeatureId => {
  return featureDefinitions.some((feature) => feature.id === value)
}
