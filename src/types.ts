export interface Card {
  id: string
  title: string
  imageUrl: string
  description: string
  tags: string[]
  createdAt: number
}

export type NewCard = Omit<Card, 'id' | 'createdAt'>

export type CardUpdate = Partial<NewCard>

export interface FolioExport {
  version: string
  exportedAt: string
  source: 'Folio'
  cards: Card[]
}