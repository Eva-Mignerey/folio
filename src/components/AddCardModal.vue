<template>
  <dialog ref="dialogRef" class="modal" :aria-labelledby="ids.title" @close="emit('close')" @click="closeOnBackdrop">
    <form class="modal__inner" @submit.prevent="submit">
      <div class="modal__header">
        <div class="modal__heading">
          <span class="modal__lamp" aria-hidden="true" />
          <h2 :id="ids.title" class="modal__title">Nouvelle vue</h2>
        </div>
        <button type="button" class="modal__close" aria-label="Fermer" @click="close">×</button>
      </div>

      <div class="modal__body">
        <div class="modal__field">
          <label :for="ids.titleInput" class="modal__label">Titre *</label>
          <input :id="ids.titleInput" v-model="form.title" class="modal__input" placeholder="Ex : Références typographiques" required autofocus />
        </div>
        <div class="modal__field">
          <label :for="ids.url" class="modal__label">URL de l’image</label>
          <input :id="ids.url" v-model="form.imageUrl" type="url" class="modal__input" placeholder="https://..." />
          <div v-if="showPreview" class="modal__preview">
            <img :src="form.imageUrl" alt="Aperçu de l’image" @error="previewError = true" />
          </div>
          <p v-if="previewError" class="modal__error" role="alert">Impossible de charger cette image.</p>
        </div>
        <div class="modal__field">
          <label :for="ids.description" class="modal__label">Description</label>
          <textarea :id="ids.description" v-model="form.description" class="modal__input modal__input--area" placeholder="Quelques mots..." rows="3" />
        </div>
        <div class="modal__field">
          <label :for="ids.tags" class="modal__label">Tags <span class="modal__hint">— séparés par des virgules</span></label>
          <input :id="ids.tags" v-model="form.tagsRaw" class="modal__input" placeholder="ux, typographie, couleur" />
        </div>
      </div>

      <div class="modal__footer">
        <button type="button" class="modal__btn modal__btn--cancel" @click="close">Annuler</button>
        <button type="submit" class="modal__btn modal__btn--submit" :disabled="!form.title.trim()">Ajouter</button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import { parseTagInput, useCardsStore } from '../stores/cards'

const emit = defineEmits<{ close: [] }>()

const store = useCardsStore()
const dialogRef = ref<HTMLDialogElement | null>(null)
const previewError = ref(false)
const form = reactive({ title: '', imageUrl: '', description: '', tagsRaw: '' })

const baseId = useId()
const ids = {
  title: `${baseId}-title`,
  titleInput: `${baseId}-title-input`,
  url: `${baseId}-url`,
  description: `${baseId}-description`,
  tags: `${baseId}-tags`
}

const showPreview = computed(() => /^https?:\/\/.+/i.test(form.imageUrl.trim()) && !previewError.value)

watch(
  () => form.imageUrl,
  () => {
    previewError.value = false
  }
)

onMounted(() => {
  dialogRef.value?.showModal()
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function close(): void {
  dialogRef.value?.close()
}

function closeOnBackdrop(event: MouseEvent): void {
  if (event.target === dialogRef.value) close()
}

function submit(): void {
  if (!form.title.trim()) return
  store.addCard({
    title: form.title,
    imageUrl: form.imageUrl,
    description: form.description,
    tags: parseTagInput(form.tagsRaw)
  })
  close()
}
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.modal {
  margin: auto;
  padding: 0;
  background: $surface;
  border: 1px solid $border-hover;
  border-radius: 8px;
  color: $text-primary;
  width: calc(100% - 32px);
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 60px -30px $accent-glow;

  &::backdrop {
    background: rgba(5, 4, 4, 0.7);
    backdrop-filter: blur(3px);
  }

  &[open] {
    animation: modal-in 220ms $ease;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0;
}

.modal__heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal__lamp {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 8px $accent;
}

.modal__title {
  font-family: $font-mono;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $text-primary;
}

.modal__close {
  font-size: 22px;
  color: $text-secondary;
  line-height: 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: color $duration $ease, background $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
    background: $surface-2;
  }
}

.modal__body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal__label {
  font-size: 11px;
  font-family: $font-mono;
  letter-spacing: 0.06em;
  color: $text-secondary;
}

.modal__hint {
  color: $text-muted;
}

.modal__input {
  background: $bg;
  border: 1px solid $border;
  border-radius: $radius;
  padding: 10px 12px;
  font-size: 13px;
  color: $text-primary;
  width: 100%;
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

.modal__preview {
  margin-top: 4px;
  padding: 10px 6px;
  border-radius: $radius;
  background: $film;

  img {
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: cover;
  }
}

.modal__error {
  font-size: 12px;
  color: $danger;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 20px 20px;
}

.modal__btn {
  font-size: 12px;
  font-family: $font-mono;
  padding: 9px 18px;
  border: 1px solid $border;
  border-radius: 999px;
  transition: background $duration $ease, color $duration $ease, border-color $duration $ease, opacity $duration $ease;

  &--cancel {
    color: $text-secondary;
    background: transparent;

    &:hover,
    &:focus-visible {
      border-color: $border-hover;
      color: $text-primary;
    }
  }

  &--submit {
    background: $accent;
    border-color: $accent;
    color: #fff;

    &:hover,
    &:focus-visible {
      opacity: 0.88;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal[open] {
    animation: none;
  }
}
</style>