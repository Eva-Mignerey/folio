<template>
  <article class="frame" :class="{ 'frame--selected': card.selected, 'frame--editing': editing }" :aria-label="`Vue ${frame} : ${card.title}`">
    <div class="frame__film">
      <div class="frame__sprockets" aria-hidden="true" />
      <div class="frame__window">
        <img
          v-if="imageSrc && !imageError"
          :src="imageSrc"
          :alt="card.description || card.title"
          class="frame__image"
          loading="lazy"
          decoding="async"
          @error="imageError = true"
        />
        <div v-else class="frame__blank" role="img" :aria-label="blankLabel">
          <span v-if="!loading">{{ hasImage ? 'vue voilée' : 'non développée' }}</span>
        </div>
        <svg v-if="card.selected" class="frame__mark" viewBox="0 0 210 140" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M36 22 C90 4 170 6 194 36 C214 64 198 114 128 128 C64 140 12 120 9 76 C6 44 32 18 78 12" />
        </svg>

        <div class="frame__actions">
          <button
            type="button"
            class="frame__action"
            :class="{ 'frame__action--on': card.selected }"
            :aria-pressed="card.selected"
            :aria-label="card.selected ? `Retirer ${card.title} de la sélection` : `Sélectionner ${card.title}`"
            :title="card.selected ? 'Retirer de la sélection' : 'Sélectionner'"
            @click="emit('toggle-select', card.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 9c2-4 8-6 12-4s4 9 0 12-11 3-13-1c-1-3 0-5 3-7" /></svg>
          </button>
          <button v-if="!editing" type="button" class="frame__action" :aria-label="`Modifier ${card.title}`" title="Modifier" @click="startEdit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button v-if="!editing" type="button" class="frame__action frame__action--danger" :aria-label="`Supprimer ${card.title}`" title="Supprimer" @click="emit('delete', card.id)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
          </button>
        </div>
      </div>
      <div class="frame__edge" aria-hidden="true">
        <span>▸ {{ frame }}</span>
        <span>FOLIO 400</span>
      </div>
    </div>

    <div v-if="!editing" class="frame__caption">
      <h2 class="frame__title">{{ card.title }}</h2>
      <p v-if="card.description" class="frame__desc">{{ card.description }}</p>
      <ul v-if="card.tags.length" class="frame__tags" aria-label="Tags">
        <li v-for="tag in card.tags" :key="tag">
          <button type="button" class="frame__tag" :aria-label="`Filtrer par ${tag}`" @click="emit('select-tag', tag)">#{{ tag }}</button>
        </li>
      </ul>
    </div>

    <form v-else class="frame__form" @submit.prevent="saveEdit" @keydown.esc="cancelEdit">
      <input ref="titleInput" v-model="draft.title" class="frame__input" aria-label="Titre" placeholder="Titre" required @keydown.enter.prevent="saveEdit" />
      <div v-if="card.imageId && !draft.removeImage" class="frame__imported">
        <span>Image importée</span>
        <button type="button" class="frame__imported-remove" @click="draft.removeImage = true">Retirer l’image</button>
      </div>
      <input v-else v-model="draft.imageUrl" type="url" class="frame__input" aria-label="URL de l’image" placeholder="URL de l’image" @keydown.enter.prevent="saveEdit" />
      <textarea v-model="draft.description" class="frame__input frame__input--area" aria-label="Description" placeholder="Description" rows="3" />
      <input v-model="draft.tagsRaw" class="frame__input" aria-label="Tags, séparés par des virgules" placeholder="Tags (séparés par des virgules)" @keydown.enter.prevent="saveEdit" />
      <div class="frame__form-actions">
        <button type="button" class="frame__btn" @click="cancelEdit">Annuler</button>
        <button type="submit" class="frame__btn frame__btn--primary" :disabled="!draft.title.trim()">Enregistrer</button>
      </div>
    </form>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { Card, CardUpdate } from '../types'
import { parseTagInput } from '../stores/cards'
import { getImageUrl } from '../lib/imageStore'

const props = defineProps<{
  card: Card
  frame: string
}>()

const emit = defineEmits<{
  'select-tag': [tag: string]
  'toggle-select': [id: string]
  update: [id: string, updates: CardUpdate]
  delete: [id: string]
}>()

const editing = ref(false)
const imageError = ref(false)
const imageSrc = ref('')
const loading = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const draft = reactive({ title: '', imageUrl: '', description: '', tagsRaw: '', removeImage: false })

const hasImage = computed(() => Boolean(props.card.imageId || props.card.imageUrl))
const blankLabel = computed(() => {
  if (loading.value) return 'Chargement de l’image'
  return hasImage.value ? 'Image indisponible' : 'Pas d’image'
})

watch(
  () => [props.card.imageId, props.card.imageUrl] as const,
  async ([imageId, imageUrl]) => {
    imageError.value = false
    if (!imageId) {
      loading.value = false
      imageSrc.value = imageUrl
      return
    }
    loading.value = true
    const url = await getImageUrl(imageId)
    if (props.card.imageId !== imageId) return
    loading.value = false
    imageSrc.value = url ?? ''
    imageError.value = url === null
  },
  { immediate: true }
)

async function startEdit(): Promise<void> {
  draft.title = props.card.title
  draft.imageUrl = props.card.imageUrl
  draft.description = props.card.description
  draft.tagsRaw = props.card.tags.join(', ')
  draft.removeImage = false
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
    tags: parseTagInput(draft.tagsRaw),
    ...(draft.removeImage ? { imageId: '' } : {})
  })
  editing.value = false
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.frame {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frame__film {
  background: $film;
  border-radius: $radius;
  overflow: hidden;
  box-shadow: 0 0 0 1px $border;
  transition: box-shadow $duration $ease, transform $duration $ease;

  .frame:hover &,
  .frame:focus-within & {
    box-shadow: 0 0 0 1px $border-hover, 0 18px 40px -18px $accent-glow;
  }
}

.frame__sprockets {
  height: 16px;
  background-image: linear-gradient(90deg, rgba(255, 240, 230, 0.16) 0 9px, transparent 9px);
  background-size: 18px 6px;
  background-repeat: repeat-x;
  background-position: 5px center;
}

.frame__window {
  position: relative;
  margin: 0 7px;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: $surface-2;
}

.frame__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.88) contrast(1.04);
  transition: filter 400ms $ease, transform 600ms $ease;

  .frame:hover & {
    filter: brightness(1) contrast(1);
    transform: scale(1.03);
  }
}

.frame__blank {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-mono;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $text-muted;
  background: repeating-linear-gradient(135deg, $surface 0 10px, $surface-2 10px 20px);
}

.frame__mark {
  position: absolute;
  inset: 6% 5%;
  width: 90%;
  height: 88%;
  overflow: visible;
  pointer-events: none;

  path {
    fill: none;
    stroke: $accent;
    stroke-width: 3.5;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    filter: drop-shadow(0 0 6px $accent-glow);
    animation: draw 600ms $ease both;
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
}

.frame__edge {
  height: 30px;
  padding: 4px 10px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  font-family: $font-mono;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: $edge;
  background-image: linear-gradient(90deg, rgba(255, 240, 230, 0.16) 0 9px, transparent 9px);
  background-size: 18px 6px;
  background-repeat: repeat-x;
  background-position: 5px calc(100% - 5px);
}

.frame__actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity $duration $ease;

  .frame:hover &,
  .frame:focus-within &,
  .frame--editing & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
}

.frame__action {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(12, 11, 11, 0.72);
  backdrop-filter: blur(6px);
  color: $text-primary;
  transition: color $duration $ease, background $duration $ease;

  &:hover,
  &:focus-visible {
    background: rgba(12, 11, 11, 0.92);
  }

  &--on {
    color: $accent;
  }

  &--danger:hover,
  &--danger:focus-visible {
    color: $danger;
  }
}

.frame__caption {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 2px;
}

.frame__title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  line-height: 1.3;
}

.frame__desc {
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.55;
}

.frame__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
}

.frame__tag {
  font-family: $font-mono;
  font-size: 11px;
  color: $text-muted;
  transition: color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $edge;
  }
}

.frame__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.frame__input {
  width: 100%;
  background: $surface;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 8px 10px;
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

.frame__imported {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px dashed $border;
  border-radius: $radius;
  font-family: $font-mono;
  font-size: 11px;
  color: $text-muted;
}

.frame__imported-remove {
  font-family: $font-mono;
  font-size: 11px;
  color: $text-secondary;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover,
  &:focus-visible {
    color: $danger;
  }
}

.frame__form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.frame__btn {
  font-family: $font-mono;
  font-size: 12px;
  padding: 7px 14px;
  border: 1px solid $border;
  border-radius: $radius;
  color: $text-secondary;
  transition: color $duration $ease, border-color $duration $ease, opacity $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    border-color: $border-hover;
  }

  &--primary {
    background: $accent;
    border-color: $accent;
    color: #fff;

    &:hover,
    &:focus-visible {
      color: #fff;
      border-color: $accent;
      opacity: 0.88;
    }
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame__image,
  .frame__film {
    transition: none;
  }

  .frame__mark path {
    animation: none;
  }
}
</style>