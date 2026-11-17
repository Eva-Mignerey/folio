<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <RouterView />
    </main>
    <AddCardModal v-if="showModal" @close="showModal = false" />
    <button
      v-if="isHome"
      type="button"
      class="app__fab"
      aria-label="Ajouter une vue"
      title="Ajouter une vue"
      aria-haspopup="dialog"
      @click="showModal = true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AddCardModal from './components/AddCardModal.vue'

const route = useRoute()
const showModal = ref(false)
const isHome = computed(() => route.name === 'home')
</script>

<style lang="scss" scoped>
@use './styles/variables' as *;

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app__main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 80px;

  @media (max-width: 600px) {
    padding: 0 16px 80px;
  }
}

.app__fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $accent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 0 0 6px rgba(210, 52, 88, 0.12), 0 10px 30px -6px $accent-glow;
  transition: transform $duration $ease, box-shadow $duration $ease;

  &:hover {
    transform: rotate(90deg);
    box-shadow: 0 0 0 10px rgba(210, 52, 88, 0.16), 0 10px 40px -4px $accent-glow;
  }

  &:focus-visible {
    outline: 2px solid $text-primary;
    outline-offset: 4px;
  }

  @media (max-width: 600px) {
    bottom: 20px;
    right: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>