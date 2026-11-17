<template>
  <div class="filterbar" role="group" aria-label="Filtrer par tag">
    <button
      type="button"
      class="filterbar__tag"
      :class="{ 'filterbar__tag--active': active === null }"
      :aria-pressed="active === null"
      @click="emit('select', null)"
    >tout</button>
    <button
      v-for="tag in tags"
      :key="tag"
      type="button"
      class="filterbar__tag"
      :class="{ 'filterbar__tag--active': active === tag }"
      :aria-pressed="active === tag"
      @click="emit('select', tag)"
    >{{ tag }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[]
  active: string | null
}>()

const emit = defineEmits<{ select: [tag: string | null] }>()
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.filterbar {
  padding: 16px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filterbar__tag {
  font-size: 12px;
  font-family: $font-mono;
  padding: 5px 12px;
  border: 1px solid $border;
  color: $text-secondary;
  background: transparent;
  transition: color $duration $ease, border-color $duration $ease, background $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }

  &--active,
  &--active:hover,
  &--active:focus-visible {
    background: $text-primary;
    border-color: $text-primary;
    color: $bg;
  }
}
</style>