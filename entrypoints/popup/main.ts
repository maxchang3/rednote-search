import './style.css'
import icon from '@/assets/icon.svg'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('Popup root not found')

const renderFeatures = () => {
  return featureDefinitions
    .map(
      (feature) => `
        <label class="feature-card">
          <span class="feature-copy">
            <span class="feature-title">${feature.title}</span>
            <span class="feature-description">${feature.description}</span>
          </span>
          <span class="feature-switch">
            <input
              class="feature-toggle"
              type="checkbox"
              data-feature-id="${feature.id}"
            />
            <span class="feature-slider" aria-hidden="true"></span>
          </span>
        </label>
      `
    )
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

const getToggleFeatureId = (toggle: HTMLInputElement): FeatureId | null => {
  const featureId = toggle.dataset.featureId
  if (!featureId || !isFeatureId(featureId)) return null
  return featureId
}

const syncUI = async () => {
  const settings = await loadFeatureSettings()
  toggles.forEach((toggle) => {
    const featureId = getToggleFeatureId(toggle)
    if (!featureId) return
    toggle.checked = settings[featureId]
  })
}

toggles.forEach((toggle) => {
  toggle.addEventListener('change', async () => {
    const featureId = getToggleFeatureId(toggle)
    if (!featureId) return

    toggle.disabled = true
    try {
      await setFeatureEnabled(featureId, toggle.checked)
    } finally {
      toggle.disabled = false
    }
  })
})

syncUI()
