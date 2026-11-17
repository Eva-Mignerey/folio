<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="{ name: 'home' }" class="header__brand" aria-label="Folio, accueil">
        <span class="header__logo" aria-hidden="true">FLO</span>
        <span class="header__name">Folio</span>
      </RouterLink>

      <div class="header__search" role="search">
        <label :for="searchId" class="header__sr-only">Rechercher une carte</label>
        <input
          :id="searchId"
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher..."
          class="header__search-input"
          autocomplete="off"
          @input="goHome"
        />
        <button v-if="searchQuery" type="button" class="header__search-clear" aria-label="Effacer la recherche" @click="searchQuery = ''">×</button>
      </div>

      <div class="header__actions">
        <span class="header__count" aria-live="polite">{{ countLabel }}</span>
        <button type="button" class="header__btn" aria-label="Exporter en JSON" title="Exporter en JSON" @click="exportCards">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>
        <button type="button" class="header__btn" aria-label="Importer un JSON" title="Importer un JSON" @click="triggerImport">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        </button>
        <input ref="fileInput" type="file" accept=".json,application/json" class="header__file-input" tabindex="-1" aria-hidden="true" @change="handleImport" />
        <RouterLink :to="{ name: 'about' }" class="header__btn" aria-label="À propos" title="À propos">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8" /><line x1="12" y1="12" x2="12" y2="16" /></svg>
        </RouterLink>
      </div>
    </div>

    <div class="header__toast-zone" aria-live="polite">
      <Transition name="toast">
        <p v-if="toast.visible" class="toast" :class="`toast--${toast.type}`">{{ toast.message }}</p>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, useId, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '../stores/cards'

type ToastType = 'success' | 'error'

const store = useCardsStore()
const { searchQuery, filteredCards, saveError } = storeToRefs(store)
const route = useRoute()
const router = useRouter()

const searchId = useId()
const fileInput = ref<HTMLInputElement | null>(null)
const toast = reactive({ visible: false, message: '', type: 'success' as ToastType })
let toastTimer: ReturnType<typeof setTimeout> | undefined

const countLabel = computed(() => {
  const count = filteredCards.value.length
  return `${count} carte${count > 1 ? 's' : ''}`
})

watch(saveError, failed => {
  if (failed) showToast('Enregistrement impossible : le stockage du navigateur est plein.', 'error')
})

function goHome(): void {
  if (route.name !== 'home') router.push({ name: 'home' })
}

function exportCards(): void {
  const data = store.buildExport()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `folio-export-${data.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  showToast(`${data.cards.length} carte${data.cards.length > 1 ? 's' : ''} exportée${data.cards.length > 1 ? 's' : ''}.`)
}

function triggerImport(): void {
  if (!fileInput.value) return
  fileInput.value.value = ''
  fileInput.value.click()
}

async function handleImport(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const count = store.importCards(await file.text())
    if (count === 0) {
      showToast('Aucune carte valide dans ce fichier.', 'error')
      return
    }
    showToast(`${count} carte${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''}.`)
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Import impossible.', 'error')
  }
}

function showToast(message: string, type: ToastType = 'success'): void {
  clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.visible = true
  toastTimer = setTimeout(() => {
    toast.visible = false
  }, 3000)
}

onBeforeUnmount(() => clearTimeout(toastTimer))
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: $surface;
  border-bottom: 1px solid $border;
}

.header__inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 600px) {
    padding: 0 16px;
    gap: 12px;
  }
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  text-decoration: none;
}

.header__logo {
  font-family: $font-mono;
  font-size: 12px;
  color: $text-secondary;
  border: 1px solid $border-hover;
  padding: 3px 7px;
  letter-spacing: 0.05em;
}

.header__name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;

  @media (max-width: 480px) {
    display: none;
  }
}

.header__search {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.header__search-input {
  width: 100%;
  background: $bg;
  border: 1px solid $border;
  padding: 8px 12px;
  font-size: 13px;
  color: $text-primary;
  transition: border-color $duration $ease;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    border-color: $border-hover;
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
}

.header__search-clear {
  position: absolute;
  right: 10px;
  font-size: 18px;
  color: $text-muted;
  line-height: 1;
  transition: color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.header__count {
  font-size: 12px;
  font-family: $font-mono;
  color: $text-muted;
  margin-right: 6px;

  @media (max-width: 480px) {
    display: none;
  }
}

.header__btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  border: 1px solid $border;
  background: transparent;
  text-decoration: none;
  transition: color $duration $ease, border-color $duration $ease, background $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
    background: $bg;
  }

  &.router-link-active {
    color: $text-primary;
    border-color: $border-hover;
    background: $bg;
  }
}

.header__file-input {
  display: none;
}

.header__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.header__toast-zone {
  position: absolute;
  top: calc(100% + 8px);
  right: 24px;
  z-index: 200;

  @media (max-width: 600px) {
    right: 16px;
    left: 16px;
  }
}

.toast {
  font-size: 13px;
  font-family: $font-mono;
  padding: 8px 14px;
  border: 1px solid $border-hover;
  background: $surface;
  color: $text-primary;

  &--error {
    border-color: #c0392b;
    color: #c0392b;
  }
}

.toast-enter-active, .toast-leave-active {
  transition: opacity $duration $ease, transform $duration $ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active, .toast-leave-active {
    transition: none;
  }
}
</style>