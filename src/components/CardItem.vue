<template>
  <article class="card" :class="{ 'card--editing': editing }" :aria-label="card.title">
    <div v-if="card.imageUrl && !editing" class="card__image-wrap">
      <img
        v-if="!imageError"
        :src="card.imageUrl"
        :alt="card.description || card.title"
        class="card__image"
        loading="lazy"
        decoding="async"
        @error="imageError = true"
      />
      <div v-else class="card__image-placeholder" role="img" aria-label="Image indisponible">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
      </div>
    </div>

    <div v-if="!editing" class="card__body">
      <h2 class="card__title">{{ card.title }}</h2>
      <p v-if="card.description" class="card__desc">{{ card.description }}</p>
      <ul v-if="card.tags.length" class="card__tags" aria-label="Tags">
        <li v-for="tag in card.tags" :key="tag">
          <button type="button" class="card__tag" :aria-label="`Filtrer par ${tag}`" @click="emit('select-tag', tag)">{{ tag }}</button>
        </li>
      </ul>
    </div>

    <form v-else class="card__body" @submit.prevent="saveEdit" @keydown.esc="cancelEdit">
      <input ref="titleInput" v-model="draft.title" class="card__edit-input" aria-label="Titre" placeholder="Titre" required @keydown.enter.prevent="saveEdit" />
      <input v-model="draft.imageUrl" type="url" class="card__edit-input" aria-label="URL de l’image" placeholder="URL de l’image" @keydown.enter.prevent="saveEdit" />
      <textarea v-model="draft.description" class="card__edit-input card__edit-input--area" aria-label="Description" placeholder="Description" rows="3" />
      <input v-model="draft.tagsRaw" class="card__edit-input" aria-label="Tags, séparés par des virgules" placeholder="Tags (séparés par des virgules)" @keydown.enter.prevent="saveEdit" />
    </form>

    <div class="card__actions">
      <template v-if="!editing">
        <button type="button" class="card__action" :aria-label="`Modifier ${card.title}`" title="Modifier" @click="startEdit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
        <button type="button" class="card__action card__action--danger" :aria-label="`Supprimer ${card.title}`" title="Supprimer" @click="emit('delete', card.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
        </button>
      </template>
      <template v-else>
        <button type="button" class="card__action card__action--save" aria-label="Enregistrer" title="Enregistrer" :disabled="!draft.title.trim()" @click="saveEdit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
        </button>
        <button type="button" class="card__action" aria-label="Annuler" title="Annuler" @click="cancelEdit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import type { Card, CardUpdate } from '../types'
import { parseTagInput } from '../stores/cards'

const props = defineProps<{ card: Card }>()

const emit = defineEmits<{
  'select-tag': [tag: string]
  update: [id: string, updates: CardUpdate]
  delete: [id: string]
}>()

const editing = ref(false)
const imageError = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const draft = reactive({ title: '', imageUrl: '', description: '', tagsRaw: '' })

watch(
  () => props.card.imageUrl,
  () => {
    imageError.value = false
  }
)

async function startEdit(): Promise<void> {
  draft.title = props.card.title
  draft.imageUrl = props.card.imageUrl
  draft.description = props.card.description
  draft.tagsRaw = props.card.tags.join(', ')
  editing.value = true
  await nextTick()
  titleInput.value?.focus()
}

function cancelEdit(): void {
  editing.value = false
}

function saveEdit(): void {
  if (!draft.title.trim()) return
  emit('update', props.card.id, {
    title: draft.title,
    imageUrl: draft.imageUrl,
    description: draft.description,
    tags: parseTagInput(draft.tagsRaw)
  })
  editing.value = false
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.card {
  background: $surface;
  border: 1px solid $border;
  position: relative;

  &--editing {
    border-color: $border-hover;
  }
}

.card__image-wrap {
  overflow: hidden;
}

.card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 350ms $ease;

  .card:hover & {
    transform: scale(1.02);
  }
}

.card__image-placeholder {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  background: $surface-2;
}

.card__body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card__title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.3;
  padding-right: 64px;
}

.card__desc {
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.55;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.card__tag {
  font-size: 11px;
  font-family: $font-mono;
  padding: 2px 7px;
  border: 1px solid $border;
  color: $text-muted;
  background: transparent;
  transition: color $duration $ease, border-color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }
}

.card__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity $duration $ease;

  .card:hover &,
  .card:focus-within &,
  .card--editing & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
}

.card__action {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $surface;
  border: 1px solid $border;
  color: $text-secondary;
  transition: color $duration $ease, border-color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }

  &--danger:hover,
  &--danger:focus-visible {
    color: #c0392b;
    border-color: #c0392b;
  }

  &--save {
    color: $text-primary;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.card__edit-input {
  width: 100%;
  background: $bg;
  border: 1px solid $border;
  padding: 7px 10px;
  font-size: 13px;
  color: $text-primary;
  transition: border-color $duration $ease;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    border-color: $border-hover;
  }

  &--area {
    resize: vertical;
    font-family: $font-body;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card__image {
    transition: none;
  }
}
</style>