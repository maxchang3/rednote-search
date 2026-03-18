import './style.css'
import icon from '@/assets/icon.svg'
import { featureDefinitions, isFeatureId, isFeatureSettingId } from '@/shared/features'
import { loadFeatureSettings, resetFeatureSettings, setFeatureSetting } from '@/shared/settings'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Popup root not found')

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
              <span class="feature-title">${feature.title}</span>
              <span class="feature-description">${feature.description}</span>
            </span>
            ${renderSettingToggle(feature.id, setting.id)}
          </div>
        `
      }

      return `
        <div class="feature-card feature-card-group">
          <span class="feature-copy">
            <span class="feature-title">${feature.title}</span>
            <span class="feature-description">${feature.description}</span>
          </span>
          <div class="feature-group-list">
            ${feature.settings
              .map(
                (setting) => `
                  <div class="feature-group-row">
                    <span class="feature-group-copy">
                      <span class="feature-group-title">${setting.title}</span>
                      <span class="feature-group-description">${setting.description}</span>
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
      <img src="${icon}" class="popup-logo" alt="小红搜 logo" />
      <div>
        <p class="popup-eyebrow">RedNote Search</p>
        <h1>小红搜设置</h1>
      </div>
    </header>
    <section class="feature-list">
      ${renderFeatures()}
    </section>
    <footer class="popup-footer">
      <button type="button" class="reset-button" data-reset-settings>重置配置</button>
    </footer>
  </main>
`

const toggles = Array.from(document.querySelectorAll<HTMLInputElement>('[data-feature-id]'))
const resetButton = document.querySelector<HTMLButtonElement>('[data-reset-settings]')
const resetButtonLabels = {
  idle: '重置配置',
  pending: '重置中...',
  success: '已重置',
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

const getToggleMeta = (toggle: HTMLInputElement): ToggleMeta | null => {
  const featureId = toggle.dataset.featureId
  const settingId = toggle.dataset.settingId
  if (!featureId || !isFeatureId(featureId) || !settingId || !isFeatureSettingId(featureId, settingId)) return null
  return { featureId, settingId } as ToggleMeta
}

const getSettingValue = <TFeatureId extends FeatureId>(
  settings: Awaited<ReturnType<typeof loadFeatureSettings>>,
  toggleMeta: { featureId: TFeatureId; settingId: FeatureSettingId<TFeatureId> }
) => {
  const featureSettings = settings[toggleMeta.featureId] as Record<FeatureSettingId<TFeatureId>, boolean>
  return featureSettings[toggleMeta.settingId]
}

const updateSetting = <TFeatureId extends FeatureId>(
  toggleMeta: { featureId: TFeatureId; settingId: FeatureSettingId<TFeatureId> },
  enabled: boolean
) => setFeatureSetting(toggleMeta.featureId, toggleMeta.settingId, enabled)

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
      await updateSetting(toggleMeta, toggle.checked)
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
