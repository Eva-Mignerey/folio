<template>
  <div class="empty" role="status">
    <p class="empty__title">Aucune carte trouvée</p>
    <template v-if="hasFilters">
      <p class="empty__sub">Essaie un autre mot-clé ou filtre.</p>
      <button type="button" class="empty__reset" @click="emit('reset')">Réinitialiser les filtres</button>
    </template>
    <p v-else class="empty__sub">Clique sur <span class="empty__plus" aria-hidden="true">+</span> pour ajouter ta première carte.</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ hasFilters?: boolean }>(), { hasFilters: false })

const emit = defineEmits<{ reset: [] }>()
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 80px 24px;
  text-align: center;
}

.empty__title {
  font-size: 14px;
  font-weight: 500;
  color: $text-secondary;
}

.empty__sub {
  font-size: 13px;
  color: $text-muted;
}

.empty__plus {
  font-family: $font-mono;
  color: $text-primary;
}

.empty__reset {
  margin-top: 8px;
  font-size: 12px;
  font-family: $font-mono;
  padding: 6px 14px;
  border: 1px solid $border;
  color: $text-secondary;
  transition: color $duration $ease, border-color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }
}
</style>