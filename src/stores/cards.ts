import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Card, CardUpdate, ExportedCard, FolioExport, NewCard } from '../types'
import { dataUrlToBlob, deleteImage, getImageDataUrl, isImageDataUrl, saveImage } from '../lib/imageStore'

const STORAGE_KEY = 'folio-cards'
const EXPORT_VERSION = '3.0'
const DAY = 86_400_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function cleanUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const url = value.trim()
  return /^https?:\/\//i.test(url) ? url : ''
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const clean = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(clean)]
}

export function parseTagInput(raw: string): string[] {
  return normalizeTags(raw.split(','))
}

export function sanitizeCard(raw: unknown): Card | null {
  if (!isRecord(raw)) return null
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return null
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    title,
    imageUrl: cleanUrl(raw.imageUrl),
    imageId: typeof raw.imageId === 'string' ? raw.imageId : '',
    description: typeof raw.description === 'string' ? raw.description.trim() : '',
    tags: normalizeTags(raw.tags),
    selected: raw.selected === true,
    createdAt: typeof raw.createdAt === 'number' && Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
  }
}

export interface ParsedCard {
  card: Card
  imageData: string | null
}

export function parseImport(text: string): ParsedCard[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Fichier JSON invalide.')
  }
  const list = Array.isArray(data) ? data : isRecord(data) ? data.cards : null
  if (!Array.isArray(list)) throw new Error('Format non reconnu : aucune liste de cartes trouvée.')
  return list.flatMap(item => {
    const card = sanitizeCard(item)
    if (!card) return []
    const imageData = isRecord(item) && isImageDataUrl(item.imageData) ? item.imageData : null
    return [{ card: { ...card, id: crypto.randomUUID(), imageId: '' }, imageData }]
  })
}

export function filterCards(cards: Card[], tag: string | null, query: string, selectionOnly = false): Card[] {
  const q = query.trim().toLowerCase()
  return cards.filter(card => {
    if (selectionOnly && !card.selected) return false
    if (tag && !card.tags.includes(tag)) return false
    if (!q) return true
    return (
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tags.some(t => t.includes(q))
    )
  })
}

export function frameLabel(position: number): string {
  return `${String(position).padStart(2, '0')}A`
}

function defaultCards(): Card[] {
  const now = Date.now()
  const samples: Array<[string, string, string, string[], number, boolean]> = [
    ['Laos', 'https://images.pexels.com/photos/31495556/pexels-photo-31495556.jpeg?w=600', 'Paysage brumeux sur le Mékong.', ['voyage', 'nature', 'asie'], 3, true],
    ['Immeubles urbains', 'https://images.pexels.com/photos/34760024/pexels-photo-34760024.jpeg?w=600', 'Vue aérienne d’un quartier en brique rouge.', ['archi', 'ville', 'urbain'], 2, false],
    ['Canard', 'https://images.pexels.com/photos/4488850/pexels-photo-4488850.jpeg?w=600', 'Portrait d’un petit canard nageant dans l’eau.', ['nature', 'animal', 'photo'], 1, false],
    ['Arc de Triomphe', 'https://images.pexels.com/photos/37220082/pexels-photo-37220082.jpeg?w=600', 'L’Arc de Triomphe sous ciel bleu.', ['paris', 'archi', 'photo'], 0, false],
    ['Panda géant', 'https://images.pexels.com/photos/31097582/pexels-photo-31097582.jpeg?w=600', 'Portrait d’un panda géant mangeant du bambou.', ['animal', 'nature', 'asie'], 4, false],
    ['Ours polaire', 'https://images.pexels.com/photos/53425/polar-bear-arctic-wildlife-snow-53425.jpeg?w=600', 'Ours polaire dans la neige arctique.', ['animal', 'nature', 'arctique'], 5, true],
    ['Perroquet éclectus', 'https://images.pexels.com/photos/7722506/pexels-photo-7722506.jpeg?w=600', 'Portrait d’un petit perroquet au plumage vert.', ['animal', 'oiseau', 'nature'], 6, false]
  ]
  return samples.map(([title, imageUrl, description, tags, daysAgo, selected]) => ({
    id: crypto.randomUUID(),
    title,
    imageUrl,
    imageId: '',
    description,
    tags,
    selected,
    createdAt: now - daysAgo * DAY
  }))
}

function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return defaultCards()
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return defaultCards()
    return data
      .map(item => sanitizeCard(item))
      .filter((card): card is Card => card !== null)
  } catch {
    return defaultCards()
  }
}

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<Card[]>(loadCards())
  const searchQuery = ref('')
  const activeTag = ref<string | null>(null)
  const selectionOnly = ref(false)
  const saveError = ref(false)

  const filteredCards = computed(() =>
    filterCards(cards.value, activeTag.value, searchQuery.value, selectionOnly.value)
  )

  const allTags = computed(() =>
    [...new Set(cards.value.flatMap(card => card.tags))].sort((a, b) => a.localeCompare(b, 'fr'))
  )

  const selectedCount = computed(() => cards.value.filter(card => card.selected).length)

  const frameLabels = computed(() => {
    const ordered = [...cards.value].sort((a, b) => a.createdAt - b.createdAt)
    return new Map(ordered.map((card, index) => [card.id, frameLabel(index + 1)]))
  })

  function addCard(input: NewCard): Card {
    const card: Card = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      imageUrl: input.imageId ? '' : cleanUrl(input.imageUrl),
      imageId: input.imageId,
      description: input.description.trim(),
      tags: normalizeTags(input.tags),
      selected: false,
      createdAt: Date.now()
    }
    cards.value.unshift(card)
    return card
  }

  function updateCard(id: string, updates: CardUpdate): void {
    const index = cards.value.findIndex(card => card.id === id)
    if (index === -1) return
    const current = cards.value[index]
    const imageId = updates.imageId ?? current.imageId
    if (current.imageId && imageId !== current.imageId) void deleteImage(current.imageId)
    cards.value[index] = {
      ...current,
      title: updates.title?.trim() || current.title,
      imageId,
      imageUrl: imageId ? '' : updates.imageUrl !== undefined ? cleanUrl(updates.imageUrl) : current.imageUrl,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      tags: updates.tags !== undefined ? normalizeTags(updates.tags) : current.tags,
      selected: updates.selected ?? current.selected
    }
  }

  function toggleSelected(id: string): void {
    const card = cards.value.find(item => item.id === id)
    if (card) card.selected = !card.selected
  }

  function deleteCard(id: string): Card | null {
    const index = cards.value.findIndex(card => card.id === id)
    if (index === -1) return null
    const [removed] = cards.value.splice(index, 1)
    if (removed?.imageId) void deleteImage(removed.imageId)
    return removed ?? null
  }

  function setTag(tag: string | null): void {
    activeTag.value = activeTag.value === tag ? null : tag
  }

  function toggleSelectionOnly(): void {
    selectionOnly.value = !selectionOnly.value
  }

  async function buildExport(): Promise<FolioExport> {
    const exported = await Promise.all(
      cards.value.map(async (card): Promise<ExportedCard> => {
        if (!card.imageId) return { ...card }
        const imageData = await getImageDataUrl(card.imageId)
        return imageData ? { ...card, imageData } : { ...card, imageId: '' }
      })
    )
    return {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      source: 'Folio',
      cards: exported
    }
  }

  async function importCards(text: string): Promise<number> {
    const parsed = parseImport(text)
    const incoming: Card[] = []
    for (const { card, imageData } of parsed) {
      if (!imageData) {
        incoming.push(card)
        continue
      }
      try {
        const imageId = await saveImage(await dataUrlToBlob(imageData))
        incoming.push({ ...card, imageId, imageUrl: '' })
      } catch {
        incoming.push(card)
      }
    }
    cards.value = [...incoming, ...cards.value]
    return incoming.length
  }

  watch(allTags, tags => {
    if (activeTag.value && !tags.includes(activeTag.value)) activeTag.value = null
  })

  watch(selectedCount, count => {
    if (count === 0) selectionOnly.value = false
  })

  watch(
    cards,
    value => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        saveError.value = false
      } catch {
        saveError.value = true
      }
    },
    { deep: true }
  )

  return {
    cards,
    searchQuery,
    activeTag,
    selectionOnly,
    saveError,
    filteredCards,
    allTags,
    selectedCount,
    frameLabels,
    addCard,
    updateCard,
    toggleSelected,
    deleteCard,
    setTag,
    toggleSelectionOnly,
    buildExport,
    importCards
  }
})