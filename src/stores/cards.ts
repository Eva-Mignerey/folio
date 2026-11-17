import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Card, CardUpdate, FolioExport, NewCard } from '../types'

const STORAGE_KEY = 'folio-cards'
const EXPORT_VERSION = '2.0'
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
    description: typeof raw.description === 'string' ? raw.description.trim() : '',
    tags: normalizeTags(raw.tags),
    createdAt: typeof raw.createdAt === 'number' && Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
  }
}

export function parseImport(text: string): Card[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Fichier JSON invalide.')
  }
  const list = Array.isArray(data) ? data : isRecord(data) ? data.cards : null
  if (!Array.isArray(list)) throw new Error('Format non reconnu : aucune liste de cartes trouvée.')
  return list
    .map(item => sanitizeCard(item))
    .filter((card): card is Card => card !== null)
    .map(card => ({ ...card, id: crypto.randomUUID() }))
}

export function filterCards(cards: Card[], tag: string | null, query: string): Card[] {
  const q = query.trim().toLowerCase()
  return cards.filter(card => {
    if (tag && !card.tags.includes(tag)) return false
    if (!q) return true
    return (
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tags.some(t => t.includes(q))
    )
  })
}

function defaultCards(): Card[] {
  const now = Date.now()
  const samples: Array<[string, string, string, string[], number]> = [
    ['Laos', 'https://images.pexels.com/photos/31495556/pexels-photo-31495556.jpeg?w=600', 'Paysage brumeux sur le Mékong.', ['voyage', 'nature', 'asie'], 3],
    ['Immeubles urbains', 'https://images.pexels.com/photos/34760024/pexels-photo-34760024.jpeg?w=600', 'Vue aérienne d’un quartier en brique rouge.', ['archi', 'ville', 'urbain'], 2],
    ['Canard', 'https://images.pexels.com/photos/4488850/pexels-photo-4488850.jpeg?w=600', 'Portrait d’un petit canard nageant dans l’eau.', ['nature', 'animal', 'photo'], 1],
    ['Arc de Triomphe', 'https://images.pexels.com/photos/37220082/pexels-photo-37220082.jpeg?w=600', 'L’Arc de Triomphe sous ciel bleu.', ['paris', 'archi', 'photo'], 0],
    ['Panda géant', 'https://images.pexels.com/photos/31097582/pexels-photo-31097582.jpeg?w=600', 'Portrait d’un panda géant mangeant du bambou.', ['animal', 'nature', 'asie'], 4],
    ['Ours polaire', 'https://images.pexels.com/photos/53425/polar-bear-arctic-wildlife-snow-53425.jpeg?w=600', 'Ours polaire dans la neige arctique.', ['animal', 'nature', 'arctique'], 5],
    ['Perroquet éclectus', 'https://images.pexels.com/photos/7722506/pexels-photo-7722506.jpeg?w=600', 'Portrait d’un petit perroquet au plumage vert.', ['animal', 'oiseau', 'nature'], 6]
  ]
  return samples.map(([title, imageUrl, description, tags, daysAgo]) => ({
    id: crypto.randomUUID(),
    title,
    imageUrl,
    description,
    tags,
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
  const saveError = ref(false)

  const filteredCards = computed(() => filterCards(cards.value, activeTag.value, searchQuery.value))

  const allTags = computed(() =>
    [...new Set(cards.value.flatMap(card => card.tags))].sort((a, b) => a.localeCompare(b, 'fr'))
  )

  function addCard(input: NewCard): Card {
    const card: Card = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      imageUrl: cleanUrl(input.imageUrl),
      description: input.description.trim(),
      tags: normalizeTags(input.tags),
      createdAt: Date.now()
    }
    cards.value.unshift(card)
    return card
  }

  function updateCard(id: string, updates: CardUpdate): void {
    const index = cards.value.findIndex(card => card.id === id)
    if (index === -1) return
    const current = cards.value[index]
    cards.value[index] = {
      ...current,
      title: updates.title?.trim() || current.title,
      imageUrl: updates.imageUrl !== undefined ? cleanUrl(updates.imageUrl) : current.imageUrl,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      tags: updates.tags !== undefined ? normalizeTags(updates.tags) : current.tags
    }
  }

  function deleteCard(id: string): Card | null {
    const index = cards.value.findIndex(card => card.id === id)
    if (index === -1) return null
    const [removed] = cards.value.splice(index, 1)
    return removed ?? null
  }

  function setTag(tag: string | null): void {
    activeTag.value = activeTag.value === tag ? null : tag
  }

  function buildExport(): FolioExport {
    return {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      source: 'Folio',
      cards: cards.value
    }
  }

  function importCards(text: string): number {
    const incoming = parseImport(text)
    cards.value = [...incoming, ...cards.value]
    return incoming.length
  }

  watch(allTags, tags => {
    if (activeTag.value && !tags.includes(activeTag.value)) activeTag.value = null
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
    saveError,
    filteredCards,
    allTags,
    addCard,
    updateCard,
    deleteCard,
    setTag,
    buildExport,
    importCards
  }
})