<template>
  <dialog ref="dialogRef" class="modal" :aria-labelledby="ids.title" @close="emit('close')" @click="closeOnBackdrop">
    <form class="modal__inner" @submit.prevent="submit">
      <div class="modal__header">
        <h2 :id="ids.title" class="modal__title">Nouvelle carte</h2>
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
  background: $bg;
  border: 1px solid $border-hover;
  color: $text-primary;
  width: calc(100% - 32px);
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;

  &::backdrop {
    background: rgba(42, 42, 38, 0.4);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0;
}

.modal__title {
  font-size: 15px;
  font-weight: 500;
  color: $text-primary;
}

.modal__close {
  font-size: 22px;
  color: $text-secondary;
  line-height: 1;
  width: 32px;
  height: 32px;
  transition: color $duration $ease;

  &:hover,
  &:focus-visible {
    color: $text-primary;
  }
}

.modal__body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.modal__label {
  font-size: 12px;
  font-family: $font-mono;
  color: $text-secondary;
}

.modal__hint {
  color: $text-muted;
}

.modal__input {
  background: $surface;
  border: 1px solid $border;
  padding: 9px 11px;
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
  margin-top: 6px;
  border: 1px solid $border;
  overflow: hidden;

  img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
}

.modal__error {
  font-size: 12px;
  color: #c0392b;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 20px 18px;
}

.modal__btn {
  font-size: 13px;
  font-family: $font-mono;
  padding: 8px 16px;
  border: 1px solid $border;
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
    background: $text-primary;
    border-color: $text-primary;
    color: $bg;

    &:hover,
    &:focus-visible {
      opacity: 0.85;
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
}
</style>