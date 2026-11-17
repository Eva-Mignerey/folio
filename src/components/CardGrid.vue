<template>
  <div class="grid-wrapper">
    <TransitionGroup v-if="cards.length" name="card" tag="div" class="grid">
      <CardItem
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :frame="frameLabels.get(card.id) ?? '00A'"
        @select-tag="tag => emit('select-tag', tag)"
        @toggle-select="id => emit('toggle-select', id)"
        @update="(id, updates) => emit('update', id, updates)"
        @delete="id => emit('delete', id)"
      />
    </TransitionGroup>
    <EmptyState v-else :has-filters="hasFilters" @reset="emit('reset')" />
  </div>
</template>

<script setup lang="ts">
import type { Card, CardUpdate } from '../types'
import CardItem from './CardItem.vue'
import EmptyState from './EmptyState.vue'

defineProps<{
  cards: Card[]
  frameLabels: Map<string, string>
  hasFilters: boolean
}>()

const emit = defineEmits<{
  'select-tag': [tag: string]
  'toggle-select': [id: string]
  update: [id: string, updates: CardUpdate]
  delete: [id: string]
  reset: []
}>()
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.grid-wrapper {
  padding-top: 28px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 32px 22px;
}

.card-enter-active,
.card-leave-active {
  transition: opacity 250ms $ease, transform 250ms $ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.card-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card-enter-active,
  .card-leave-active {
    transition: none;
  }
}
</style>