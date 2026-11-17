<template>
  <div class="filterbar" role="group" aria-label="Filtrer les vues">
    <button
      v-if="selectedCount > 0"
      type="button"
      class="filterbar__chip filterbar__chip--selection"
      :class="{ 'filterbar__chip--active': selectionOnly }"
      :aria-pressed="selectionOnly"
      @click="emit('toggle-selection')"
    >
      <span class="filterbar__dot" aria-hidden="true" />
      sélection <span class="filterbar__count">{{ selectedCount }}</span>
    </button>
    <span v-if="selectedCount > 0" class="filterbar__sep" aria-hidden="true" />
    <button
      type="button"
      class="filterbar__chip"
      :class="{ 'filterbar__chip--active': active === null }"
      :aria-pressed="active === null"
      @click="emit('select', null)"
    >tout</button>
    <button
      v-for="tag in tags"
      :key="tag"
      type="button"
      class="filterbar__chip"
      :class="{ 'filterbar__chip--active': active === tag }"
      :aria-pressed="active === tag"
      @click="emit('select', tag)"
    >#{{ tag }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[]
  active: string | null
  selectionOnly: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  select: [tag: string | null]
  'toggle-selection': []
}>()
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.filterbar {
  padding: 24px 0 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  @media (max-width: 600px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -16px;
    padding: 20px 16px 4px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.filterbar__chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-family: $font-mono;
  padding: 6px 12px;
  border: 1px solid $border;
  border-radius: 999px;
  color: $text-secondary;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color $duration $ease, border-color $duration $ease, background $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }

  &--active,
  &--active:hover,
  &--active:focus-visible {
    color: $text-primary;
    border-color: $accent;
    background: rgba(210, 52, 88, 0.14);
  }
}

.filterbar__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 8px $accent;
}

.filterbar__count {
  color: $text-muted;
}

.filterbar__sep {
  flex-shrink: 0;
  width: 1px;
  height: 18px;
  margin: 0 6px;
  background: $border-hover;
}
</style>