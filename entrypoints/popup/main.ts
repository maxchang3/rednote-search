import './style.css'
import { i18n } from '#i18n'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Popup root not found')

document.title = i18n.t('popup.pageTitle')

const renderSettingToggle = (featureId: FeatureId, settingId: string) => `
  <label class="feature-switch">
    <input
      class="feature-toggle"
      type="checkbox"
      data-feature-id="${featureId}"
      data-setting-id="${settingId}"
    />
    <span class="feature-slider" aria-hidden="true"></span>
  </label>
`

const renderFeatures = () => {
  return featureDefinitions
    .map((feature) => {
      if ('setting' in feature) {
        const setting = feature.setting

        return `
          <div class="feature-card">
            <span class="feature-copy">
              <span class="feature-title">${i18n.t(feature.title)}</span>
              <span class="feature-description">${i18n.t(feature.description)}</span>
            </span>
            ${renderSettingToggle(feature.id, setting.id)}
          </div>
        `
      }

      return `
        <div class="feature-card feature-card-group">
          <span class="feature-copy">
            <span class="feature-title">${i18n.t(feature.title)}</span>
            <span class="feature-description">${i18n.t(feature.description)}</span>
          </span>
          <div class="feature-group-list">
            ${feature.settings
              .map(
                (setting) => `
                  <div class="feature-group-row">
                    <span class="feature-group-copy">
                      <span class="feature-group-title">${i18n.t(setting.title)}</span>
                      <span class="feature-group-description">${i18n.t(setting.description)}</span>
                    </span>
                    ${renderSettingToggle(feature.id, setting.id)}
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      `
    })
    .join('')
}

app.innerHTML = `
  <main class="popup-shell">
    <header class="popup-header">
      <h1>${i18n.t('popup.title')}</h1>
      <button type="button" class="reset-button" data-reset-settings>${i18n.t('popup.reset.idle')}</button>
    </header>
    <section class="feature-list">
      ${renderFeatures()}
    </section>
  </main>
`

const toggles = Array.from(document.querySelectorAll<HTMLInputElement>('[data-feature-id]'))
const resetButton = document.querySelector<HTMLButtonElement>('[data-reset-settings]')
const resetButtonLabels = {
  idle: i18n.t('popup.reset.idle'),
  pending: i18n.t('popup.reset.pending'),
  success: i18n.t('popup.reset.success'),
} as const
let resetFeedbackTimer: number | null = null

const setResetButtonState = (state: keyof typeof resetButtonLabels) => {
  if (!resetButton) return
  resetButton.textContent = resetButtonLabels[state]
  resetButton.dataset.state = state
}

type ToggleMeta = {
  [K in FeatureId]: {
    featureId: K
    settingId: FeatureSettingId<K>
  }
}[FeatureId]

type ToggleMetaByFeatureId<TFeatureId extends FeatureId> = {
  featureId: TFeatureId
  settingId: FeatureSettingId<TFeatureId>
}

const getToggleMeta = (toggle: HTMLInputElement): ToggleMeta | null => {
  const featureId = toggle.dataset.featureId
  const settingId = toggle.dataset.settingId
  if (!featureId || !isFeatureId(featureId) || !settingId || !isFeatureSettingId(featureId, settingId)) return null
  return { featureId, settingId } as ToggleMeta
}

const getSettingValue = <TFeatureId extends FeatureId>(
  settings: Awaited<ReturnType<typeof loadFeatureSettings>>,
  toggleMeta: ToggleMetaByFeatureId<TFeatureId>
) => {
  const featureSettings = settings[toggleMeta.featureId] as Record<FeatureSettingId<TFeatureId>, boolean>
  return featureSettings[toggleMeta.settingId]
}

const syncUI = async () => {
  const settings = await loadFeatureSettings()
  toggles.forEach((toggle) => {
    const toggleMeta = getToggleMeta(toggle)
    if (!toggleMeta) return

    toggle.checked = getSettingValue(settings, toggleMeta)
  })
}

toggles.forEach((toggle) => {
  toggle.addEventListener('change', async () => {
    const toggleMeta = getToggleMeta(toggle)
    if (!toggleMeta) return

    toggle.disabled = true
    try {
      await setFeatureSetting(toggleMeta.featureId, toggleMeta.settingId, toggle.checked)
    } finally {
      toggle.disabled = false
    }
  })
})

resetButton?.addEventListener('click', async () => {
  if (resetFeedbackTimer !== null) {
    window.clearTimeout(resetFeedbackTimer)
    resetFeedbackTimer = null
  }

  setResetButtonState('pending')
  resetButton.disabled = true
  toggles.forEach((toggle) => {
    toggle.disabled = true
  })

  try {
    await resetFeatureSettings()
    await syncUI()
    setResetButtonState('success')
    resetFeedbackTimer = window.setTimeout(() => {
      setResetButtonState('idle')
      resetFeedbackTimer = null
    }, 1200)
  } finally {
    toggles.forEach((toggle) => {
      toggle.disabled = false
    })
    resetButton.disabled = false
  }
})

setResetButtonState('idle')
syncUI()
