<template>
  <div class="empty" role="status">
    <div class="empty__frame" aria-hidden="true">
      <span class="empty__edge">▸ 00A</span>
    </div>
    <p class="empty__title">{{ hasFilters ? 'Aucune vue sur cette planche' : 'Planche vierge' }}</p>
    <template v-if="hasFilters">
      <p class="empty__sub">Rien ne correspond à cette recherche ou à ce filtre.</p>
      <button type="button" class="empty__reset" @click="emit('reset')">Réinitialiser les filtres</button>
    </template>
    <p v-else class="empty__sub">Clique sur <span class="empty__plus" aria-hidden="true">+</span> pour ajouter ta première vue.</p>
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
  padding: 72px 24px;
  text-align: center;
}

.empty__frame {
  width: 150px;
  aspect-ratio: 3 / 2;
  margin-bottom: 16px;
  position: relative;
  border-radius: $radius;
  background: repeating-linear-gradient(135deg, $surface 0 10px, $surface-2 10px 20px);
  box-shadow: 0 0 0 6px $film, 0 0 0 7px $border;
}

.empty__edge {
  position: absolute;
  left: 0;
  bottom: -22px;
  font-family: $font-mono;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: $edge;
}

.empty__title {
  margin-top: 12px;
  font-family: $font-mono;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $text-primary;
}

.empty__sub {
  font-size: 13px;
  color: $text-muted;
}

.empty__plus {
  font-family: $font-mono;
  color: $accent;
}

.empty__reset {
  margin-top: 10px;
  font-size: 12px;
  font-family: $font-mono;
  padding: 7px 16px;
  border: 1px solid $border;
  border-radius: 999px;
  color: $text-secondary;
  transition: color $duration $ease, border-color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $accent;
  }
}
</style>