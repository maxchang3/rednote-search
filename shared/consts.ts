export const featureDefinitions = [
  {
    id: 'hideFeed',
    title: 'features.hideFeed.title',
    description: 'features.hideFeed.description',
    setting: {
      id: 'hideExploreFeed',
      defaultValue: true,
    },
  },
  {
    id: 'hideSidebarNav',
    title: 'features.hideSidebarNav.title',
    description: 'features.hideSidebarNav.description',
    settings: [
      {
        id: 'livelist',
        title: 'features.hideSidebarNav.settings.livelist.title',
        description: 'features.hideSidebarNav.settings.livelist.description',
        defaultValue: true,
      },
      {
        id: 'publish',
        title: 'features.hideSidebarNav.settings.publish.title',
        description: 'features.hideSidebarNav.settings.publish.description',
        defaultValue: false,
      },
      {
        id: 'notification',
        title: 'features.hideSidebarNav.settings.notification.title',
        description: 'features.hideSidebarNav.settings.notification.description',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'hideSearchSuggestions',
    title: 'features.hideSearchSuggestions.title',
    description: 'features.hideSearchSuggestions.description',
    setting: {
      id: 'hideSearchSuggestionsBox',
      defaultValue: true,
    },
  },
  {
    id: 'hideNotificationBadge',
    title: 'features.hideNotificationBadge.title',
    description: 'features.hideNotificationBadge.description',
    setting: {
      id: 'hideNotificationBadgeCount',
      defaultValue: false,
    },
  },
  {
    id: 'slashFocus',
    title: 'features.slashFocus.title',
    description: 'features.slashFocus.description',
    setting: {
      id: 'focusSearchOnSlash',
      defaultValue: true,
    },
  },
] as const satisfies readonly FeatureDefinition[]

export type FeatureDefinitionItem = (typeof featureDefinitions)[number]

export type FeatureId = FeatureDefinitionItem['id']
