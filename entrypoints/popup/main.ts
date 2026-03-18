import './style.css'
import icon from '@/assets/icon.svg'
import { featureDefinitions, isFeatureId, isFeatureSettingId } from '@/shared/features'
import { loadFeatureSettings, setFeatureSetting } from '@/shared/settings'

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
      if (feature.settings.length === 1) {
        const [setting] = feature.settings

        return `
          <div class="feature-card">
            <span class="feature-copy">
              <span class="feature-title">${feature.title}</span>
              <span class="feature-description">${setting.description}</span>
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
  </main>
`

const toggles = Array.from(document.querySelectorAll<HTMLInputElement>('[data-feature-id]'))

const getToggleMeta = (toggle: HTMLInputElement): { featureId: FeatureId; settingId: string } | null => {
  const featureId = toggle.dataset.featureId
  const settingId = toggle.dataset.settingId
  if (!featureId || !isFeatureId(featureId) || !settingId || !isFeatureSettingId(featureId, settingId)) return null
  return { featureId, settingId }
}

const syncUI = async () => {
  const settings = await loadFeatureSettings()
  toggles.forEach((toggle) => {
    const toggleMeta = getToggleMeta(toggle)
    if (!toggleMeta) return

    toggle.checked = Boolean((settings[toggleMeta.featureId] as Record<string, boolean>)[toggleMeta.settingId])
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

syncUI()
