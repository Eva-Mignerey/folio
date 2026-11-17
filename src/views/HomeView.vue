<template>
  <section class="home" aria-labelledby="home-title">
    <h1 id="home-title" class="home__title">Mes cartes</h1>
    <FilterBar :tags="allTags" :active="activeTag" @select="store.setTag" />
    <CardGrid
      :cards="filteredCards"
      :has-filters="hasFilters"
      @select-tag="store.setTag"
      @update="store.updateCard"
      @delete="store.deleteCard"
      @reset="resetFilters"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardsStore } from '../stores/cards'
import FilterBar from '../components/FilterBar.vue'
import CardGrid from '../components/CardGrid.vue'

const store = useCardsStore()
const { allTags, activeTag, filteredCards, searchQuery } = storeToRefs(store)

const hasFilters = computed(() => activeTag.value !== null || searchQuery.value.trim() !== '')

function resetFilters(): void {
  activeTag.value = null
  searchQuery.value = ''
}
</script>

<style lang="scss" scoped>
.home__title {
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
</style>