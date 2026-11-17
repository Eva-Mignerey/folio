export interface Card {
  id: string
  title: string
  imageUrl: string
  description: string
  tags: string[]
  selected: boolean
  createdAt: number
}

export type NewCard = Omit<Card, 'id' | 'createdAt' | 'selected'>

export type CardUpdate = Partial<Omit<Card, 'id' | 'createdAt'>>

export interface FolioExport {
  version: string
  exportedAt: string
  source: 'Folio'
  cards: Card[]
}