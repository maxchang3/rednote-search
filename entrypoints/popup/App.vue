<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { featureDefinitions } from '../../shared/consts'
import { localeLabels, type SupportedLocale, setLocale, watchLocale } from '../../shared/locale'
import { loadFeatureSettings, resetFeatureSettings, setFeatureSetting } from '../../shared/settings'
import type { FeatureId, FeatureSettingId, FeatureSettings } from '../../shared/types'

const { t, locale } = useI18n<{ message: typeof import('../../locales/zh-CN.json') }, SupportedLocale>()

const settings = ref<FeatureSettings | null>(null)
const resetState = ref<'idle' | 'pending' | 'success'>('idle')
const currentLocale = ref<SupportedLocale>(locale.value as SupportedLocale)

const loadSettings = async () => {
  settings.value = await loadFeatureSettings()
}

const handleToggle = async (featureId: FeatureId, settingId: string, checked: boolean) => {
  await setFeatureSetting(featureId, settingId as FeatureSettingId<typeof featureId>, checked)
}

const getSettingValue = (featureId: FeatureId, settingId: string): boolean => {
  if (!settings.value) return false
  const featureSettings = settings.value[featureId] as Record<string, boolean>
  return featureSettings[settingId] ?? false
}

const handleReset = async () => {
  resetState.value = 'pending'
  try {
    await resetFeatureSettings()
    await loadSettings()
    resetState.value = 'success'
    setTimeout(() => {
      resetState.value = 'idle'
    }, 1200)
  } catch {
    resetState.value = 'idle'
  }
}

const handleLocaleChange = async (newLocale: SupportedLocale) => {
  currentLocale.value = newLocale
  locale.value = newLocale
  await setLocale(newLocale)
}

onMounted(() => {
  loadSettings()
  watchLocale((newLocale) => {
    currentLocale.value = newLocale
    locale.value = newLocale
  })
})
</script>

<template>
  <main class="popup-shell">
    <header class="popup-header">
      <h1>{{ t('popup.title') }}</h1>
      <button
        type="button"
        class="reset-button"
        :data-state="resetState"
        :disabled="resetState === 'pending'"
        @click="handleReset"
      >
        {{ t(`popup.reset.${resetState}`) }}
      </button>
    </header>

    <!-- Language Selector -->
    <section class="feature-list">
      <div class="feature-card">
        <span class="feature-copy">
          <span class="feature-title">{{ t('popup.language.title') }}</span>
          <span class="feature-description">{{ t('popup.language.description') }}</span>
        </span>
        <select v-model="currentLocale" class="locale-select" @change="handleLocaleChange(currentLocale)">
          <option v-for="(label, key) in localeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </section>

    <!-- Features -->
    <section class="feature-list">
      <template v-for="feature in featureDefinitions" :key="feature.id">
        <div v-if="'setting' in feature" class="feature-card">
          <span class="feature-copy">
            <span class="feature-title">{{ t(feature.title) }}</span>
            <span class="feature-description">{{ t(feature.description) }}</span>
          </span>
          <label class="feature-switch">
            <input
              v-if="settings"
              class="feature-toggle"
              type="checkbox"
              :checked="getSettingValue(feature.id, feature.setting.id)"
              @change="handleToggle(feature.id, feature.setting.id, ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-slider" aria-hidden="true"></span>
          </label>
        </div>

        <div v-else class="feature-card feature-card-group">
          <span class="feature-copy">
            <span class="feature-title">{{ t(feature.title) }}</span>
            <span class="feature-description">{{ t(feature.description) }}</span>
          </span>
          <div class="feature-group-list">
            <div v-for="setting in feature.settings" :key="setting.id" class="feature-group-row">
              <span class="feature-group-copy">
                <span class="feature-group-title">{{ t(setting.title) }}</span>
                <span class="feature-group-description">{{ t(setting.description) }}</span>
              </span>
              <label class="feature-switch">
                <input
                  v-if="settings"
                  class="feature-toggle"
                  type="checkbox"
                  :checked="getSettingValue(feature.id, setting.id)"
                  @change="handleToggle(feature.id, setting.id, ($event.target as HTMLInputElement).checked)"
                />
                <span class="feature-slider" aria-hidden="true"></span>
              </label>
            </div>
          </div>
        </div>
      </template>
    </section>
  </main>
</template>

<style src="./style.css"></style>